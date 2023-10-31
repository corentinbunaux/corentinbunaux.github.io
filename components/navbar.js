import React, { useEffect, useState } from 'react';

function Navbar(props) {

  let [links,updateLinks] = useState()

  useEffect(() => {
    //récupère le top pour positionner la section profil
    props.onValueChange(document.querySelector('nav').offsetHeight);

    //scroll personnalisé
    updateLinks(links = document.querySelectorAll('.cursor-pointer'))
    links.forEach((element,index) => {
      let goToTop = 0
      element.addEventListener("click", ()=>{
        switch(index){
          case 1:
            goToTop = props.allTops.portfolioTop
            break;
          case 2:
            goToTop = props.allTops.aboutTop
            break;
        }
        window.scroll({
          top : goToTop,
          left : 0,
          behavior : "smooth",
        })
        console.log(goToTop)
      })
    });
  }, []);

  return (
    <nav className="bg-my-green p-4 w-full sticky top-0 z-50">
      <div className="container mx-auto">
        <ul className="flex space-x-6 md:space-x-12 items-center md:justify-start justify-center">
          <li>
            <a className="text-main-text cursor-pointer">
              Home
            </a>
          </li>
          <li>
            <a className="text-main-text cursor-pointer">
              Portfolio
            </a>
          </li>
          <li>
            <a className="text-main-text cursor-pointer">
              About Me
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
