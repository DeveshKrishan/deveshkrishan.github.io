import linkedin from './assets/linkedin.png';
import github from './assets/github.png';

const profilePhoto = new URL('./assets/100_3406.JPG', import.meta.url).href;

const birthDate = new Date(2003, 1, 1); // February 2003
const ageMs = Date.now() - birthDate.getTime();
const ageDate = new Date(ageMs);
const age = Math.round(ageDate.getUTCFullYear() - 1970);

function Welcome() {
  return (
    <div className="intro_spacing">
      <div className="intro">
        <div className="intro-photo">
          <img src={profilePhoto} alt="Devesh Krishan" />
        </div>
        <div className="intro-details">
          <p className="intro-name" id="name">
            what&apos;s up, i&apos;m devesh (duh-vesh)!
          </p>
          <h2 className="intro-title" id="who">
            video editor turned software engineer. i&apos;m {age} years old, currently work at{' '}
            <span className="intro-geico">GEICO</span> as a swe 2, and am located in san jose,
            california.
          </h2>
          <div className="icon-list">
            <a href="https://www.linkedin.com/in/deveshkrishan/" target="_blank" rel="noreferrer">
              <img src={linkedin} className="icon" alt="LinkedIn" />
            </a>
            <a href="https://github.com/DeveshKrishan" target="_blank" rel="noreferrer">
              <img src={github} className="icon" alt="GitHub" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
