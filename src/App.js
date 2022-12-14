import React from "react";
import './App.css'
import scrollDown from './pictures/scrolldowncrop.gif';
import headshot from './pictures/deveshHeadshot.png';

function App(){
  return(
    <div className="mainBody">
      <div className="header">
          <p className="logoDK">
            Devesh Krishan
          </p>
          <nav>
            <ul>
              <li><a className="home" href="#home">Home</a></li>
              <li><a className="about" href="#news">About</a></li>
              <li><a className="resume" href="#contact">Resume</a></li>
            </ul>
          </nav>
        </div>

        <div className="homePanel">
          <div className="titlePic">
            <h1>
              Hey! I'm Devesh! A software engineer, video-editor, and coffee addict. 
            </h1>
            <img className="profile" src={headshot} alt="scrollDown" />
          </div>

          <p>
            Currently studying Computer Science at <strong><a className="uni" href="https://uci.edu/" target="_blank">University of California, Irvine</a></strong>
          </p>

          <img className="scrolldown" src={scrollDown} alt="scrollDown" />

        </div>

    </div>
  );
}

export default App;