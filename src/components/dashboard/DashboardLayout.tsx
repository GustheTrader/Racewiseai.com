import React from 'react';
import AdminLink from '../AdminLink';
import UserProfile from '../UserProfile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import RacewiseLogo from './RacewiseLogo';
import { AppSidebar } from '../AppSidebar';
import DataFreshnessIndicator from './DataFreshnessIndicator';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  extraButtons?: React.ReactNode;
  lastUpdatedAt?: number | null;
  isLoading?: boolean;
  nextUpdateIn?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle,
  extraButtons,
  lastUpdatedAt = null,
  isLoading = false,
  nextUpdateIn
}) => {
  const navigate = useNavigate();
  const [zoom, setZoom] = React.useState<number>(0.75);

  React.useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // iPad range: scale tighter so dashboard fits without horizontal scroll
      if (w < 820) setZoom(0.5);
      else if (w < 1024) setZoom(0.6);
      else if (w < 1280) setZoom(0.7);
      else if (w < 1600) setZoom(0.75);
      else setZoom(0.85);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full animated-gradient-bg text-foreground relative overflow-auto origin-top-left" style={{ zoom }}>
        {/* Ambient orbs */}
        <div className="floating-orb w-[600px] h-[600px] bg-blue-500/20 -top-64 -left-64" />
        <div className="floating-orb w-[500px] h-[500px] bg-purple-500/20 top-1/2 -right-48" style={{ animationDelay: '-10s' }} />
        <div className="floating-orb w-[400px] h-[400px] bg-cyan-500/15 bottom-0 left-1/3" style={{ animationDelay: '-5s' }} />
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative z-10">
          <header className="m-2 md:m-3 lg:m-4 mb-0 glass-header p-3 md:p-4 lg:p-5">
            <h1 className="sr-only">{title}</h1>
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                <RacewiseLogo />
              <div className="hidden md:block h-10 w-px bg-gradient-to-b from-transparent via-muted-foreground/30 to-transparent" />
                <p className="hidden md:block text-xs lg:text-sm">
                  <span className="text-muted-foreground">AI/ML powered </span>
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-medium">
                    {subtitle}
                  </span>
                </p>
                <DataFreshnessIndicator
                  lastUpdatedAt={lastUpdatedAt}
                  isLoading={isLoading}
                  nextUpdateIn={nextUpdateIn}
                />
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {extraButtons}
                <Button
                  onClick={() => navigate('/quantum-rankings')}
                  className="glass-button-secondary text-foreground px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm"
                >
                  Quantum AI Rankings
                </Button>
                <UserProfile />
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-2 md:p-3 lg:p-4 overflow-auto custom-scrollbar">
            {children}
          </div>
          
          <AdminLink />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
