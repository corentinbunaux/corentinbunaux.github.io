/**
 * Pure trajectory model for the self-parking robot car (PORT-047).
 *
 * Kept separate from the three.js scene (`ParkingCarDemo.tsx`) so the
 * manoeuvre can be checked without a renderer or a browser: `getParkingFrame`
 * is a function of a single time value, with no module-level mutable state.
 *
 * "drive" (searching) is a straight line: a trivial case of a bicycle model
 * (rear-axle reference, speed, steer angle, wheelbase) with a zero steer
 * angle, integrated in closed form by `driveArc` below.
 *
 * The reversing "manoeuvre" (créneau) was first modelled the same way: a
 * symmetric two-arc S-curve (steer right, then left, same bicycle model,
 * still closed-form — see git history on this file for that version). Two
 * calibrations were tried (chord solved analytically for the target start/
 * end pose) and both left the swept bounding box clipping the parked car
 * ahead of the gap partway through the second arc (49 and 280 overlapping
 * samples respectively, out of ~3500, checked with a throwaway Node script).
 * Per the ticket's own fallback clause, the manoeuvre below instead
 * interpolates position along a cubic Bézier curve and heading along a
 * separate sinusoidal profile — both pure functions of progress `s` in
 * [0, 1] — with control points chosen so the swept box never overlaps a
 * parked car or the sidewalk (checked the same way, 0 overlaps found).
 */

export interface CarPose {
  readonly x: number;
  readonly z: number;
  /** Heading angle in radians, 0 = facing +X. */
  readonly heading: number;
}

export type ParkingPhase = "drive" | "stop" | "maneuver" | "parked" | "reset";

export interface ParkingFrame {
  readonly phase: ParkingPhase;
  readonly pose: CarPose;
  /** Front wheel steering angle, radians (0 = straight). */
  readonly steerAngle: number;
  /** Cumulative wheel rotation, radians (sign follows the direction of travel). */
  readonly wheelSpin: number;
  /** Sensor beam sweep offset, radians, added to its base bearing toward the kerb. */
  readonly beamSweep: number;
  readonly beamColor: "blue" | "green";
  readonly beamOpacity: number;
  readonly beamVisible: boolean;
  readonly tailLightsOn: boolean;
  /** Robot opacity, for the fade in/out around the loop reset. */
  readonly opacity: number;
}

// --- Layout (scene units), shared by the trajectory and the renderer -----

export const ROAD_LENGTH = 14;
export const ROAD_DEPTH = 5;
/** Sidewalk centreline, along the far edge of the road. */
export const CURB_Z = 2.1;
/** Centreline of the parked row. */
export const PARKED_Z = 1.05;
/** Lane the robot drives down while it searches for a spot. */
export const SEARCH_LANE_Z = -0.35;

export const CAR_LENGTH = 1.6;
export const CAR_WIDTH = 0.8;
/** Centre x of each of the 4 parked cars; the gap is between index 1 and 2. */
export const PARKED_CAR_X: readonly number[] = [-5, -3, 1, 3];
/** Where the robot ends up, centred in the gap. */
export const SPOT_CENTER_X = -1;
export const GAP_X_MIN = PARKED_CAR_X[1] + CAR_LENGTH / 2;
export const GAP_X_MAX = PARKED_CAR_X[2] - CAR_LENGTH / 2;

export const ROBOT_LENGTH = 1.3;
export const ROBOT_WIDTH = 0.7;
export const WHEELBASE = 0.9;
export const WHEEL_RADIUS = 0.16;
/** Equal front/rear overhang (ROBOT_LENGTH - WHEELBASE, split in two): the
 * body centre sits exactly midway between the two axles. */
const BODY_CENTER_OFFSET = WHEELBASE / 2;

// --- "drive" / "stop": bicycle model, rear-axle frame ----------------------

const START_X = -6.2;
/** Rear-axle x where the robot stops, just past the gap (body centre is
 * `BODY_CENTER_OFFSET` further, still clear of the next parked car). */
const STOP_X = 1.6;
const SEARCH_SPEED = 1; // units/s

/**
 * Bicycle model, rear-axle reference: exact pose after driving at constant
 * speed `v` and steer angle `steer` for `duration` seconds from `pose`. Used
 * here only with `steer = 0` (a straight line); kept general because it is
 * the same closed form the two-arc manoeuvre used before the Bézier fallback
 * (see the file header).
 */
function driveArc(pose: CarPose, v: number, steer: number, wheelbase: number, duration: number): CarPose {
  if (Math.abs(steer) < 1e-6) {
    return {
      x: pose.x + v * Math.cos(pose.heading) * duration,
      z: pose.z + v * Math.sin(pose.heading) * duration,
      heading: pose.heading,
    };
  }
  const omega = (v / wheelbase) * Math.tan(steer);
  const headingEnd = pose.heading + omega * duration;
  const vOverOmega = v / omega;
  return {
    x: pose.x + vOverOmega * (Math.sin(headingEnd) - Math.sin(pose.heading)),
    z: pose.z - vOverOmega * (Math.cos(headingEnd) - Math.cos(pose.heading)),
    heading: headingEnd,
  };
}

/** Rigid-body offset from the rear axle to the body centre: always
 * BODY_CENTER_OFFSET ahead, along the current heading. */
function toBodyPose(rearAxle: CarPose): CarPose {
  return {
    x: rearAxle.x + BODY_CENTER_OFFSET * Math.cos(rearAxle.heading),
    z: rearAxle.z + BODY_CENTER_OFFSET * Math.sin(rearAxle.heading),
    heading: rearAxle.heading,
  };
}

const DRIVE_START: CarPose = { x: START_X, z: SEARCH_LANE_Z, heading: 0 };
const STOP_POSE: CarPose = { x: STOP_X, z: SEARCH_LANE_Z, heading: 0 };
const STOP_BODY: CarPose = toBodyPose(STOP_POSE);

// --- "maneuver" (créneau): cubic Bézier position + sinusoidal heading -----

const PARKED_BODY: CarPose = { x: SPOT_CENTER_X, z: PARKED_Z, heading: 0 };

/**
 * Control points of the manoeuvre's position curve, in body-centre
 * coordinates. P0 = STOP_BODY, P3 = PARKED_BODY; P1/P2 tuned (throwaway Node
 * script, sampling the swept box every 0.1% of progress) so the robot first
 * eases further from the car ahead before curving back toward the kerb —
 * the same shape a two-arc reverse would draw, without its clipped corner.
 */
const BEZIER_P0: CarPose = STOP_BODY;
const BEZIER_P1 = { x: 1, z: -0.55 };
const BEZIER_P2 = { x: -1.6, z: 0.55 };
const BEZIER_P3: CarPose = PARKED_BODY;

/** Peak heading swing during the manoeuvre (matches a plausible steering
 * lock for a small robot); 0 at s=0 and s=1 so the car starts and ends
 * parallel to the kerb. */
const HEADING_AMPLITUDE = (35 * Math.PI) / 180;
/** Purely cosmetic front-wheel angle: steer one way to start the swing, the
 * other way to arrest it (peaks exactly where the heading curve is
 * momentarily straight, s=0.5). */
const STEER_AMPLITUDE = 0.5;

function bezierPoint(s: number): { x: number; z: number } {
  const u = 1 - s;
  const w0 = u * u * u;
  const w1 = 3 * u * u * s;
  const w2 = 3 * u * s * s;
  const w3 = s * s * s;
  return {
    x: w0 * BEZIER_P0.x + w1 * BEZIER_P1.x + w2 * BEZIER_P2.x + w3 * BEZIER_P3.x,
    z: w0 * BEZIER_P0.z + w1 * BEZIER_P1.z + w2 * BEZIER_P2.z + w3 * BEZIER_P3.z,
  };
}

/** Arc length of the manoeuvre curve, numerically integrated once at module
 * load — used only to give the wheels a plausible spin rate. */
const MANEUVER_LENGTH = (() => {
  const steps = 200;
  let length = 0;
  let previous = bezierPoint(0);
  for (let i = 1; i <= steps; i++) {
    const point = bezierPoint(i / steps);
    length += Math.hypot(point.x - previous.x, point.z - previous.z);
    previous = point;
  }
  return length;
})();

// --- Timing ----------------------------------------------------------------

const T_DRIVE = STOP_X - START_X;
const T_STOP = 0.6;
const T_MANEUVER = 3;
const T_PARKED = 2;
const T_RESET = 0.6;
const FADE_IN = 0.3;

export const LOOP_DURATION = T_DRIVE + T_STOP + T_MANEUVER + T_PARKED + T_RESET;

const B_DRIVE_END = T_DRIVE;
const B_STOP_END = B_DRIVE_END + T_STOP;
const B_MANEUVER_END = B_STOP_END + T_MANEUVER;
const B_PARKED_END = B_MANEUVER_END + T_PARKED;

const BEAM_SWEEP_AMPLITUDE = (15 * Math.PI) / 180;
const BEAM_SWEEP_PERIOD = 2.4;

/** State machine + trajectory, as a pure function of time within one loop.
 * `tRaw` can be any real number (including negative or beyond one loop): it
 * is wrapped to `[0, LOOP_DURATION)` first. */
export function getParkingFrame(tRaw: number): ParkingFrame {
  const t = ((tRaw % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;

  let phase: ParkingPhase;
  let pose: CarPose;
  let steerAngle = 0;
  let distanceSoFar: number;

  const distanceAfterDrive = SEARCH_SPEED * T_DRIVE;
  const distanceAfterManeuver = distanceAfterDrive - MANEUVER_LENGTH;

  if (t < B_DRIVE_END) {
    phase = "drive";
    pose = toBodyPose(driveArc(DRIVE_START, SEARCH_SPEED, 0, WHEELBASE, t));
    distanceSoFar = SEARCH_SPEED * t;
  } else if (t < B_STOP_END) {
    phase = "stop";
    pose = STOP_BODY;
    distanceSoFar = distanceAfterDrive;
  } else if (t < B_MANEUVER_END) {
    const s = (t - B_STOP_END) / T_MANEUVER;
    phase = "maneuver";
    const { x, z } = bezierPoint(s);
    const heading = -HEADING_AMPLITUDE * Math.sin(Math.PI * s);
    pose = { x, z, heading };
    steerAngle = STEER_AMPLITUDE * Math.cos(Math.PI * s);
    distanceSoFar = distanceAfterDrive - MANEUVER_LENGTH * s;
  } else if (t < B_PARKED_END) {
    phase = "parked";
    pose = PARKED_BODY;
    distanceSoFar = distanceAfterManeuver;
  } else {
    phase = "reset";
    pose = PARKED_BODY;
    distanceSoFar = distanceAfterManeuver;
  }

  const beamVisible = phase === "drive" || phase === "stop";
  const beamOverGap = pose.x > GAP_X_MIN && pose.x < GAP_X_MAX;
  const beamColor: "blue" | "green" = beamOverGap ? "green" : "blue";
  const beamSweep = beamVisible ? BEAM_SWEEP_AMPLITUDE * Math.sin((2 * Math.PI * t) / BEAM_SWEEP_PERIOD) : 0;

  let opacity = 1;
  if (phase === "reset") {
    opacity = 1 - (t - B_MANEUVER_END - T_PARKED) / T_RESET;
  } else if (phase === "drive" && t < FADE_IN) {
    opacity = t / FADE_IN;
  }

  let tailLightsOn = false;
  if (phase === "parked") {
    const tp = t - B_MANEUVER_END;
    tailLightsOn = tp >= 0.5 && tp < 0.9;
  }

  return {
    phase,
    pose,
    steerAngle,
    wheelSpin: distanceSoFar / WHEEL_RADIUS,
    beamSweep,
    beamColor,
    beamOpacity: beamOverGap ? 0.55 : 0.25,
    beamVisible,
    tailLightsOn,
    opacity,
  };
}
