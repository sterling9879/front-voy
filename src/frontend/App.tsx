import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/UI/Layout';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HypothesesPage from './pages/HypothesesPage';
import TimelinePage from './pages/TimelinePage';
import ProjectsPage from './pages/ProjectsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<DashboardPage />} />
        <Route path="projects/:projectId/board" element={<BoardPage />} />
        <Route path="projects/:projectId/analytics" element={<AnalyticsPage />} />
        <Route path="projects/:projectId/hypotheses" element={<HypothesesPage />} />
        <Route path="projects/:projectId/timeline" element={<TimelinePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
