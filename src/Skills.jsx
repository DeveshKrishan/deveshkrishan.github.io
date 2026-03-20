/**
 * Grouped skills — edit `SKILL_GROUPS` to match your experience.
 */
const SKILL_GROUPS = [
  {
    title: 'Languages',
    items: ['Go', 'TypeScript', 'Python', 'SQL'],
  },
  {
    title: 'Frontend',
    items: ['React', 'Vite', 'Vitest', 'Accessibility'],
  },
  {
    title: 'APIs & data',
    items: ['GraphQL', 'REST APIs', 'PostgreSQL'],
  },
  {
    title: 'Platform & observability',
    items: ['Docker', 'Kubernetes', 'CI/CD', 'Grafana'],
  },
];

function Skills() {
  return (
    <section className="skills-section" id="skills" aria-labelledby="skills-heading">
      <h2 className="skills-heading" id="skills-heading">
        skills
      </h2>
      <p className="skills-lede">stuff my ai minions and i work on.</p>
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
