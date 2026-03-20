/**
 * Grouped skills — edit `SKILL_GROUPS` to match your experience.
 */
const SKILL_GROUPS = [
  {
    title: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
  },
  {
    title: 'Frontend',
    items: ['React', 'HTML & CSS', 'Tailwind CSS', 'Vite', 'Web accessibility'],
  },
  {
    title: 'Backend & APIs',
    items: ['REST APIs', 'Node.js', 'Integration testing', 'Observability basics'],
  },
  {
    title: 'Tools & delivery',
    items: ['Git', 'GitHub', 'CI/CD', 'Docker', 'Agile / Scrum'],
  },
];

function Skills() {
  return (
    <section className="skills-section" id="skills" aria-labelledby="skills-heading">
      <h2 className="skills-heading" id="skills-heading">
        skills
      </h2>
      <p className="skills-lede">
        A concise snapshot of technologies and practices I use day to day.
      </p>
      <div className="skills-grid">
        {SKILL_GROUPS.map((group) => (
          <div className="skills-group" key={group.title}>
            <h3 className="skills-group-title">{group.title}</h3>
            <ul className="skills-group-list">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
