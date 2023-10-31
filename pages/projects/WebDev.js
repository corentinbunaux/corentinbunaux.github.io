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
                    <h1>Web Development</h1>
                    <h2>A journey from HTML to NextJS</h2>
                </div>
                <div className='p-5'>
                    <button className={style.see_more}>
                        <Link href='../' onClick={()=>{setTimeout(()=>{window.scroll({top : portfolioTop, left : 0, behavior : "smooth",})},1000)}}>Go back to my portfolio</Link>
                    </button>
                </div>
                <div>
                    <p>In the world of web development, my journey began as a novice eager to create a stunning web portfolio. This project would not only sharpen my skills but also introduce me to a whole new world of front-end tools and technologies.</p>
                    <br/>
                    <p>I started with the fundamentals : HTML, CSS, and JavaScript. As I delved into the theories behind web development, I realized there was so much more to explore. Online courses became my trusted companions, teaching me about the tools and techniques not covered in my academic curriculum.</p>
                    <br/>
                    <p>The Sass compiler and Bootstrap framework allowed me to emphasize the structural and aesthetic aspects of my web project. With them, I crafted the initial version of my portfolio site, meticulously dividing it into sections that showcased my profile. I incorporated various features, including a toggle switch for light and dark modes, support for both French and English languages, and an array of CSS animations to bring my site to life.</p>
                    <br/>
                    <p>Yet, I wasn't convinced of how my site looked like, and I wanted to shed its "first project" aura, making it more polished and refined. React and Tailwind allowed me to bring new life into my existing project. I refined certain elements, while introducing a host of fresh functionalities.</p>
                    <br/>
                    <p>NextJS brought even more to the table. It simplified building the architecture of my project. Yet, the hosting on Vercel was a challenge since DNS changes remained a concern. To tackle this issue, I chose to host my portfolio on GitHub due to its cost-effectiveness and minimal maintenance requirements – an ideal solution for a showcase website.</p>
                    <br/>
                    <p>Transforming my simple portfolio site into a professional, polished, and feature-rich web showcase is an example of the power of self-guided learning, curiosity and hard work.</p>
                    <br/>
                </div>
            </div>
        </section>
);
}