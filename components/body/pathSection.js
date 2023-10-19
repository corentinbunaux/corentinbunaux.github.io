import React, { useState, useEffect, useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import styles from './../../styles/body/pathSection.module.css'

const next = ">";
const prev = "<";

function StartLayer({ offset, onClick, titre, annee, arrow }) {
  return (
    <>
      <ParallaxLayer offset={offset} speed={0.2} onClick={onClick}>
        <h2 className={styles.year}>{annee}</h2>
      </ParallaxLayer>

      <ParallaxLayer offset={offset} speed={0.4} onClick={onClick}>
        <h1 className={styles.title}>{titre}</h1>
      </ParallaxLayer>

      <ParallaxLayer className={styles.next} offset={offset} speed={0.6}>
        <div className={styles.arrow}>{arrow}</div>
      </ParallaxLayer>
    </>
  );
}

function EndLayer({ offset, onClick, p1, p2, p3, arrow }) {
    return (
      <>
        <ParallaxLayer offset={offset} speed={0.6} onClick={onClick}>
          <p className={styles.p1}>{p1}</p>
        </ParallaxLayer>
  
        <ParallaxLayer offset={offset} speed={0.8} onClick={onClick}>
          <p className={styles.p2}>{p2}</p>
        </ParallaxLayer>

        <ParallaxLayer offset={offset} speed={1} onClick={onClick}>
          <p className={styles.p3}>{p3}</p>
        </ParallaxLayer>
  
        <ParallaxLayer className={styles.next} offset={offset} speed={0.3}>
          <div className={styles.arrow}>{arrow}</div>
        </ParallaxLayer>
      </>
    );
}

function FullLayer({ offset, onClick, p1, p2, p3,titre, annee, arrow}){
    return (
    <>
    <div className="columns-2 h-full">
        <div className='h-full'>
            <ParallaxLayer offset={offset} speed={0.2} onClick={onClick}>
                <h1 className={styles.title}>{titre}</h1>
            </ParallaxLayer>

            <ParallaxLayer offset={offset} speed={0.4} onClick={onClick}>
                <h2 className={styles.year}>{annee}</h2>
            </ParallaxLayer>
        </div>
        <div className='h-full'>
            <ParallaxLayer offset={offset} speed={0.6} onClick={onClick}>
                <p className={styles.p1}>{p1}</p>
            </ParallaxLayer>

            <ParallaxLayer offset={offset} speed={0.8} onClick={onClick}>
                <p className={styles.p2}>{p2}</p>
            </ParallaxLayer>

            <ParallaxLayer offset={offset} speed={1} onClick={onClick}>
                <p className={styles.p3}>{p3}</p>
            </ParallaxLayer>

            <ParallaxLayer className={styles.next} offset={offset} speed={0.3}>
                <div className={styles.arrow}>{arrow}</div>
            </ParallaxLayer>
        </div>
    </div>
    </>
    );
}

export default function PathSection() {
  const MSE = {
    titre : "Engineering School of Mines de Saint-Etienne",
    annee : "2025 - 2022",
    p1 : "The École des Mines de Saint-Étienne, with its specialized program ISMIN, is a prestigious engineering school located in France. It offers a comprehensive curriculum, focusing on the fields of computer science and microelectronics.",
    p2 : "ISMIN's program is particularly remarkable due to its recognition as one of the top engineering institutions in France. In the 2023 ranking, it proudly holds the 11th position among the best engineering schools in the country. This achievement reflects the school's commitment to academic excellence.",
  }
  const Prepa = {
    titre : "CPGE PCSI - PSI",
    annee : "2022 - 2020",
    p1 : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    p2 : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  }
  const Bac = {
    titre : "General Baccalaureate",
    annee : "2020 - 2017",
    p1 : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    p2 : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  }

  const parallax = useRef(null);

  const scroll = (to) => {
    if (parallax.current) {
      parallax.current.scrollTo(to);
    }
  };

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const customParallax = document.querySelector('.custom-parallax');

    if (customParallax) {
      customParallax.style.overflow = 'hidden';
    }

    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  if (windowSize.width > windowSize.height) {
    return (
      <section id='path' className='path'>
        <Parallax ref={parallax} pages={3} horizontal className='custom-parallax'>
          <FullLayer p1={MSE.p1} p2={MSE.p2} titre={MSE.titre} annee={MSE.annee} offset={0} arrow={next} onClick={() => scroll(1)}/>
          <FullLayer p1={Prepa.p1} p2={Prepa.p2} titre={Prepa.titre} annee={Prepa.annee} offset={1} arrow={next} onClick={() => scroll(2)} />
          <FullLayer p1={Bac.p1} p2={Bac.p2} titre={Bac.titre} annee={Bac.annee} offset={2} arrow={prev} onClick={() => scroll(0)} />
        </Parallax>
      </section>
    );
  } 
  
  else {
    return (
      <section id='path' className='path'>
        <Parallax ref={parallax} pages={6} horizontal className='custom-parallax'>
            <StartLayer offset={0} onClick={()=>{scroll(1)}} titre={MSE.titre} annee={MSE.annee} arrow={next}></StartLayer>
            <EndLayer offset={1} onClick={()=>{scroll(2)}} p1={MSE.p1} p2={MSE.p2} arrow={next}></EndLayer>
            <StartLayer offset={2} onClick={()=>{scroll(3)}} titre={Prepa.titre} annee={Prepa.annee} arrow={next}></StartLayer>
            <EndLayer offset={3} onClick={()=>{scroll(4)}} p1={Prepa.p1} p2={Prepa.p2} arrow={next}></EndLayer>
            <StartLayer offset={4} onClick={()=>{scroll(5)}} titre={Bac.titre} annee={Bac.annee} arrow={next}></StartLayer>
            <EndLayer offset={5} onClick={()=>{scroll(0)}} p1={Bac.p1} p2={Bac.p2} arrow={prev}></EndLayer>
        </Parallax>
      </section>
    );
  }
}

