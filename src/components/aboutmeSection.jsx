import React from 'react';
import Federer from './federer';
import '../app/app.css'

function AboutMe() {
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
              <h1 className='outlined-text'>À propos</h1>
            </div>
            <div className='h-5/6 p-10'>
              <p>J'ai pratiqué le <strong style={{ color: 'var(--my-blue)' }}>TENNIS</strong> depuis que je suis enfant. J'ai eu l'opportunité d'entraîner des groupes d'élèves lors d'évènements compétitifs.</p>
              <br></br>
              <p>Pendant dix ans, ma constante participation à des tournois a renforcé ma persévérance et mon esprit de compétition de manière significative.</p>
              <br></br>
              <p>Depuis peu, je pratique d'autres sports tels que l'escalade, la natation ou la course à pieds.</p>
            </div>
          </div>
          <div className='h-1/2 lg:h-full flex flex-col items-center justify-center'>
            <button onClick={TennisBallAnim} className='btn_federer mb-10 p-2 rounded-lg hidden xl:block'>PUSH !</button>
            <Federer />
          </div>
        </div>
      </div>
  );
}

export default AboutMe;