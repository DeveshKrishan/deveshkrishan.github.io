import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Activity from './Activity';
import Footer from './Footer';
import { useReveal } from './useReveal';

function App() {
  useReveal();

  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <Activity />
        <Footer />
      </div>
    </>
  );
}

export default App;
