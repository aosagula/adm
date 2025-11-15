import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from '@components/Layout';
import Dashboard from '@pages/Dashboard';
import Projects from '@pages/Projects';
import Agents from '@pages/Agents';
import Templates from '@pages/Templates';
import Technologies from '@pages/Technologies';
import Platforms from '@pages/Platforms';
import Tags from '@pages/Tags';
import Login from '@pages/Login';
import { useAuthStore } from '@store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId/agents" element={<Agents />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Layout>
  );
}

export default App;
