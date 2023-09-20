import Welcome from "./Welcome"
import './App.css'
import Navbar from './Navbar'
import Projects from "./Projects"
import Skills from "./Skills"
import About from "./About"

function App() {

  return (
    <>
      <Navbar/>
      <div className="main-layout">
        <Welcome/>
        <Skills/>
        <About/>
        <Projects/>
      </div>
    </>
  )
}

export default App
