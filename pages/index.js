import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import ProfileSection from '../components/body/profileSection'
import ProjectsSection from '../components/body/projectsSection'
import AboutmeSection from '../components/body/aboutmeSection'

export default function Website() {
  const [allTops ={profileTop : 0, portfolioTop : 0, aboutTop : 0}, setTop] = useState()
  useEffect(()=>{
    window.scroll({top : 0,left : 0,behavior : "smooth"})
    localStorage.setItem("portfolioTop",allTops.portfolioTop)
  },[])

  const updateProfileTop = (topValue)=>{  
    setTop(allTops.profileTop = topValue);
  };
  const updatePortfolioTop = (topValue)=>{
    setTop(allTops.portfolioTop = topValue + allTops.profileTop);
  };
  const updateAboutTop = (topValue)=>{
    setTop(allTops.aboutTop = topValue + allTops.portfolioTop);
  };

  return (
    <>
    <Head>
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>Portfolio Corentin BUNAUX</title>
    </Head>
    <Navbar onValueChange={updateProfileTop} allTops={allTops}/>
    <ProfileSection onValueChange={updatePortfolioTop}/>
    <ProjectsSection onValueChange={updateAboutTop}/>
    <AboutmeSection/>
    <Footer />
    </>
  );}