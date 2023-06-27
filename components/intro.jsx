import styles from "./Intro.module.css"

export default function Intro() {
    return (
        <div className={styles.intro}>
            <p className={`${styles.p} ${styles.space}`} id={styles.name}>👋 Hello! I’m Devesh!</p>
            <h1 className={`${styles.big} ${styles.space}`} id={styles.who}>A full-stack developer with years of experience creating 
                wonderful projects that are scalable and usable for people! </h1>
            <p className={styles.p} id={styles.quote}>"The best way to predict the future is to create it." - Abraham Lincoln</p>
        </div>
    )
}