import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState('worker'); // 'worker' or 'employer'
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);

  const toggleRole = () => {
    setUserRole(prev => prev === 'worker' ? 'employer' : 'worker');
  };

  const applyToJob = (jobId) => {
    if (!applications.includes(jobId)) {
      setApplications(prev => [...prev, jobId]);
    }
  };

  const toggleFavorite = (jobId) => {
    setFavorites(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const postJob = (job) => {
    setPostedJobs(prev => [...prev, { ...job, id: Date.now(), postedDate: 'Just now', applicants: 0 }]);
  };

  return (
    <AppContext.Provider value={{
      userRole,
      setUserRole,
      toggleRole,
      applications,
      applyToJob,
      favorites,
      toggleFavorite,
      postedJobs,
      postJob,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
