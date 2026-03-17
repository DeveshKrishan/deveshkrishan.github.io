// Placeholder data; kept in activity.yaml as reference for now
const activity = {
  songs: [
    { title: 'Nights', artist: 'Frank Ocean' },
    { title: 'Love Galore', artist: 'SZA' },
    { title: 'Stargirl Interlude', artist: 'The Weeknd' },
  ],
  commits: [
    { repo: 'deveshkrishan.github.io', message: 'Refresh personal site layout' },
    { repo: 'side-project', message: 'Add new feature flag system' },
    { repo: 'another-cool-idea', message: 'Spike new concept for fun' },
  ],
};

function Activity() {
  return (
    <section className="activity-section">
      <h2 className="activity-heading">what i&apos;ve been up to</h2>
      <div className="activity-grid">
        <div className="activity-column">
          <h3>recent songs</h3>
          <ul>
            {activity.songs.map((song, index) => (
              <li key={index}>
                <span className="activity-main">{song.title}</span>
                <span className="activity-sub"> by {song.artist}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="activity-column">
          <h3>recent commits</h3>
          <ul>
            {activity.commits.map((commit, index) => (
              <li key={index}>
                <span className="activity-main">{commit.repo}</span>
                <span className="activity-sub"> — {commit.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Activity;
