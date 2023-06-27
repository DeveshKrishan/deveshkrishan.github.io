import styles from "./Intro.module.css"

export default function Footer(){
    return (
        <div className={styles.footer}>
        <img src="https://www.freeiconspng.com/uploads/displaying-19-gallery-images-for-linkedin-logo-png-25.png" id={styles.footer_img} style={{height: "2rem" }}/>
        <p className={`${styles.footer_p} ${styles.p}`}>© 2023 devesh krishan | personal portfolio.</p>
        </div>
    );
}