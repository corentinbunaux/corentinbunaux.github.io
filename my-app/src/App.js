import React from 'react';
import Homepage from './components/homepage';
import Navbar from './components/navbar';
import ProfileSection from './components/profileSection';
import './styles/app.css';
import AboutMe from './components/aboutmeSection';
import ProjectsSection from './components/projectsSection';
import Footer from './components/footer';


function App() {
  return (
  <React.Fragment>
    <Navbar />
    <section id='home'>
      <Homepage />
    </section>
    <section id='profile'>
      <ProfileSection />
    </section>
    <section id='portfolio'>
      <ProjectsSection />
    </section>
    <section id='about'>
      <AboutMe />
    </section>
    <Footer/>
  </React.Fragment>
  );
}

export default App;
