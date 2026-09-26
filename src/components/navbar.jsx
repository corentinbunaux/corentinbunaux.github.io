import React, { useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTranslation } from '../i18n/dictionary';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  return (
    <div
      role="group"
      aria-label={t.navbar.languageGroupLabel}
      className="flex overflow-hidden rounded-full border border-second bg-surface text-sm"
    >
      <button
        type="button"
        aria-pressed={language === 'fr'}
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 cursor-pointer ${language === 'fr' ? 'bg-surface-raised text-main-text' : 'text-second-text'}`}
      >
        FR
      </button>
      <button
        type="button"
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 cursor-pointer ${language === 'en' ? 'bg-surface-raised text-main-text' : 'text-second-text'}`}
      >
        EN
      </button>
    </div>
  );
}

function Navbar(props) {
  const t = useTranslation();

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
              {t.common.profile}
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(1) }}>
              {t.navbar.experiences}
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(2) }}>
              {t.common.projects}
            </button>
          </li>
          <li>
            <button type="button" className="cursor-pointer" onClick={() => { handleClick(3) }}>
              {t.common.about}
            </button>
          </li>
          <li>
            <LanguageToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;