import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Predictions from './pages/Predictions';
import News from './pages/News';
import HazardZones from './pages/HazardZones';
import MonsoonTracker from './pages/MonsoonTracker';
import EmergencyContacts from './pages/EmergencyContacts';
import LandslideGuide from './pages/LandslideGuide';
import SensorNetwork from './pages/SensorNetwork';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/news" element={<News />} />
            <Route path="/hazard-zones" element={<HazardZones />} />
            <Route path="/monsoon" element={<MonsoonTracker />} />
            <Route path="/emergency" element={<EmergencyContacts />} />
            <Route path="/guide" element={<LandslideGuide />} />
            <Route path="/network" element={<SensorNetwork />} />
          </Routes>
        </Layout>
      </Router>
    </SocketProvider>
  );
}

export default App;
