import Projects from "./project"
import styles from "./Intro.module.css"
import 'animate.css';

export default function Work() {
    return (
        <div className={`${styles.work} animate__animated animate__fadeInDown animate__delay-0.5s`} >
            <h2 className={styles.big} id={styles.checkwork}>Check out my work.</h2>
            <div id={styles.projectpos}>
                <Projects/>
            </div>
        </div>
    )
}