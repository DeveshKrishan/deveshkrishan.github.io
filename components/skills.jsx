import styles from "./Intro.module.css"

export default function Skills() {

        const languages = [
            {lang: "Python", key: 0},
            {lang: "C++", key: 1},
            {lang: "MySQL", key: 2},
            {lang: "Javascript", key: 3},
            {lang: "HTML/CSS", key: 4},
            {lang: "C", key: 6}]



        const frameworks = [
            {framework: "Node.js", key: 0},
            {framework: "Next.js", key: 1},
            {framework: "Flask", key: 2},
            {framework: "Express.js", key: 3},
            {framework: "Angular.js", key: 4}
        ]
    
            const languagesList = languages.map(language => 
                <li>{language.lang}</li>
            )

            const frameworksList = frameworks.map(framework =>
                <li>{framework.framework}</li>
                )

            return (
                <div className={styles.skills}>
                    <h2 className={styles.big} id={styles.about_title} style={{padding: "1rem 0"}}>Skills</h2>
                    <div className={styles.skills_content}>
                        <h3 className={`${styles.lang_title} ${styles.skills_mini}`} style={{padding: "1rem 0"}} >Languages</h3>
                        
                        <div className={`${styles.lang_list} ${styles.skill_lang_list} ${styles.p}`}>{languagesList}</div>
                        <h3 className={styles.skills_mini}>Frameworks</h3>
                        <div className={`${styles.framework_list} ${styles.skill_lang_list} ${styles.p}`}>{frameworksList}</div>
                    </div>
                </div>
            );
}