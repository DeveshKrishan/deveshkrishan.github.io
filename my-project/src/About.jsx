import { Grid, Col, Card, Text, Title, Flex, Subtitle, Metric, Button} from "@tremor/react";
import avatar from "./assets/avatar.png";
import linkedin from "./assets/linkedin.png";
import github from "./assets/github.png";
import leetcode from "./assets/code.png";

function About(){
    return (
        <div className="about" id="about-link">
            <h2 id="know">Get to know me a little bit!</h2>
            <div className="about-grid">
                <Card className="about-card">
                    <Metric>Devesh Krishan</Metric>
                    <Text>I am currently pursing a Bachelors of Science in Computer Science at the University of California, Irvine.
                        I am a highly motivated and enthusiastic Software Engineer with a strong passion for web development and data analytics. I enjoy mixing my creative background with my technical skills to create innovative and well-thought solutions.I have experience solving problems using cutting-edge technology and tools. Possessing a positive attitude and a growth-oriented mindset, I am constantly seeking opportunities to expand my knowledge and skills as a Software Engineer.</Text>
                    <div className="icon-list">
                        <a href="https://www.linkedin.com/in/deveshkrishan/" target="_blank">
                            <img src={linkedin} className="icon"/>
                        </a>
                        <a href="https://github.com/DeveshKrishan" target="_blank">
                            <img src={github} className="icon"/>
                        </a>
                        <a href="https://leetcode.com/Dkrishan/" target="_blank">
                            <img src={leetcode} className="icon"/>
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default About;