import React from 'react';
import Homepage from './components/homepage';
import Navbar from './components/navbar';
import ProfileSection from './components/profileSection';
import './styles/app.css';
import AboutMe from './components/aboutmeSection';
import ProjectsSection from './components/projectsSection';
import Footer from './components/footer';
import { useState, useEffect } from 'react';


function App(props) {

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

  useEffect(() => {
    if (performance.navigation.type === 1) {
      window.location.href = '/';
    }
  }, []);

  return (
    <React.Fragment>
      <Navbar allTops={allTops} />
      <section id='home'>
        <Homepage />
      </section>
      <section id='profile'>
        <ProfileSection portfolioTop={allTops.portfolioTop} />
      </section>
      <section id='portfolio'>
        <ProjectsSection scrollY={window.scrollY} />
      </section>
      <section id='about' className='flex justify-center items-center'>
        <AboutMe />
      </section>
      <section id='footer'>
        <Footer />
      </section>
    </React.Fragment>
  );
}

export default App;
