import '../app/app.css';
import Banner from './Banner';
import { useTranslation } from '../i18n/dictionary';

function ProfileSection(props) {
    const t = useTranslation();
    return (
        <div className='container-fluid h-full flex justify-center items-center p-5'>
            <div className='container h-2/3'>
                <h1 className='outlined-text'>{t.profile.title}</h1>
                <h3 className='mt-1 mb-1'>{t.profile.roleIntro}<strong style={{ color: 'var(--my-green)' }}>GCII</strong>{t.profile.roleClient}<strong style={{ color: 'var(--my-green)' }}>Enedis</strong>{t.profile.roleLocation}<strong style={{ color: 'var(--my-green)' }}>Le Havre</strong>.</h3>
                <h3 className='mt-1 mb-1'>{t.profile.educationIntro}<strong style={{ color: 'var(--my-green)' }}>{t.profile.cpgeTerm}</strong>{t.profile.educationMid1}<a href='https://www.mines-stetienne.fr/lecole/'><strong className='underline' style={{ color: 'var(--my-green)' }}>Mines de Saint-Étienne</strong></a>{t.profile.educationMid2}<a href='https://www.mines-stetienne.fr/formation/ismin/'><strong className='underline' style={{ color: 'var(--my-green)' }}>ISMIN</strong></a>{t.profile.educationOutro}</h3>
                <h3 className='mt-1 mb-1'>{t.profile.experienceSummary}</h3>
                <h3 className='mt-1 mb-1'>{t.profile.personality}</h3>
                <br className='hidden md:inline'></br>
                <br className='hidden md:inline'></br>
                <br className='hidden lg:inline'></br>

                <br></br>
                <h1 className='outlined-text'>{t.profile.skillsTitle}</h1>
                <h3 className='mt-1 mb-1'>{t.profile.languagesIntro}<strong style={{ color: 'var(--my-green)' }}>{t.profile.englishName}</strong>{t.profile.englishLevel}<strong style={{ color: 'var(--my-green)' }}>950/990</strong>{t.profile.languagesMid}<strong style={{ color: 'var(--my-green)' }}>{t.profile.spanishName}</strong>{t.profile.spanishLevel}<strong style={{ color: 'var(--my-green)' }}>{t.profile.frenchName}</strong>.</h3>
                <h3 className='mt-1 mb-1'>{t.profile.toolsIntro}</h3>
                <h3 className='cursor-pointer'><div onClick={() => {
                    window.scroll({
                        top: props.portfolioTop,
                        left: 0,
                        behavior: "smooth",
                    });
                }} className='underline'>{t.profile.seeProjects}</div></h3>
                <br className='hidden md:inline'></br>
                <br className='hidden md:inline'></br>

                <Banner />
            </div>
        </div>
    );
}

export default ProfileSection;