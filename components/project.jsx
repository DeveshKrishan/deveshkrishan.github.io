import styles from "./Intro.module.css"

export default function Projects() {
    const projects = [
        {title: "Sleep Tracker", tools: "Built in Typescript, Sass, Capacitor Storage, and Iconic", desc: "Created a touch-screen mobile application for tracking users' sleep. Users can log overnight sleep, log their sleepiness during the day, and view the data logged", key: 0},
        {title: "Search Engine", tools: "Created a Single Page Application using React.js, Typescript, Vite.js, Python, and Flask", desc: "Used multiprocessing, heaps, and page rank algorithms to improve the processing speed of queries", key: 1},
        {title: "Spotify Browser", tools: "Created a webpage using React.js, Javascript, Bootstrap, Node.js, and Spotify API", desc: "Users can log into their account, search for a song, and visit artist, album, and track pages", key: 2},

    ];

    const code = "Code </>"

    const listProjects= projects.map(project => 
        <div className={styles.projectbg}>
            <h3 className={`${styles.pblack} ${styles.p}`}>{project.title}</h3>
            <p className={`${styles.built} ${styles.little}`} style={{padding: "0.5rem 0"}}>{project.tools}</p>
            <p className={`${styles.pblack} ${styles.little} ${styles.project_desc}`} style={{padding: "1rem 0"}}>{project.desc}</p>
            <button className={`${styles.project_button} ${styles.p}`}>{code} </button>
        </div>
        )

    return (
        <div className={styles.project_wrapper}>{listProjects}</div>
    )
}