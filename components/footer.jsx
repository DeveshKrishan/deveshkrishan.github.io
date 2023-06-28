"use client"
import styles from "./Intro.module.css"

export default function Footer(){

    const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

    function scrollToTop() {
        if (!isBrowser()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    //https://upmostly.com/next-js/how-to-create-a-scroll-to-top-button-in-next-js
    // shout out this guy too

    return (
        <div className={styles.footer}>
            <div className={styles.footer_img}>
                <a href="https://www.linkedin.com/in/deveshkrishan/" target="_blank"><img src="https://www.freeiconspng.com/uploads/displaying-19-gallery-images-for-linkedin-logo-png-25.png" style={{height: "2rem" }}/></a>
            </div>

            <p className={`${styles.footer_p} ${styles.p}`} style={{cursor: "pointer"}} onClick={scrollToTop}>© 2023 devesh krishan | personal portfolio.</p>
        </div>
    );
}