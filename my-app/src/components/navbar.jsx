import React, { useEffect, useCallback } from 'react';

function Navbar(props) {

  const handleClick = useCallback((index) => {
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
  }, [props.allTops]);

  useEffect(() => {
    if (window.location.hash === '#portfolio') {
      handleClick(2);
    }
  }, [window.location.hash, handleClick]);

  return (
    <nav className="p-2 md:p-4 fixed top-0" style={{ backdropFilter: 'blur(4px)', width : "100vw", zIndex:"100" }}>
      <div className="container mx-auto">
        <ul className="flex space-x-6 md:space-x-12 items-center md:justify-start justify-center">
          <li>
            <div className="cursor-pointer" onClick={() => { handleClick(0) }}>
              Accueil
            </div>
          </li>
          <li>
            <div className="cursor-pointer" onClick={() => { handleClick(1) }}>
              Profil
            </div>
          </li>
          <li>
            <div className="cursor-pointer" onClick={() => { handleClick(2) }}>
              Portfolio
            </div>
          </li>
          <li>
            <div className="cursor-pointer" onClick={() => { handleClick(3) }}>
              À propos
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;