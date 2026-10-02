import React, { useRef, useState } from 'react';
import Federer from './federer';
import '../app/app.css'
import { useTranslation } from '../i18n/dictionary';
import { Clapperboard, Code, Crown, Footprints, Gamepad2, Mountain, Waves } from 'lucide-react';

// Final horizontal offset of @keyframes ball_path, in ball widths (3230%).
const BALL_PATH_END_X = 32.3;
// federer.jsx draws in a 64x64 viewBox; the racket strings are centred here.
const FEDERER_VIEWBOX = 64;
const RACKET_CENTER = { x: 46.15, y: 8.43 };

function TennisBallIcon(props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M5 4.9a10 10 0 0 1 0 14.2' />
      <path d='M19 4.9a10 10 0 0 0 0 14.2' />
    </svg>
  );
}

function InterestList({ labelId, label, items, archived }) {
  return (
    <div className='mt-6'>
      <p id={labelId} className='text-sm font-semibold uppercase tracking-wider text-second-text'>
        {label}
      </p>
      <ul aria-labelledby={labelId} className='mt-3 grid grid-cols-2 gap-6 sm:grid-cols-4'>
        {items.map(({ label: itemLabel, Icon }) => (
          <li key={itemLabel} className='flex flex-col items-center gap-2 text-center'>
            <span
              aria-hidden='true'
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                archived
                  ? 'border-dashed border-second-text text-second-text'
                  : 'border-second bg-surface text-my-green'
              }`}
            >
              <Icon className='h-6 w-6' />
            </span>
            <span className='text-sm text-second-text'>{itemLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AboutMe() {
  const t = useTranslation();
  const activeInterests = [
    { label: t.about.interests.tennis, Icon: TennisBallIcon },
    { label: t.about.interests.running, Icon: Footprints },
    { label: t.about.interests.moviesMusic, Icon: Clapperboard },
    { label: t.about.interests.code, Icon: Code },
  ];
  const archivedInterests = [
    { label: t.about.interests.swimming, Icon: Waves },
    { label: t.about.interests.climbing, Icon: Mountain },
    { label: t.about.interests.chess, Icon: Crown },
    { label: t.about.interests.videoGames, Icon: Gamepad2 },
  ];

  // idle -> flying (ball on its way) -> hit (player swings, button leaves).
  const [phase, setPhase] = useState('idle');
  const [aim, setAim] = useState(null);
  const trackRef = useRef(null);
  const federerRef = useRef(null);

  function pushBall() {
    if (phase !== 'idle') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('hit');
      return;
    }
    const track = trackRef.current.getBoundingClientRect();
    const svg = federerRef.current.getBoundingClientRect();
    const ballSize = 2.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    // Where ball_path leaves the ball's centre: translate(3230%, 0%) of its
    // own size, from its resting box (left edge, top: 50% of the track).
    const endX = track.left + BALL_PATH_END_X * ballSize + ballSize / 2;
    const endY = track.top + track.height / 2 + ballSize / 2;
    // Centre of the racket strings, viewBox units -> pixels (square viewBox).
    const scale = svg.width / FEDERER_VIEWBOX;
    const targetX = svg.left + RACKET_CENTER.x * scale;
    const targetY = svg.top + RACKET_CENTER.y * scale;
    setAim({ x: targetX - endX, y: targetY - endY });
    setPhase('flying');
  }

  function onBallAnimationEnd(event) {
    if (event.target === event.currentTarget && event.animationName === 'ball_path') {
      setPhase('hit');
    }
  }

  return (
      <div className="container h-auto lg:h-5/6">
        <div ref={trackRef} className='absolute w-5/6 h-5/6'>
          {/* The wrapper adds a linear correction to ball_path so the ball
              ends on the racket whatever the viewport width. */}
          <div
            className={`pointer-events-none absolute inset-0 z-50 ${aim ? 'ball-aim' : ''}`}
            style={aim ? { '--ball-aim-x': `${aim.x}px`, '--ball-aim-y': `${aim.y}px` } : undefined}
          >
            <div
              className={`z-50 ${aim ? 'ball' : ''} ${phase === 'hit' && aim ? 'ball-struck' : ''}`}
              onAnimationEnd={onBallAnimationEnd}
            ></div>
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-full gap-10 lg:gap-0'>
          <div className='h-auto lg:h-full'>
            <div className='h-auto lg:h-1/6 flex justify-center items-center'>
              <h1 className='outlined-text'>{t.about.title}</h1>
            </div>
            <div className='h-auto lg:h-5/6 p-10'>
              <p>{t.about.tennisIntro}<strong style={{ color: 'var(--my-blue)' }}>{t.about.tennisWord}</strong>{t.about.tennisOutro}</p>
              <br></br>
              <p>{t.about.tournaments}</p>
              <br></br>
              <p>{t.about.otherSports}</p>
              <div role='group' aria-label={t.about.interestsLabel}>
                <InterestList
                  labelId='interests-active'
                  label={t.about.activeLabel}
                  items={activeInterests}
                  archived={false}
                />
                <InterestList
                  labelId='interests-archived'
                  label={t.about.archivedLabel}
                  items={archivedInterests}
                  archived
                />
              </div>
            </div>
          </div>
          <div className='h-auto lg:h-full flex flex-col items-center justify-center'>
            <button
              onClick={pushBall}
              className={`btn_federer mb-10 p-2 rounded-lg hidden xl:block ${phase === 'hit' ? 'btn_federer-done' : ''}`}
            >
              {t.about.pushButton}
            </button>
            <div className={`flex w-full justify-center ${phase === 'hit' ? 'federer-swing' : ''}`}>
              <Federer ref={federerRef} />
            </div>
          </div>
        </div>
      </div>
  );
}

export default AboutMe;