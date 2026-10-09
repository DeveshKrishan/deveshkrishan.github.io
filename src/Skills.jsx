/**
 * Grouped skills — edit `SKILL_GROUPS` to match your experience.
 */
const SKILL_GROUPS = [
  {
    title: 'languages',
    items: ['Go', 'TypeScript', 'Python', 'SQL'],
  },
  {
    title: 'frontend',
    items: ['React', 'Vite', 'Vitest', 'Accessibility'],
  },
  {
    title: 'apis & data',
    items: ['GraphQL', 'REST APIs', 'PostgreSQL'],
  },
  {
    title: 'platform & observability',
    items: ['Docker', 'Kubernetes', 'CI/CD', 'Grafana'],
  },
];

function Skills() {
  return (
    <section className="intro-skills" id="skills" aria-labelledby="skills-heading">
      <h2 className="intro-skills-heading" id="skills-heading">
        skills
      </h2>
      <div className="intro-skills-groups">
        {SKILL_GROUPS.map((group) => (
          <div className="intro-skills-group" key={group.title}>
            <h3 className="intro-skills-group-title">{group.title}</h3>
            <ul className="intro-skills-chips">
              {group.items.map((item) => (
                <li key={item} className="intro-skills-chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
