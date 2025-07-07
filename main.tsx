
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize default Odds Pulse configuration if not already set
if (localStorage.getItem('ODDS_PULSE_ENABLED') === null) {
  localStorage.setItem('ODDS_PULSE_ENABLED', 'false'); // Disabled by default
  localStorage.setItem('ODDS_PULSE_POLLING_INTERVAL', '60'); // 60 seconds default
}

createRoot(document.getElementById("root")!).render(<App />);
