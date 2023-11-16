import React from 'react'
import style from './../../styles/body/projectsSection.module.css'
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProjectsSection(props) {
    useEffect(()=>{
        props.onValueChange(document.getElementById('portfolio').offsetHeight);
      },[]);
    return(
        <section id='portfolio' className='flex justify-center items-center portfolio'>
            <div className='container h-5/6'>
                <h1 className={style.check_out_my_portfolio}>Check out my portfolio</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full'>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                        <div className={`absolute h-full w-full rounded-lg ${style.internship}`}></div>
                            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                <h1 className={style.title}>Internship 2024</h1>
                                <p className={`${style.description} text-main-text`}>From April 2024 to August 2024</p>
                                <button className={style.see_more}>
                                    <Link href='/projects/Internship2024'>See more</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                            <div className={`absolute h-full w-full rounded-lg ${style.kusmitea}`}></div>
                            <div className="flex flex-col justify-center items-center border border-second h-full rounded-lg w-full">
                                <h1 className={style.title}>Kusmi Tea</h1>
                                <p className={`${style.description} text-main-text`}>Internship</p>
                                <button className={style.see_more}>
                                    <Link href='/projects/KusmiTea'>See more</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                            <div className={`absolute h-full w-full rounded-lg ${style.webdev}`}></div>
                            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                <h1 className={style.title}>Web Developement</h1>
                                <p className={`${style.description} text-main-text`}>Web portfolio V1 & V2</p>
                                <button className={style.see_more}>
                                    <Link href='/projects/WebDev'>See more</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                            <div className={`absolute h-full w-full rounded-lg ${style.ap}`}></div>
                                <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                    <h1 className={style.title}>Algorithms & Programming</h1>
                                    <p className={`${style.description} text-main-text`}>A variety of C & Python programs</p>
                                    <button className={style.see_more}>
                                        <Link href='/projects/A&P'>See more</Link>
                                    </button>
                                </div>
                            </div>
                    </div>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                            <div className={`absolute h-full w-full rounded-lg ${style.es}`}></div>
                            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                <h1 className={style.title}>Embedded Systems</h1>
                                <p className={`${style.description} text-main-text`}>Robot Project</p>
                                <button className={style.see_more}>
                                    <Link href='/projects/ES'>See more</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className={`relative h-full w-full ${style.fulldiv}`}>
                            <div className={`absolute h-full w-full rounded-lg ${style.robotics}`}></div>
                            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                <h1 className={style.title}>Robotics</h1>
                                <p className={`${style.description} text-main-text`}>Elaboration of an exoskeleton arm</p>
                                <button className={style.see_more}>
                                    <Link href='/projects/Robotics'>See more</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </section>
);}
