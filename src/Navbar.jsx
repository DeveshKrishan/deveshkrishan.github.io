import { RESUME_URL, SHOW_RESUME } from './constants';

function Navbar() {
  return (
    <header className="navbar" id="navbar-link">
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
  );
}

export default Navbar;
