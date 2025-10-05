
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
      <div className="min-h-screen flex w-full bg-betting-dark text-white">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="m-4 mb-6 flex justify-between items-center p-6 bg-betting-darkPurple/50 border border-betting-tertiaryPurple/30 rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(139,92,246,0.1)] backdrop-blur-sm">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
                {title}
              </h1>
              <p className="text-gray-400">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {extraButtons}
              <Button
                onClick={() => navigate('/quantum-rankings')}
                className="bg-betting-darkPurple/50 hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(139,92,246,0.1)] text-white font-bold px-6 py-2 rounded-2xl transition-all shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(139,92,246,0.1)] border border-orange-500/50"
              >
                Quantum AI Rankings
              </Button>
              <UserProfile />
            </div>
          </header>
          
          <div className="flex-1 px-4 pb-4">
            {children}
          </div>
          
          <AdminLink />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
