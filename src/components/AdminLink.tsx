import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

const AdminLink = () => {
  const navigate = useNavigate();
  
  const handleAdminClick = () => {
    navigate('/admin');
  };

  // TEMPORARILY VISIBLE FOR TESTING - Remove this comment and restore isAdmin check later
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAdminClick}
        className="bg-gradient-to-r from-cyan-600/80 to-purple-600/80 border-cyan-500/50 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20"
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin Dashboard
      </Button>
    </div>
  );
};

export default AdminLink;
