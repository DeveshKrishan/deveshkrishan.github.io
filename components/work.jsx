import Projects from "./project"
import styles from "./Intro.module.css"

export default function Work() {
    return (
        <div className={styles.work}>
            <h2 className={styles.big} id={styles.checkwork}>Check out my work.</h2>
            <div id={styles.projectpos}>
                <Projects/>
            </div>
        </div>
    )
}