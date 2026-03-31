import React from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, Zap, Database, Settings, FileText, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import racewiseLogo from '@/assets/racewise-logo.webp';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: 'Scraping', icon: Zap, end: true },
    { to: '/admin/schedule', label: 'Schedule', icon: Calendar },
    { to: '/admin/data', label: 'Data Viewer', icon: Database },
    { to: '/admin/models', label: 'Models', icon: FileText },
    { to: '/admin/email', label: 'Email', icon: Mail },
    { to: '/admin/broadcast', label: 'Broadcast', icon: Send },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <img src={racewiseLogo} alt="RaceWise" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-amber-500">ADMIN</span> <span className="text-foreground">DASHBOARD</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Scraping & Data Management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-border"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Dashboard
            </Button>
            
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30">Admin</Badge>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
