import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Skills from './Skills';
import Activity from './Activity';
import Footer from './Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <Skills />
        <Activity />
        <section className="coming-soon">
          <p>more coming soon..</p>
        </section>
        <Footer />
      </div>
    </>
  );
}

export default App;
