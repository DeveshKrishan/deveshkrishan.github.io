import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Activity from './Activity';
import Projects from './Projects';
import Footer from './Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <Activity />
        <Projects />
        <Footer />
      </div>
    </>
  );
}

export default App;
