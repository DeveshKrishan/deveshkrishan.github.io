import styles from "./Intro.module.css"
import sleepPic from "../app/icons/zzz.png"
import searchPic from "../app/icons/search.png"
import spotifyPic from "../app/icons/spotify.png"
import Link from 'next/link'

import Image from "next/image";

export default function Projects() {
    const projects = [
        {title: "Sleep Tracker", tools: "Built in Typescript, Sass, Capacitor Storage, and Iconic", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",desc: "Created a touch-screen mobile application for tracking users' sleep. Users can log overnight sleep, log their sleepiness during the day, and view the data logged", pic: sleepPic , key: 0},
        {title: "Search Engine", tools: "Created a Single Page Application using React.js, Typescript, Vite.js, Python, and Flask", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",desc: "Used multiprocessing, heaps, and page rank algorithms to improve the processing speed of queries",pic: searchPic, key: 1},
        {title: "Spotify Browser", tools: "Created a webpage using React.js, Javascript, Bootstrap, Node.js, and Spotify API", link: "https://github.com/ph-long/a5-spotify-react",desc: "Users can log into their account, search for a song, and visit artist, album, and track pages",pic: spotifyPic ,key: 2},

    ];

    const code = "Learn More!"

    const listProjects= projects.map(project => 
        <div className={`${styles.projectbg}`}>
            <div className={styles.project_show}>
                <h3 className={`${styles.pblack} ${styles.p}`}>{project.title}</h3>
                <p className={`${styles.built} ${styles.little}`}>{project.tools}</p>
                <p className={`${styles.pblack} ${styles.little} ${styles.project_desc}`} >{project.desc}</p>
                <Link href={project.link} target="_blank">
                    <button className={`${styles.project_button} ${styles.p}`}>{code} </button>
                </Link>
            </div>
            <div className={styles.project_pic_wrapper}>
                <Image src={project.pic} alt="Zzz logo" className={styles.project_pic}/>
            </div>
        </div>
        )

    return (
        <div className={styles.project_wrapper} id="project_link">{listProjects}</div>
    )
}