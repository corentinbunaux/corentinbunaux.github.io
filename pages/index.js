import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import ProfileSection from '../components/body/profileSection'
import ProjectsSection from '../components/body/projectsSection'
import AboutmeSection from '../components/body/aboutmeSection'

export default function Website() {
  const [allTops ={profileTop : 0, portfolioTop : 0, aboutTop : 0}, setTop] = useState()
    // Vérifier si nous sommes du côté client
    const isClient = typeof window !== 'undefined';

    // Initialiser la valeur de scroll à partir de localStorage si disponible
    const initialScroll = isClient ? localStorage.getItem('scroll') === 'true' : false;
    const [scroll, setScroll] = useState(initialScroll);
  
    const updateScroll = (newValue) => {
      setScroll(newValue);
      // Enregistrer la nouvelle valeur de scroll dans localStorage si disponible
      if (isClient) {
        localStorage.setItem('scroll', newValue);
      }
    };
  
  const updateProfileTop = (topValue)=>{  
    setTop(allTops.profileTop = topValue);
  };
  const updatePortfolioTop = (topValue)=>{
    setTop(allTops.portfolioTop = topValue + allTops.profileTop);
  };
  const updateAboutTop = (topValue)=>{
    setTop(allTops.aboutTop = topValue + allTops.portfolioTop);
  };

  useEffect(()=>{
    console.log(scroll)
  },[scroll])

  return (
    <>
    <Head>
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>Portfolio Corentin BUNAUX</title>
    </Head>
    <Navbar onValueChange={updateProfileTop} allTops={allTops}/>
    <ProfileSection onValueChange={updatePortfolioTop}/>
    <ProjectsSection scroll={scroll} setScroll={setScroll} onValueChange={updateAboutTop}/>
    <AboutmeSection/>
    <Footer />
    </>
  );}