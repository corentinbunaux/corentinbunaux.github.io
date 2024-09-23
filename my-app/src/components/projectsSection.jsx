import { React, useEffect } from 'react'
import '../styles/app.css'

function Android(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Android</h1>
                <h2>Bientôt disponible !</h2>
                <h3>Je poursuis ce cours actuellemet en école d'ingénieur.</h3>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function Quimesis(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Quimesis</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function KusmiTea(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Kusmi Tea</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function DataScience(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Science des données</h1>
                <h2>Bientôt disponible !</h2>
                <h3>Je poursuis ce cours actuellemet en école d'ingénieur.</h3>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function Web(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Dévelopement Web</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function Programmation(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Programmation</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function Embedded(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Systèmes Embarqués</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function Robotics(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Robotique</h1>
                <button className='previous' onClick={() => { props.setTab('full-portfolio'); }}>Retour</button>
            </div>
        </div>
    );
}

function FullPortfolio(props) {
    return (
        <div className='container h-5/6'>
            <h1 className="outlined-text">Portfolio</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full'>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('android'); }}>
                        <div className='absolute h-full w-full rounded-lg android'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Android</h1>
                            <h3 className='description'>Bientôt disponible</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('quimesis'); }}>
                        <div className='absolute h-full w-full rounded-lg quimesis'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Quimesis</h1>
                            <h3 className='description'>Stage d'ingénierie logicielle</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('kusmitea'); }}>
                        <div className='absolute h-full w-full rounded-lg kusmitea'></div>
                        <div className="flex flex-col justify-center items-center border border-second h-full rounded-lg w-full">
                            <h1 className='title'>Kusmi Tea</h1>
                            <h3 className='description'>Stage ouvrier</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('datascience'); }}>
                        <div className='absolute h-full w-full rounded-lg data-science'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Science des données</h1>
                            <h3 className='description'>Bientôt disponible</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('web'); }}>
                        <div className='absolute h-full w-full rounded-lg webdev'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Dévelopement Web</h1>
                            <h3 className='description'>Portfolio</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('algoprog'); }}>
                        <div className='absolute h-full w-full rounded-lg ap'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Programmation</h1>
                            <h3 className='description'>Algorithmes d'optimisation</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('embedded'); }}>
                        <div className='absolute h-full w-full rounded-lg es'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Systèmes Embarqués</h1>
                            <h3 className='description'>Projet Robot</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={() => { props.setTab('robotics'); }}>
                        <div className='absolute h-full w-full rounded-lg robotics'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Robotique</h1>
                            <h3 className='description'>Élaboration d'un bras d'exosquelette</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PopUpWindow(props) {
    return (
        <div className='absolute h-full w-full z-50' style={{ top: `${window.scrollY}px`, backdropFilter: 'blur(10px)' }}>
            {props.tab === 'android' && <Android tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'quimesis' && <Quimesis tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'kusmitea' && <KusmiTea tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'datascience' && <DataScience tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'web' && <Web tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'algoprog' && <Programmation tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'embedded' && <Embedded tab={props.tab} setTab={props.setTab} />}
            {props.tab === 'robotics' && <Robotics tab={props.tab} setTab={props.setTab} />}
        </div>
    );
}

function ProjectsSection(props) {

    return (
        <section id='section-portfolio' className='flex justify-center items-center h-full'>
            <FullPortfolio setTab={props.setTab} />
            {props.tab !== 'full-portfolio' && <PopUpWindow tab={props.tab} setTab={props.setTab} />}
        </section>
    );
}

export default ProjectsSection;