import { Grid, Card, Text, Metric, Flex, ProgressBar  } from "@tremor/react";

const skill = [
    {lang: "Python", 
    metric: 95,
    color: "green"},

    {lang: "HTML/CSS", 
    metric: 85,
    color: "purple"},

    {lang: "SQL", 
    metric: 75,
    color: "blue"},

    {lang: "Javascript", 
    metric: 75,
    color: "yellow"},

    {lang: "C++/C", 
    metric: 45,
    color: "teal"},

    {lang: "Java", 
    metric: 25,
    color: "red"},
]

const framew = [
    "React", "Node", "Vite", "Typescript", "Flask", "Express", "Google App Script"
]

function Skills(){
    return (
        <div className="skill_section">
            <h2 id="skill">My Skills</h2>
          <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-2 skill-grid">
            <Card>
            <Metric>Languages</Metric>
            {skill.map((item) => (
                <>
                    <Flex>
                    <Text>{item.lang}</Text>
                    </Flex>
                    <ProgressBar value={item.metric} color={item.color} className="mt-3" />
                </> 
                ))}
            </Card>
            <Card>
            <Metric>Frameworks</Metric>
            {framew.map((item))}
            </Card>
            
        </Grid>
        </div>
    )
}

export default Skills;