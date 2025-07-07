import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import RequireAuth from './components/auth/RequireAuth';
import DataDashboardPage from './pages/DataDashboardPage';
import RaceResultsPage from './pages/RaceResultsPage';
import PublicResultsPage from './pages/PublicResultsPage';
import ModelProcessPage from './pages/ModelProcessPage';
import QuantumRankingsPage from './pages/QuantumRankingsPage';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from 'react-query';
import StatpalDashboardPage from './pages/StatpalDashboardPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/results" element={<RaceResultsPage />} />
            <Route path="/statpal" element={<StatpalDashboardPage />} />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/data-dashboard" element={
              <RequireAuth>
                <DataDashboardPage />
              </RequireAuth>
            } />
            <Route path="/public-results" element={<PublicResultsPage />} />
            <Route path="/model-process" element={<ModelProcessPage />} />
            <Route path="/quantum-rankings" element={<QuantumRankingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
