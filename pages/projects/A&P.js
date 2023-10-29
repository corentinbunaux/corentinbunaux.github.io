import Link from 'next/link';
import style from '../../styles/body/projectsSection.module.css'

export default function Project(){
    return(
        <section className='project flex justify-center items-center'>
            <div className='container h-full flex flex-col'>
                <div className='flex flex-col items-center'>
                    <h1>Algorithms & programming</h1>
                    <h2>Set of programs developed in engineering school</h2>
                </div>
                <div className='p-5'>
                    <button className={style.see_more}>
                        <Link href='../#portfolio'>Go back to my portfolio</Link>
                    </button>
                </div>
                <div>
                    <p>As part of my academic journey, I undertook a series of diverse computer projects. From solving algorithmic problems in <strong>Python</strong> to manipulating data in <strong>C</strong>, and even creating multiplayer applications, these projects showcase my progress in the field of computer science and my growing mastery of programming languages.</p>
                    <br/>
                    <br/>
                    <h3>Python Optimization Challenge</h3>
                    <p>In this collaborative project, we tackled a complex algorithmic challenge as a team. Our primary objective was to efficiently place the minimum number of "watchers" within a matrix to cover all the "targets" across rows and columns. Leveraging our programming expertise in Python, we initiated the project by solving the problem and subsequently optimizing our solution to minimize the overall number of required watchers.</p>
                    <p>Over the course of a dedicated day of intense collaboration, we delved into a variety of algorithmic strategies, aiming to achieve the most optimal solution. This project showcased our problem-solving skills and demonstrated our ability to optimize solutions effectively. It exemplified our teamwork and proficiency in algorithmic thinking, highlighting our commitment to finding innovative solutions to complex problems.</p>
                    <br/>
                    <h3>CSV Data Processing and Statistical Analysis</h3>
                    <p>In this project, we utilized the C programming language to handle and interpret data extracted from Excel spreadsheets. Our primary objective was to derive insightful statistics from the data and represent them graphically through a chart.</p>
                    <p>By implementing these features, we not only demonstrated our proficiency in data manipulation but also underscored our capability to craft efficient programs tailored for statistical analysis. This project served as a testament to our skills in data processing and our capacity to develop software solutions for robust statistical assessment.</p>
                    <br/>
                    <h3>Prediction Dictionary</h3>
                    <p>This C project revolved around the development of a prediction dictionary, which offered word suggestions based on user input. As users entered character strings, the application provided probable word choices by referencing an existing conversational dictionary. In cases where a match wasn't found within the dictionary, we implemented a logic system to propose common French words that could complete the user's input.</p>
                    <p>This undertaking underscored our proficiencies in text processing and our capacity to design and manage data structures effectively. It demonstrated our ability to create a user-friendly predictive tool that enhanced the user experience and showcased our expertise in the field of text analysis and data structure design.</p>
                    <br/>
                    <h3>Multithreaded Application : "Dactylo Race"</h3> 
                    <p>In this multiplayer application, we orchestrated processes and threads to craft an engaging gaming experience.</p>
                    <p>Participants engaged in a competitive challenge that required them to swiftly and accurately type out a presented sentence. Harnessing the power of multithreading, we oversaw tasks such as player registration, sentence display, and timekeeping. Upon completion by all players, the game presented a podium, offering options to replay or exit the game.</p>
                    <p>This endeavor showed our competence in concurrent task management within an interactive and competitive setting.</p>
                    <br/>
                </div>
            </div>
        </section>
);
}