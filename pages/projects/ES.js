import Link from 'next/link';
import style from '../../styles/body/projectsSection.module.css'

export default function Project(){
    return(
        <section className='project flex justify-center items-center'>
            <div className='container h-full flex flex-col'>
                <div className='flex flex-col items-center'>
                    <h1>Embedded systems</h1>
                    <h2>Robot project : an autonomous navigator</h2>
                </div>
                <div className='p-5'>
                    <button className={style.see_more}>
                        <Link href='../#portfolio'>Go back to my portfolio</Link>
                    </button>
                </div>
                <div>
                    <p>During the course of my academic endeavors, I had the unique opportunity to delve into a project that revolved around crafting and evaluating an electronic control board for a robot. Working in pairs, our responsibility was to conceptualize and assess the electronic board, essentially the robot's 'brain'. </p>
                    <br/>
                    <p>This board featured a range of essential components including infrared sensors, sonar technology, relays for motor control, and strategically placed LEDs, all meticulously managed for power optimization. Our role was to ensure the seamless interaction of these elements to guarantee the robot's smooth operation.</p>
                    <br/>
                    <p>Leveraging the embedded C programming language, we programmed the robot's actions via the 'PIC-18' microcontroller. Our robot was programmed to execute a 180-degree scan in a back-and-forth pattern. Moreover, if an object was detected within a 1.50-meter range, as determined by the infrared sensors, the robot would intelligently advance towards the object. This functionality was designed to showcase the robot's ability to respond astutely to its surroundings.</p>
                    <br/>
                    <p>This project served as a hands-on amalgamation of my knowledge in electronics, embedded programming, and system design, resulting in the creation of a functional and intelligent robot. It was an invaluable practical experience that reinforced my comprehension of theoretical concepts and my adeptness in applying them to tangible projects.</p>
                    <br/>
                </div>
            </div>
        </section>
);
}