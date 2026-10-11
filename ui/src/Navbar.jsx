import { useEffect, useRef, useState } from 'react';
import { RESUME_URL, SHOW_RESUME } from './constants';
import { useScrollNavbar } from './useScrollNavbar';

function Navbar() {
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(76);
  const isScrollHidden = useScrollNavbar();

  useEffect(() => {
    const el = navRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const syncHeight = () => setNavHeight(el.offsetHeight);
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        ref={navRef}
        className={`navbar${isScrollHidden ? ' is-scroll-hidden' : ''}`}
        id="navbar-link"
      >
        <p className="logo">
          <span className="logo-mark" aria-hidden="true">
            ©
          </span>
          coded by devesh
        </p>
        <ul className="project_list">
          <li>
            <a href="/">home</a>
          </li>
          <li>
            <a href="#skills">skills</a>
          </li>
          <li>
            <a href="#about">about</a>
          </li>
          {SHOW_RESUME ? (
            <li>
              <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
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
