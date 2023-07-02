"use client"

import styles from "./Intro.module.css"
import 'animate.css';
import Link from 'next/link'

export default function Navbar() {

    return (
        <div className={`${styles["navbar"]} ${styles["p"]} animate__animated animate__fadeInDown animate__delay-1s`}>
            <p className={styles.logo}>DK</p>
            <ul className={styles.project_list}>
                <Link href="#work_link" className={styles.a}>
                  <li>Projects</li>
                </Link>
                <Link href="#about_link" className={styles.a}>
                  <li>About</li>
                </Link>
                <Link href="https://drive.google.com/file/d/1KQgEyT3Wi89fG2DntL4P70fLOY0B_vAH/view?usp=sharing" target="_blank" className={styles.a}>
                  <li>Resume</li>
                </Link>
            </ul>
        </div>

    )
}