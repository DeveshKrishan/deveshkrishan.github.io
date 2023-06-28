
import Navbar from '@/components/navbar'
import Intro from '@/components/intro'
import Work from '@/components/work'
import About from '@/components/about'
import Skills from '@/components/skills'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className='wrapper'>
        <Navbar/>
        <Intro/>
        <Work/>
        <About/>
        <Skills/>
        <Footer/>
    </div>
  )
}
