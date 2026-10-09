import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';

import { CONTACT_EMAIL } from './constants';
import Skills from './Skills';

const profilePhoto = new URL('./assets/profile-photo.jpg', import.meta.url).href;

const birthDate = new Date(2003, 1, 1); // February 2003
const ageMs = Date.now() - birthDate.getTime();
const ageDate = new Date(ageMs);
const age = Math.round(ageDate.getUTCFullYear() - 1970);

function Welcome() {
  return (
    <div className="intro_spacing">
      <p className="hero-wordmark">Devesh Krishan</p>
      <div className="intro">
        <div className="intro-photo">
          <img src={profilePhoto} alt="Devesh Krishan" />
        </div>
        <div className="intro-details">
          <div className="intro-copy">
            <h2 className="intro-heading">my introduction</h2>
            <p className="intro-name" id="name">
              what&apos;s up, i&apos;m devesh (duh-vesh)!
            </p>
            <h2 className="intro-title" id="who">
              video editor turned software engineer. i&apos;m {age} years old and work at{' '}
              <span className="intro-geico">GEICO</span> as a swe 2. i&apos;m located in the san
              francisco bay area and am an alumni from the university of california, irvine.
            </h2>
            <div className="icon-list">
              <a href="https://www.linkedin.com/in/deveshkrishan/" target="_blank" rel="noreferrer">
                <FaLinkedin className="icon" aria-hidden="true" focusable="false" />
                LinkedIn →
              </a>
              <a href="https://github.com/DeveshKrishan" target="_blank" rel="noreferrer">
                <FaGithub className="icon" aria-hidden="true" focusable="false" />
                GitHub →
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <HiOutlineMail className="icon" aria-hidden="true" focusable="false" />
                Email →
              </a>
            </div>
          </div>
          <Skills />
        </div>
      </div>
    </div>
  );
}

export default Welcome;
