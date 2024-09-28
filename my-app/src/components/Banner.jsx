import { React, useEffect, useState } from "react";
import '../styles/app.css';
import BannerElement from "./BannerElement";

const dataContents = [
  "HTML 5",
  "CSS 3 & SASS",
  "JavaScript",
  "React.js",
  "TypeScript",
  "Kotlin",
  "SQL",
  "Python : NumPy, Pandas, Matplotlib, TensorFlow, Scikit-learn",
  "Java",
  "C++",
  "Arduino",
  "Windows OS",
  "Linux OS (Ubuntu)",
  "Pack Office",
  "Git, Gerrit"
];

const Banner = () => {
  const [width, setWidth] = useState('420vw');
  const [right, setRight] = useState('0%');
  const [speed, setSpeed] = useState(5000);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // sm
      if (window.innerWidth < 768) {
        setWidth('300vw');
        setRight('0%');
        setSpeed(20000);
      }

      // md
      else if (window.innerWidth < 1024) {
        setWidth('450vw');
        setRight('0%');
        setSpeed(15000);
      }
      // lg
      else {
        setWidth('470vw');
        setRight('10%');
        setSpeed(20000);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const bannerSections = document.querySelectorAll('.banner-section');
    bannerSections.forEach(section => {
      if (isHovered) {
        section.classList.add('paused');
      } else {
        section.classList.remove('paused');
      }
    });
  }, [isHovered]);

  return (
    <div className="relative h-1/6" style={{ width: width }}>
      <div className="absolute flex w-full h-full" style={{ right: right }}>
        <div className="banner-section sm:w-1/2 lg:w-1/3" style={{ "--speed": `${speed}ms` }}>
          <CarouselElmts isHovered={isHovered} setIsHovered={setIsHovered} />
        </div>
        <div className="banner-section sm:w-1/2 lg:w-1/3" style={{ "--speed": `${speed}ms` }}>
          <CarouselElmts isHovered={isHovered} setIsHovered={setIsHovered} />
        </div>
        {window.innerWidth >= "1024px" &&
          <div className="banner-section lg:w-1/3" style={{ "--speed": `${speed}ms` }}>
            <CarouselElmts isHovered={isHovered} setIsHovered={setIsHovered} />
          </div>}
      </div>
    </div>
  );
};
export default Banner;

function CarouselElmts(props) {
  return (
    <div className="h-full w-full flex justify-around items-center">
      {dataContents.map((content, index) => (
        <div
          key={index}
          className="aspect-square h-1/2 md:h-2/3 lg:h-5/6 flex justify-center items-center"
          data-content={content}
        >
          <BannerElement index={index} setIsHovered={props.setIsHovered} />
        </div>
      ))}
    </div>
  );
}
