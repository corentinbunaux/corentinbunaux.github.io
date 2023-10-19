import Head from 'next/head'
import React from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import ProfileSection from '../components/body/profileSection'
import PathSection from '../components/body/pathSection'
import ProjectsSection from '../components/body/projectsSection'
import AboutmeSection from '../components/body/aboutmeSection'

export default function Website() {
  return (
    <>
    <Head>
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>Portfolio Corentin BUNAUX</title>
    </Head>
    <Navbar />
    <ProfileSection/>
    <ProjectsSection/>
    <AboutmeSection/>
    <Footer />
    </>
  );}