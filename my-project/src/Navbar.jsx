import { Card, Subtitle, Metric, Text, Divider } from "@tremor/react";

function Navbar(){
    return (
        <div className="navbar">
        <p className={"logo"}>DK</p>
        <ul className={"project_list"}>
              <li>Home</li>
              <li>Skills</li>
              <li>About</li>
              <li>Portfolio</li>
        </ul>
    </div>
    )
}   

export default Navbar;