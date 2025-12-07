import React from 'react';
import AdminLink from '../AdminLink';
import UserProfile from '../UserProfile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  extraButtons?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle,
  extraButtons
}) => {
  const navigate = useNavigate();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full animated-gradient-bg text-foreground relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="floating-orb w-[600px] h-[600px] bg-blue-500/20 -top-64 -left-64" />
        <div className="floating-orb w-[500px] h-[500px] bg-purple-500/20 top-1/2 -right-48" style={{ animationDelay: '-10s' }} />
        <div className="floating-orb w-[400px] h-[400px] bg-cyan-500/15 bottom-0 left-1/3" style={{ animationDelay: '-5s' }} />
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative z-10">
          <header className="m-4 mb-0 glass-header p-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gradient">
                  {title}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {subtitle}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {extraButtons}
                <Button
                  onClick={() => navigate('/quantum-rankings')}
                  className="glass-button-secondary text-foreground px-4 py-2 text-sm"
                >
                  Quantum AI Rankings
                </Button>
                <UserProfile />
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-4 overflow-auto custom-scrollbar">
            {children}
          </div>
          
          <AdminLink />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
