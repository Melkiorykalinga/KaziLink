import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import BrowseJobs from './pages/BrowseJobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import WorkerProfile from './pages/WorkerProfile';
import BrowseWorkers from './pages/BrowseWorkers';
import EmployerDashboard from './pages/EmployerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Messages from './pages/Messages';

function App() {
  return (
    <AppProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/workers/:id" element={<WorkerProfile />} />
        <Route path="/browse-workers" element={<BrowseWorkers />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
      <Footer />
    </AppProvider>
  );
}

export default App;
