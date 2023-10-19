import Link from 'next/link';
import style from '../../styles/body/projectsSection.module.css'

export default function Project(){
    return(
        <section className='project flex justify-center items-center'>
            <div className='container h-full flex flex-col items-center'>
                <h1>Algorithms & Programming</h1>
                <p>Coming soon</p>
                <button className={style.see_more}>
                    <Link href='../#portfolio'>Go back to my portfolio</Link>
                </button>
            </div>
        </section>
);
}