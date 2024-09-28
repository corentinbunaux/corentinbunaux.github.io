import { React, useState, useEffect, useNavigate } from 'react'
import '../styles/app.css'

const contentOfPopUp = {
    android: {
        title: 'Android',
        description: 'Bientôt disponible !',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    quimesis: {
        title: 'Quimesis',
        description: 'Stage d\'ingénierie logicielle',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    kusmitea: {
        title: 'Kusmi Tea',
        description: 'Stage ouvrier',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    datascience: {
        title: 'Science des données',
        description: 'Bientôt disponible !',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    web: {
        title: 'Développement Web',
        description: 'Portfolio',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    programming: {
        title: 'Programmation',
        description: 'Algorithmes d\'optimisation',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    embedded: {
        title: 'Systèmes Embarqués',
        description: 'Projet Robot',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    robotics: {
        title: 'Robotique',
        description: 'Élaboration d\'un bras d\'exosquelette',
        paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
};

function Project(props) {
    return (
        <div className='absolute h-full w-full z-50' style={{ top: `${props.scrollY}px`, backdropFilter: 'blur(10px)' }}>
            <div className='container-fluid h-full flex justify-center items-center'>
                <div className='container h-5/6'>
                    <div className='flex flex-col justify-center items-center'>
                        <h1 className='outlined-text'>{contentOfPopUp[props.tab].title}</h1>
                        <h2>{contentOfPopUp[props.tab].description}</h2>
                    </div>
                    <div className='flex justify-center items-center md:justify-start'>
                        <a href="/#portfolio" className='previous'>
                            Retour
                        </a>
                    </div>
                    <div id="popUpContent" className='container-fluid h-full' style={{ overflow: 'scroll' }}>
                        <h3>{contentOfPopUp[props.tab].paragraph}</h3>
                        <h3>{contentOfPopUp[props.tab].paragraph}</h3>
                        <h3>{contentOfPopUp[props.tab].paragraph}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Project;