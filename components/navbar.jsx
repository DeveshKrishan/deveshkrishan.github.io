"use client"

import styles from "./Intro.module.css"
import 'animate.css';

export default function Navbar() {

    const scroll2El = elID => {
        window.scrollTo({
          top: document.getElementById(elID).offsetTop - 60,
          behavior: 'smooth',
        });
      };

      const onBtnClick = (e) => {
        e.preventDefault();
        const goto = e.target.getAttribute('goto');
        setTimeout(() => {
          scroll2El(goto);
        }, 100);
      }
    
    // https://stackoverflow.com/questions/70746495/nextjs-scroll-into-view-of-specific-component-upon-button-onclick-that-exists-on
    // Shout this dude

    return (
        <div className={`${styles["navbar"]} ${styles["p"]} animate__animated animate__fadeInDown animate__delay-1s`}>
            <p className={styles.logo}>DK</p>
            <ul className={styles.project_list}>
                <li goto="project_link" onClick={onBtnClick} style={{cursor: "pointer"}}>Projects</li>
                <li goto="about_link" onClick={onBtnClick} style={{cursor: "pointer"}}>About</li>
                <a href="https://drive.google.com/file/d/1NnwuHtQAtTXs-VQm7ciAUC5oFrDwP7mq/view?usp=sharing" target="_blank" className={styles.a}><li>Resume</li></a>
            </ul>
        </div>

    )
}