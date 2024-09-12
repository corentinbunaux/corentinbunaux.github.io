import React from 'react';
import Federer from './federer';

function AboutMe() {
  function TennisBallAnim(){
    document.getElementById('tennisball').classList.add('ball')
    setTimeout(()=>{document.querySelector('.btn_federer').style.animation = 'endBtnFederer_pt1 .3s ease-in-out both'},1200)
}

  return (
    <section id="aboutme" className="flex justify-center items-center aboutme">
      <div className="container h-5/6">
      <div className='absolute w-5/6 h-5/6'>
        <div id="tennisball" className='z-50'></div>
      </div>
        <div className='columns-1 lg:columns-2 h-full'>
          <div className='h-1/2 lg:h-full'>
              <div className='h-1/6 flex justify-center items-center'>
                  <h1>About Me</h1>
              </div>
              <div className='h-5/6 p-10'>
                  <p>I've played <strong className='text-blue-text'>TENNIS</strong> since I was a child. I've had the opportunity to coach groups of students during competitive events.</p>
                  <br></br>
                  <p>Over a decade, my consistent participation in tournaments have significantly strengthened my perseverance and competitive spirit.</p>
                  <br></br>
                  <p>Indeed, my programming interest is fuelled by a curiosity for emerging tools in the tech world.</p>    
              </div>
          </div>
          <div className='h-1/2 lg:h-full flex flex-col items-center justify-center'>
          <button onClick={TennisBallAnim} className='btn_federer mb-10 p-2 rounded-lg hidden xl:block'>PUSH !</button>
            <Federer/>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;