import { RESUME_URL, SHOW_RESUME } from './constants';

function Navbar() {
  return (
    <div className="navbar" id="navbar-link">
      <p className={'logo'}>© coded by devesh</p>
      <ul className={'project_list'}>
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
    </div>
  );
}

export default Navbar;
