import React from 'react';
import Federer from './federer';
import '../app/app.css'
import { useTranslation } from '../i18n/dictionary';

function AboutMe() {
  const t = useTranslation();
  const interests = [
    t.about.interests.tennis,
    t.about.interests.climbing,
    t.about.interests.swimming,
    t.about.interests.running,
    t.about.interests.chess,
    t.about.interests.videoGames,
    t.about.interests.sudoku,
    t.about.interests.code,
  ];

  function TennisBallAnim() {
    document.getElementById('tennisball').classList.add('ball')
    setTimeout(() => { document.querySelector('.btn_federer').style.animation = 'endBtnFederer_pt1 .3s ease-in-out both' }, 1200)
  }

  return (
      <div className="container h-5/6">
        <div className='absolute w-5/6 h-5/6'>
          <div id="tennisball" className='z-50'></div>
        </div>
        <div className='columns-1 lg:columns-2 h-full'>
          <div className='h-1/2 lg:h-full'>
            <div className='h-1/6 flex justify-center items-center'>
              <h1 className='outlined-text'>{t.about.title}</h1>
            </div>
            <div className='h-5/6 p-10'>
              <p>{t.about.tennisIntro}<strong style={{ color: 'var(--my-blue)' }}>{t.about.tennisWord}</strong>{t.about.tennisOutro}</p>
              <br></br>
              <p>{t.about.tournaments}</p>
              <br></br>
              <p>{t.about.otherSports}</p>
              <ul className='mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4' aria-label={t.about.interestsLabel}>
                {interests.map((interest) => (
                  <li key={interest} className='flex flex-col items-center gap-2 text-center'>
                    <span
                      aria-hidden='true'
                      className='h-12 w-12 rounded-full border border-second bg-surface'
                    />
                    <span className='text-sm text-second-text'>{interest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='h-1/2 lg:h-full flex flex-col items-center justify-center'>
            <button onClick={TennisBallAnim} className='btn_federer mb-10 p-2 rounded-lg hidden xl:block'>{t.about.pushButton}</button>
            <Federer />
          </div>
        </div>
      </div>
  );
}

export default AboutMe;