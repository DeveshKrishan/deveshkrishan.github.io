const profilePhoto = new URL('./assets/100_3406.JPG', import.meta.url).href;

function Welcome() {
  return (
    <div className="intro_spacing">
      <div className="intro">
        <div className="intro-photo">
          <img src={profilePhoto} alt="Devesh Krishan" />
        </div>
        <div className="intro-details">
          <p className="intro-name" id="name">
            what&apos;s up, i&apos;m devesh!
          </p>
          <h2 className="intro-title" id="who">
            video editor turned software engineer. i currently work at{' '}
            <span className="intro-geico">GEICO</span> as a swe 2 and am located in the bay area.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
