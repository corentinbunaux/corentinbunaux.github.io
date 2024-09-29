import '../app/app.css'

const projects = [
    { cssClass: 'android', title: 'Android', description: 'Bientôt disponible' },
    { cssClass: 'quimesis', title: 'Quimesis', description: "Stage d'ingénierie logicielle" },
    { cssClass: 'kusmitea', title: 'Kusmi Tea', description: 'Stage ouvrier' },
    { cssClass: 'datascience', title: 'Science des données', description: 'Bientôt disponible' },
    { cssClass: 'web', title: 'Dévelopement Web', description: 'Portfolio & API Rest' },
    { cssClass: 'programming', title: 'Programmation', description: "Algorithmie et structure de données" },
    { cssClass: 'embedded', title: 'Systèmes Embarqués', description: 'Projet Robot' },
    { cssClass: 'robotics', title: 'Robotique', description: "Élaboration d'un bras d'exosquelette" },
];

const ProjectCard = ({ cssClass, title, description }) => (
    <div className='p-4'>
        <a href={`/${cssClass}`} className='relative h-full w-full fulldiv cursor-pointer'>
            <div className={`absolute h-full w-full rounded-lg ${cssClass}`}></div>
            <div className='flex flex-col justify-center items-center border border-second h-full rounded-lg w-full'>
                <h1 className='title'>{title}</h1>
                <h3 className='description'>{description}</h3>
            </div>
        </a>
    </div>
);

function ProjectsSection() {

    return (
        <section id='section-portfolio' className='flex justify-center items-center h-full'>
            <div className='container h-5/6'>
                <h1 className="outlined-text">Portfolio</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full'>
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={index}
                            href={project.href}
                            cssClass={project.cssClass}
                            title={project.title}
                            description={project.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ProjectsSection;