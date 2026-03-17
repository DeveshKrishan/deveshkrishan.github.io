import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Projects from './Projects';
import About from './About';
import Footer from './Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <About />
        <Projects />
        <Footer />
      </div>
    </>
  );
}

export default App;
