import { Grid, Card, Text, Metric, Flex, ProgressBar, List, ListItem } from "@tremor/react";

const skill = [
    {lang: "Python", 
    metric: 95,
    color: "green"},

    {lang: "HTML/CSS", 
    metric: 88,
    color: "purple"},

    {lang: "SQL", 
    metric: 85,
    color: "blue"},

    {lang: "Javascript", 
    metric: 79,
    color: "yellow"},

    {lang: "C++/C", 
    metric: 75,
    color: "slate"},

    {lang: "Java", 
    metric: 65,
    color: "red"},
]

const framew = [
    "React", "Node", "Vite", "Typescript", "Microsoft Azure", "MongoDB" ,"Flask", "Express", "Google App Script"
]

function Skills(){
    return (
        <div className="skill_section" id="skill-link">
            <h2 id="skill">My Skills</h2>
          <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-2 skill-grid">
            <Card>
            <Metric id="lang">Languages</Metric>
            <div className="lang-list">
            {skill.map((item) => (
                <>
                    <Flex>
                    <Text>{item.lang}</Text>
                    </Flex>
                    <ProgressBar value={item.metric} color={item.color} className="mt-3" />
                </> 
                ))}
            </div>
            </Card>

            
            <Card>
            <Metric id="tech">Frameworks/Technology</Metric>
            <List>
            {framew.map((item) => (
                <ListItem key={item}>
                    <span>{item}</span>
                </ListItem>
            ))}
            </List>
            </Card>
            
        </Grid>
        </div>
    )
}

export default Skills;