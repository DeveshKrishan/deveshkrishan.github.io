import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Projects from './Projects';
import Footer from './Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <Projects />
        <Footer />
      </div>
    </>
  );
}

export default App;
