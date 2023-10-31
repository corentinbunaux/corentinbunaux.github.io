import Link from 'next/link';
import style from '../../styles/body/projectsSection.module.css';
import { useEffect,useState } from 'react';

export default function Project(){
    const [portfolioTop, updateportfolioTop] = useState(0)
    useEffect(()=>{
        updateportfolioTop(parseInt(localStorage.getItem("portfolioTop")))
    },[])
    return(
        <section className='project flex justify-center items-center'>
            <div className='container h-full flex flex-col'>
                <div className='flex flex-col items-center'>
                    <h1>Robotics</h1>
                    <h2>Exoskeleton Project: Design, Electronics, and Programming</h2>
                </div>
                <div className='p-5'>
                    <button className={style.see_more}>
                        <Link href='../' onClick={()=>{setTimeout(()=>{window.scroll({top : portfolioTop, left : 0, behavior : "smooth",})},1000)}}>Go back to my portfolio</Link>
                    </button>
                </div>
                <div>
                    <p>While I was enrolled in preparatory classes (known as CPGE), I engaged in a Personal and Guided Initiative Work ("TIPE") project that provided me with a deep dive into the domains of control electronics and embedded programming. The scope of this ambitious project centered on the development of an exoskeleton prosthesis for the arm, with the primary goal of aiding users in bearing weights at arm's length.</p>
                    <br/>
                    <br/>
                    <h3>Mechanical design and 3D</h3>
                    <p>As for the exoskeleton's framework, I opted for an articulated brace as the central structural design. Employing SolidWorks, I crafted personalized plastic components to affix the motor at the elbow segment.</p>
                    <br/>
                    <h3>Electronics</h3>
                    <p>The subsequent phase entailed the establishment of the electrical control systems. I implemented an H-bridge and a push button to oversee the motor's motion. This segment was pivotal in guaranteeing precise and secure control of the exoskeleton.</p>
                    <br/>
                    <h3>Embedded programming</h3>
                    <p>In order to animate the exoskeleton's motion, I coded the motor's functionality using an Arduino UNO board. The programming was meticulously designed to achieve a fluid and lifelike movement for the exoskeleton.</p>
                    <br/>
                    <br/>
                    <p>This project afforded me a significant chance to employ my expertise in electronics and programming in a practical and purposeful setting. Furthermore, it reinforced my capacity to address intricate challenges and translate theoretical ideas into tangible accomplishments.</p>
                    <br/>
                </div>
            </div>
        </section>
);
}