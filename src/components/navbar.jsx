import React, { useEffect, useCallback } from 'react';

function Navbar(props) {

  const handleClick = useCallback((index) => {
    let scrollTop;
    switch (index) {
      case 0:
        scrollTop = props.allTops.profileTop;
        break;
      case 1:
        scrollTop = props.allTops.journeyTop;
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
  }, [handleClick]);

  return (
    <nav className="p-2 md:p-4 md:ms-4 fixed top-0 w-screen" style={{ backdropFilter: 'blur(4px)', zIndex:"100" }}>
      <div className="container mx-auto">
        <ul className="flex space-x-6 md:space-x-12 items-center md:justify-start justify-center">
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(0) }}>
              Profil
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(1) }}>
              Expériences
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(2) }}>
              Projets
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(3) }}>
              À propos
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;