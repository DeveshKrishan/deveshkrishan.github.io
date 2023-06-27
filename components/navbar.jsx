import styles from "./Intro.module.css"

export default function Navbar() {

    return (
        <div className={`${styles["navbar"]} ${styles["p"]}`}>
            <p className={styles.logo}>DK</p>
            <ul className={styles.project_list}>
                <li>Projects</li>
                <li>About</li>
                <li>Resume</li>
            </ul>
        </div>

    )
}