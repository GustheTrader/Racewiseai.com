
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./src/pages/Index";
import AdminPage from "./src/pages/AdminPage";
import AuthPage from "./src/pages/AuthPage";
import NotFound from "./src/pages/NotFound";
import RaceResultsPage from "./src/pages/RaceResultsPage";
import PublicResultsPage from "./src/pages/PublicResultsPage";
import RequireAuth from "./src/components/RequireAuth";
import { AuthProvider } from "./src/contexts/auth/AuthContext";
import DataDashboardPage from "./src/pages/DataDashboardPage";
import QuantumRankingsPage from "./src/pages/QuantumRankingsPage";
import ModelProcessPage from "./src/pages/ModelProcessPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/results" 
              element={<PublicResultsPage />} 
            />
            <Route 
              path="/model-process" 
              element={<ModelProcessPage />} 
            />

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
              path="/quantum-rankings" 
              element={
                <RequireAuth>
                  <QuantumRankingsPage />
                </RequireAuth>
              } 
            />

            {/* Admin Routes (Require Admin Role) */}
            <Route 
              path="/admin" 
              element={
                <RequireAuth requireAdmin={true}>
                  <AdminPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/data-dashboard" 
              element={
                <RequireAuth requireAdmin={true}>
                  <DataDashboardPage />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
