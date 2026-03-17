function Navbar() {
  return (
    <div className="navbar" id="navbar-link">
      <p className={'logo'}>© vibe coded by devesh</p>
      <ul className={'project_list'}>
        <a href="#navbar-link">
          <li>home</li>
        </a>
        <a href="#about-link">
          <li>about</li>
        </a>
        <a href="#portfolio-link">
          <li>portfolio</li>
        </a>
      </ul>
    </div>
  );
}

export default Navbar;
