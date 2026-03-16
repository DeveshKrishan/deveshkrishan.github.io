
function Navbar(){
    return (
        <div className="navbar" id="navbar-link">
        <p className={"logo"}>DK</p>
        <ul className={"project_list"}>
            <a href="#navbar-link">
              <li>Home</li></a>
              <a href="#skill-link">
              <li>Skills</li></a>
              <a href="#about-link">
              <li>About</li></a>
              <a href="#portfolio-link">
              <li>Portfolio</li></a>
        </ul>
    </div>
    )
}   

export default Navbar;