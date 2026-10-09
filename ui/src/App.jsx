import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Activity from './Activity';
import Footer from './Footer';

function App() {
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
