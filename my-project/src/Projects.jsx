import { Card, Grid, Metric, Text,Title, Badge} from "@tremor/react";
import cs_image from "./assets/cine_score_image.png"
import pv_image from "./assets/poverty_map_image.png"
import stu_image from "./assets/student_progress_report_image.png"
import placeholder_image from "./assets/placeholder.png"

  const work = [
    {title: "U.S. Poverty Map", tools: [ "React", "Node", "Python", "R", "React Simple Maps", "Recharts", "React D3", "Git"], link: "https://united-states-poverty-map.vercel.app/#",desc: "Spearheaded the development of a dynamic frontend web application using React, showcasing U.S. poverty rates and income data from 1996 to 2020. Engineered an interactive U.S. map with color-coded indicators for poverty rates, enabling users to focus on individual states for detailed analysis through line graphs. This feature covers poverty rate trends, annual income statistics, and population figures in poverty. Implemented year-wise filtering and multi-data view capabilities, including comprehensive income data visualization and executed real-time data retrieval from the U.S. Census Bureau API, coupled with an efficient Python-based optimization of a 72,000-line CSV Time Series dataset. Ensured instantaneous loading of all graphical data representations." , image: pv_image,key: 0},
    {title: "CineScore ", tools: ["Vite", "Typescript", "Tailwind CSS", "Microsoft Azure SQL Database", "Python", "Flask", "MovieDB API", "Git"], link: "https://github.com/DeveshKrishan/Cine-Score-App",desc: "Developed a full-stack web application using Flask serving a REST API with React as the frontend. Engineered a relational database using Microsoft Azure SQL, guided by ER diagrams, to efficiently manage user and movie data. Crafted SQL queries to streamline backend data retrieval. Ensured robust application performance through comprehensive Python unit testing. Prioritized user privacy byimplementing encryption for user data and integrating secure authentication protocols. Adopted Agile practices to optimize team collaboration and project management, resulting in a 20% acceleration in project delivery.", image: cs_image, key: 1},
    {title: "Algorizz", tools: ["Ionic", "Typescript", "MongoDB", "Vite", "Node", "Tremor", "Git"], link: "https://github.com/DeveshKrishan/Algorizz",desc: "Designed a cross-platform mobile application that allows users to test themselves on various data structures and their methods’ time complexity. Implemented a non-relational database to store questions, user information, and statistics with MongoDB. Allowed users to view and set goals towards specific data structures as well and provided resources to learn.", image: placeholder_image, key: 2},
    {title: "Student Progress Report", tools: ["Google App Scripts", "Clasp", "Canvas LMS API", "Git"], link: "https://github.com/DeveshKrishan/Student-Progress-Report",desc: "Designed an automated Google Sheet that generates student progress reports for all students in a course. Statistical analysis shows completion with visualization aid from pie charts and tables. Created using Javascript, Git, Google App Script, Canvas LMS API, and Clasp. Employed Test-Driven Development to ensure robust code quality, resulting in a 25% reduction in production bugs", image: stu_image, key: 2},

];

const badgeColor = 
    {
        "Python" : "pink",
        "Typescript" : "blue",
        "Vite": "purple",
        "Git" : "red",
        "Ionic" : "teal",
        "Tailwind CSS" : "sky",
        "Google App Scripts": "amber",
        "Node": "yellow",
        "Microsoft Azure SQL Database": "indigo",
        "R": "emerald",
        "React" : "cyan",
        "MongoDB": "lime"
    };


function Projects(){
    return (
        <div className="work" id="portfolio-link">
            <h2 id="check">Check out my work.</h2>
            <div id="project_grid">
                <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
                {work.map((item) => (
                    <Card key={item.title} className="project-card">
                    <a href={item.link} target="_blank">
                        <img src={item.image}/>
                    </a>
                    <Metric>{item.title}</Metric>
                    <div className="lang-diff">
                        {item.tools.map((lang) => (
                            <Badge size="sm" color={lang in badgeColor ? badgeColor[lang] : "slate"}>{lang}</Badge>
                        ))}
                    </div>
                <Title>{item.desc}</Title>
                </Card>
                ))}
                </Grid>
            </div>
        </div>
    )
}

export default Projects;