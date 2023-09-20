import { Card, Grid, Metric, Text,Title, Badge} from "@tremor/react";
import cs_image from "./assets/cine_score_image.png"
import pv_image from "./assets/poverty_map_image.png"
import stu_image from "./assets/student_progress_report_image.png"
import placeholder_image from "./assets/placeholder.png"

  const work = [
    {title: "U.S. Poverty Map", tools: [ "React", "Node", "Python", "R", "React Simple Maps", "Recharts", "React D3", "Git"], link: "https://united-states-poverty-map.vercel.app/#",desc: "Led a team to develop a responsive web application that displays poverty rates and annual income from 1996 - 2020. Created an interactive map of the US with visual color indicators for poverty rates, as well as the ability to isolate one state and view line graphs for poverty rate history, annual income history, and number of people in poverty. The country map also supports filtering by year and has options to view multiple types of data including annual income data." , image: pv_image,key: 0},
    {title: "CineScore ", tools: ["Vite", "Typescript", "Tailwind CSS", "Microsoft Azure SQL Database", "Python", "Flask", "MovieDB API", "Git"], link: "https://github.com/DeveshKrishan/Cine-Score-App",desc: "Lead developer for building a web application that shows the latest and most popular movies for users to review. Designed a deep learning model to recommend movies to users based on users’ favorite movies and genres visited. Users can express interest in certain movies, search for a movie, and see average ratings and genre. Implemented a database designed by ER diagrams to store user and movie information with Azure SQL Database.", image: cs_image, key: 1},
    {title: "Algorizz", tools: ["Ionic", "Typescript", "MongoDB", "Vite", "Node", "Tremor", "Git"], link: "https://github.com/DeveshKrishan/Algorizz",desc: "Designed a cross-platform mobile application that allows users to test themselves on various data structures and their methods’ time complexity. Implemented a non-relational database to store questions, user information, and statistics with MongoDB. Allowed users to view and set goals towards specific data structures as well and provided resources to learn.", image: placeholder_image, key: 2},
    {title: "Student Progress Report", tools: ["Google App Scripts", "Clasp", "Canvas LMS API", "Git"], link: "https://github.com/DeveshKrishan/Student-Progress-Report",desc: "Built a system that performs data analysis and generates student progress reports for all students in a course with modules. Developed web application aspect for graphical representations (pie graphs) of results of data analysis to showcase module completion rates for homework, classwork, and quizzes within a quarter so professors can assess the class’s completion rate. Stores last updated progress report time stamp.", image: stu_image, key: 2},

];

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
                            <Badge size="sm">{lang}</Badge>
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