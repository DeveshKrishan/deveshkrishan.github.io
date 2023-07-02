import styles from "./Intro.module.css"
import 'animate.css';

export default function About() {
    return (
        <div className={`${styles.about} animate__animated animate__fadeIn animate__delay-1s`} id="about_link">
            <h2 className={styles.big} id={styles.about_title} style={{padding: "1rem 0"}}>Learn who I am! 🤔</h2>
            <div className={styles.about_section}>
                <img src="https://i.postimg.cc/F1tQ7VLd/image.png" alt="Picture of Devesh Krishan" id={styles.about_pic}/>
                <div id={styles.about_desc} style={{paddingLeft: "4rem"}}>
                    <p className={styles.p} >Hi I’m Devesh! I’m currently studying Computer Science at the University of California, Irvine. </p>
                    <p className={styles.p}>I started programming in middle school in Scratch and became very interested in building applications for people. Some of my accomplishments currently include building full-stack applications for the Digital Learning team at the Paul Merage School of Business at UCI and almost winning a hackathon (jk we lost). One of my favorite lines to say is "it's all mental" in every challenge I come to face with which means nothing is impossible to beat! Feel free to contact me at deveshkrishan2003@gmail.com.</p>
                    <p className={styles.p}>Some of my free time is spent playing video games with friends, watching movies, and sleeping! </p>
                </div>
            </div>
        </div>
    )
}