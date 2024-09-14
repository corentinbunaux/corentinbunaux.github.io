import React from 'react'
import '../styles/app.css'

function ProjectsSection(props) {

    function handleClic(){
        alert('Bientôt disponible');
    }

    return(
    <section className='flex justify-center items-center portfolio h-full'>
        <div className='container h-5/6'>
            <h1 className="outlined-text">Portfolio</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full'>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                    <div className='absolute h-full w-full rounded-lg android'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Développement Android</h1>
                            <h3 className='description'>Bientôt disponible</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                    <div className='absolute h-full w-full rounded-lg quimesis'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Quimesis</h1>
                            <h3 className='description'>Stage d'ingénierie logicielle</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                        <div className='absolute h-full w-full rounded-lg kusmitea'></div>
                        <div className="flex flex-col justify-center items-center border border-second h-full rounded-lg w-full">
                            <h1 className='title'>Kusmi Tea</h1>
                            <h3 className='description'>Stage ouvrier</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                    <div className='absolute h-full w-full rounded-lg data-science'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Science des données</h1>
                            <h3 className='description'>Bientôt disponible</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                        <div className='absolute h-full w-full rounded-lg webdev'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Dévelopement Web</h1>
                            <h3 className='description'>Portfolio</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                        <div className='absolute h-full w-full rounded-lg ap'></div>
                            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                                <h1 className='title'>Programmation</h1>
                                <h3 className='description'>Algorithmes d'optimisation</h3>
                            </div>
                        </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                        <div className='absolute h-full w-full rounded-lg es'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Systèmes Embarqués</h1>
                            <h3 className='description'>Projet Robot</h3>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='relative h-full w-full fulldiv cursor-pointer' onClick={handleClic}>
                        <div className='absolute h-full w-full rounded-lg robotics'></div>
                        <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                            <h1 className='title'>Robotique</h1>
                            <h3 className='description'>Élaboration d'un bras d'exosquelette</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</section>
);}

export default ProjectsSection;