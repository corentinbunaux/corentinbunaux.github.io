import React from 'react';
import Homepage from './components/homepage';
import Navbar from './components/navbar';
import ProfileSection from './components/profileSection';
import './styles/app.css';
import AboutMe from './components/aboutmeSection';
import ProjectsSection from './components/projectsSection';
import Footer from './components/footer';
import { useState, useEffect } from 'react';


function App() {
  const [allTops, setAllTops] = useState({
    homepageTop: 0,
    profileTop: 0,
    portfolioTop: 0,
    aboutTop: 0,
  });

  useEffect(() => {
    const updateTops = () => {
      setAllTops({
        homepageTop: document.getElementById('home').offsetTop,
        profileTop: document.getElementById('profile').offsetTop,
        portfolioTop: document.getElementById('portfolio').offsetTop,
        aboutTop: document.getElementById('about').offsetTop,
      });
    };

    updateTops();

    window.addEventListener('resize', updateTops);

    return () => {
      window.removeEventListener('resize', updateTops);
    };
  }, []);

  const [tab, setTab] = useState('full-portfolio');

  useEffect(() => {
    if (tab !== 'full-portfolio') {
      const preventDefault = (e) => e.preventDefault();
      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });
      window.addEventListener('keydown', (e) => {
        // Prevent scrolling with arrow keys, spacebar, and page up/down
        if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown'].includes(e.code)) {
          preventDefault(e);
        }
      }, { passive: false });

      return () => {
        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
        window.removeEventListener('keydown', preventDefault);
      };
    }
  }, [tab]);

  return (
    <React.Fragment>
      <Navbar allTops={allTops} />
      <section id='home'>
        <Homepage />
      </section>
      <section id='profile'>
        <ProfileSection portfolioTop={allTops.portfolioTop}/>
      </section>
      <section id='portfolio'>
        <ProjectsSection tab={tab} setTab={setTab} />
      </section>
      <section id='about'>
        <AboutMe />
      </section>
      <section id='footer'>
        <Footer />
      </section>
    </React.Fragment>
  );
}

export default App;
