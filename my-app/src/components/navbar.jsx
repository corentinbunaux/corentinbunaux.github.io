import React, { useEffect, useState } from 'react';

function Navbar(props) {

  function handleClick(index) {
    let scrollTop;
    switch (index) {
      case 0:
        scrollTop = props.allTops.homepageTop;
        break;
      case 1:
        scrollTop = props.allTops.profileTop;
        break;
      case 2:
        scrollTop = props.allTops.portfolioTop;
        break;
      case 3:
        scrollTop = props.allTops.aboutTop;
        break;
      default:
        scrollTop = 0;
    }

    window.scroll({
      top: scrollTop,
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    console.log(window.location.hash);
    if (window.location.hash === '#portfolio') {
      handleClick(2);
    }
  }, [window.location.hash, props.allTops.portfolioTop]);

  return (
    <nav className="p-4 w-full fixed top-0 z-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="container mx-auto">
        <ul className="flex space-x-6 md:space-x-12 items-center md:justify-start justify-center">
          <li>
            <a className="cursor-pointer" onClick={() => { handleClick(0) }}>
              Accueil
            </a>
          </li>
          <li>
            <a className="cursor-pointer" onClick={() => { handleClick(1) }}>
              Profil
            </a>
          </li>
          <li>
            <a className="cursor-pointer" onClick={() => { handleClick(2) }}>
              Portfolio
            </a>
          </li>
          <li>
            <a className="cursor-pointer" onClick={() => { handleClick(3) }}>
              À propos
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;