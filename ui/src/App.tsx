import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import Welcome from './Welcome';
import './App.css';
import Navbar from './Navbar';
import Activity from './Activity';
import Footer from './Footer';
import { useReveal } from './useReveal';
import { WidgetBoundary } from './WidgetBoundary';

function App() {
  useReveal();

  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Welcome />
        <WidgetBoundary label="activity">
          <Activity />
        </WidgetBoundary>
        <WidgetBoundary label="the footer">
          <Footer />
        </WidgetBoundary>
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
