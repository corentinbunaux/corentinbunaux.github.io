import Link from 'next/link';
import style from '../../styles/body/projectsSection.module.css'
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
                    <h1>Kusmi Tea</h1>
                    <h2>Discovery of IT tools and industrial automation</h2>
                </div>
                <div className='p-5'>
                    <button className={style.see_more}>
                        <Link href='../' onClick={()=>{setTimeout(()=>{window.scroll({top : portfolioTop, left : 0, behavior : "smooth",})},1000)}}>Go back to my portfolio</Link>
                    </button>
                </div>
                <div>
                    <p><strong>Orientis Gourmet</strong> is a French company specialized in tea sales, with a presence in over eighty boutiques across France, and also known internationally. It owns the brand <strong>Kusmi Tea</strong>, a leading high-end tea mark in France. This one-month internship allowed me to explore various aspects of the company and contribute to several projects.</p>
                    <br/>
                    <br/>
                    <h3>IT Department</h3>
                    <p>Throughout my internship, I had the opportunity to actively engage in and observe the IT operations at Orientis Gourmet. This encompassed a range of responsibilities, including providing technical support and the implementation of essential tools like GLPI software for request management and TeamViewer for remote troubleshooting.</p>
                    <p>In addition to these tasks, I made valuable contributions to the deployment of new payment terminals in boutiques and the upgrading of workstations in Prologis warehouses. This experience provided me with insights into the intricacies of the company's computer network and underscored the pivotal role played by technological tools in its day-to-day operations.</p>
                    <br/>
                    <h3>Industrial Automation</h3>
                    <p>While at Orientis Gourmet, I undertook the responsibility of creating and programming an automation system designed to count and categorize tea bags as they reached the end of the production line.</p>
                    <p>To accomplish this, I employed a programmable logic controller (PLC), specifically the TM221 model by Schneider Electric, to oversee electrical signals and implement the necessary features. Leveraging the EcoStruxure Machine software, I developed a program in LADDER language, which was meticulously organized with steps and transitions to manage the motor controlling the conveyor belt. Subsequently, I fine-tuned the system by integrating a frequency inverter to regulate the conveyor belt's speed and address issues related to the grouping of tea bags.</p>
                    <p>These experiences significantly enhanced my expertise in electronics, programming, and industrial automation. Moreover, they prompted contemplation on the societal and human aspects of automation within the realm of engineering.</p>
                    <br/>
                </div>
            </div>
        </section>
);
}