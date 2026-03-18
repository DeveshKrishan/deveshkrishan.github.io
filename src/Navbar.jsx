function Navbar() {
  return (
    <div className="navbar" id="navbar-link">
      <p className={'logo'}>© coded by devesh</p>
      <ul className={'project_list'}>
        <li>
          <a href="/">home</a>
        </li>
        <li>
          <a href="#about">about</a>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
