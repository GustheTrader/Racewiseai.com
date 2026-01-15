import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import AdminToolboxPage from "./pages/AdminToolboxPage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import RaceResultsPage from "./pages/RaceResultsPage";
import PublicResultsPage from "./pages/PublicResultsPage";
import ResultsPage from "./pages/ResultsPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/auth/AuthContext";
import QuantumRankingsPage from "./pages/QuantumRankingsPage";
import ModelProcessPage from "./pages/ModelProcessPage";
import VideoPerformancePage from "./pages/VideoPerformancePage";

// Admin sub-pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminScrapingPage from "./pages/admin/AdminScrapingPage";
import AdminSchedulePage from "./pages/admin/AdminSchedulePage";
import AdminDataPage from "./pages/admin/AdminDataPage";
import AdminModelsPage from "./pages/admin/AdminModelsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

// Animated route wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="route-wrapper">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/public-results" element={<PublicResultsPage />} />
        <Route path="/model-process" element={<ModelProcessPage />} />

        {/* Protected Routes (Require Authentication) */}
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <Index />
            </RequireAuth>
          } 
        />
        <Route 
          path="/results" 
          element={
            <RequireAuth>
              <ResultsPage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/quantum-rankings" 
          element={
            <RequireAuth>
              <QuantumRankingsPage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/video-performance" 
          element={
            <RequireAuth>
              <VideoPerformancePage />
            </RequireAuth>
          } 
        />

        {/* Admin Routes with sub-pages */}
        <Route 
          path="/admin" 
          element={
            <RequireAuth requireAdmin={true}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminScrapingPage />} />
          <Route path="schedule" element={<AdminSchedulePage />} />
          <Route path="data" element={<AdminDataPage />} />
          <Route path="models" element={<AdminModelsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Legacy admin route - redirect to new admin */}
        <Route 
          path="/admin-toolbox" 
          element={
            <RequireAuth requireAdmin={true}>
              <AdminToolboxPage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/results/:trackName" 
          element={
            <RequireAuth requireAdmin={true}>
              <RaceResultsPage />
            </RequireAuth>
          } 
        />
        
        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
