import { useEffect, useRef, useState } from 'react';
import { RESUME_URL, SHOW_RESUME } from './constants';
import { useScrollNavbar } from './useScrollNavbar';

const NAV_LINKS = [
  { href: '/', label: 'home' },
  { href: '#skills', label: 'skills' },
  { href: '#about', label: 'about' },
];

function Navbar() {
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(76);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrollHidden = useScrollNavbar(isMenuOpen);

  useEffect(() => {
    const el = navRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const syncHeight = () => setNavHeight(el.offsetHeight);
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const media = window.matchMedia('(min-width: 768px)');
    const handleChange = (event) => {
      if (event.matches) setIsMenuOpen(false);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  function handleToggleMenu() {
    setIsMenuOpen((open) => !open);
  }

  function handleNavClick() {
    setIsMenuOpen(false);
  }

  const navbarClass = [
    'navbar',
    isScrollHidden ? 'is-scroll-hidden' : '',
    isMenuOpen ? 'is-menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header
        ref={navRef}
        className={navbarClass}
        id="navbar-link"
        style={{ '--navbar-offset': `${navHeight}px` }}
      >
        <p className="logo">
          <span className="logo-mark" aria-hidden="true">
            ©
          </span>
          coded by devesh
        </p>
        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
          onClick={handleToggleMenu}
        >
          {isMenuOpen ? 'close' : 'menu'}
        </button>
        <ul className="project_list" id="navbar-menu">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={handleNavClick}>
                {link.label}
              </a>
            </li>
          ))}
          {SHOW_RESUME ? (
            <li>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
              >
                resume
              </a>
            </li>
          ) : null}
        </ul>
      </header>
      <div
        className="navbar-spacer"
        style={{ height: navHeight }}
        aria-hidden="true"
      />
    </>
  );
}

export default Navbar;
