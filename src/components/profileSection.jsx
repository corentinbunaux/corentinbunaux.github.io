import '../app/app.css';
import Banner from './Banner';

function ProfileSection(props) {
    return (
        <div className='container-fluid h-full flex justify-center items-center'>
            <div className='container h-5/6'>
                <h1 className='outlined-text'>Profil</h1>
                <h3 className='mt-1 mb-1'>Actuellement étudiant en <strong style={{ color: 'var(--my-green)' }}>informatique</strong>, je suis à la recherche d'un stage de fin d'études, d'une durée de 6 mois, commençant au mois d'<strong style={{ color: 'var(--my-green)' }}>avril 2025</strong>.</h3>
                <h3 className='mt-1 mb-1'>A l'issu des <strong style={{ color: 'var(--my-green)' }}>classes préparatoires (CPGE)</strong>, j'ai intégré l'École des <a href='https://www.mines-stetienne.fr/lecole/'><strong className='underline' style={{ color: 'var(--my-green)' }}>Mines de Saint-Étienne</strong></a>, à travers le cursus <a href='https://www.mines-stetienne.fr/formation/ismin/'><strong className='underline' style={{ color: 'var(--my-green)' }}>ISMIN</strong></a>.</h3>
                <h3 className='mt-1 mb-1'>Mes précédentes expériences en entreprise m'ont permis d'appliquer mes acquis académiques, tout en développant de nouvelles compétences.</h3>
                <h3 className='mt-1 mb-1'>Je suis quelqu'un de naturellement curieux, avec le sens du détail, et qui porte un certain intérêt envers les nouvelles technologies.</h3>
                <br className='hidden md:inline'></br>
                <br className='hidden md:inline'></br>
                <br className='hidden lg:inline'></br>

                <br></br>
                <h1 className='outlined-text'>Compétences</h1>
                <h3 className='mt-1 mb-1'>Je parle <strong style={{ color: 'var(--my-green)' }}>anglais</strong> à niveau professionnel (C1, score TOIEC : <strong style={{ color: 'var(--my-green)' }}>950/990</strong>), et <strong style={{ color: 'var(--my-green)' }}>espagnol</strong> à niveau intermédiaire (B1), en plus de ma langue maternelle qui est le <strong style={{ color: 'var(--my-green)' }}>français</strong>.</h3>
                <h3 className='mt-1 mb-1'>Une pluralité de projets scolaires, personnels, et en entreprise m'ont permis de développer une aisance avec les technologies et langages de programmations qui suivent.</h3>
                <h3 className='cursor-pointer'><div onClick={() => {
                    window.scroll({
                        top: props.portfolioTop,
                        left: 0,
                        behavior: "smooth",
                    });
                }} className='underline'>Voir les projets</div></h3>
                <br className='hidden md:inline'></br>
                <br className='hidden md:inline'></br>
                <br className='hidden lg:inline'></br>
                <br className='hidden lg:inline'></br>

                <Banner />
            </div>
        </div>
    );
}

export default ProfileSection;