#!/usr/bin/env node
/**
 * passation-brief.mjs (project scope, SessionStart)
 *
 * Pulls the two lines that matter out of PASSATION.md - the objective and the
 * next step - and puts them in front of Claude straight away, so a new session
 * starts oriented without anyone having to remember to ask.
 *
 * Fails open: prints {} on any problem.
 */
import fs from 'node:fs';
import path from 'node:path';

function section(md, heading) {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'im');
  const m = re.exec(md);
  if (!m) return null;
  const rest = md.slice(m.index + m[0].length);
  const end = rest.search(/^##\s+/m);
  const body = (end === -1 ? rest : rest.slice(0, end)).trim();
  if (!body || body.startsWith('{{')) return null;
  return body.replace(/^>.*$/gm, '').trim();
}

function main() {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const file = path.join(root, 'PASSATION.md');
  if (!fs.existsSync(file)) return process.stdout.write('{}');
  const md = fs.readFileSync(file, 'utf8');

  const header = (md.match(/^\*\*Session\*\*:.*$/m) || [''])[0].replace(/\*\*/g, '');
  const objective = section(md, 'Objective');
  const next = section(md, 'Next step');
  const failed = section(md, 'What failed');
  const dont = section(md, 'Do not');

  const bits = [];
  if (header) bits.push(header);
  if (objective) bits.push(`Previous objective: ${objective}`);
  if (next) bits.push(`Next step recorded: ${next}`);
  if (failed) bits.push(`Already failed (do not retry as-is): ${failed.slice(0, 600)}`);
  if (dont) bits.push(`Do not: ${dont.slice(0, 300)}`);
  if (!bits.length) return process.stdout.write('{}');

  bits.push('Read PASSATION.md in full before acting if you are continuing this work.');

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `[handover] ${bits.join('\n')}`,
    },
  }));
}

try { main(); } catch { process.stdout.write('{}'); }
