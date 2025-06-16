
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, Wifi } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface StatusBarProps {
  lastUpdated: string;
  nextUpdateIn: number;
  onRefresh: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ lastUpdated, nextUpdateIn, onRefresh }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-betting-darkPurple/90 to-betting-darkPurple/70 border-2 border-betting-tertiaryPurple/50 rounded-xl text-sm backdrop-blur-sm shadow-lg hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center relative z-10">
        <div className="flex items-center border-r border-betting-tertiaryPurple/50 pr-3 mr-3">
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-2 animate-pulse shadow-lg shadow-green-400/50"></div>
          <Wifi className="h-4 w-4 text-green-400 mr-1" />
          <span className="text-gray-300 font-medium">Live</span>
        </div>
        <span className="text-gray-400">
          Last updated: <span className="text-white font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{lastUpdated}</span>
        </span>
        <span className="text-gray-400 ml-4">
          Next update in: <span className="text-white font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{nextUpdateIn}s</span>
        </span>
      </div>
      <div className="flex items-center space-x-2 relative z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-gray-300 hover:text-white bg-gradient-to-r from-gray-800/50 to-gray-900/30 border border-white/10 backdrop-blur-sm hover:border-purple-500/30">
              Actions <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gradient-to-br from-betting-darkPurple/95 to-betting-darkPurple/90 border-betting-tertiaryPurple/50 backdrop-blur-lg">
            <DropdownMenuLabel className="text-white font-medium">Quick Links</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-betting-tertiaryPurple/30" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-purple-500/20">
                <Link to="/admin" className="w-full">
                  Admin Panel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-purple-500/20">
                <Link to="/results/all" className="w-full">
                  Race Results
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-purple-500/20">
                <Link to="/quantum-rankings" className="w-full">
                  Quantum 5D Rankings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-betting-tertiaryPurple/30" />
            <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-purple-500/20">
              <button className="w-full text-left" onClick={onRefresh}>
                Refresh Now
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-betting-tertiaryPurple/50 text-white hover:bg-betting-tertiaryPurple/20 bg-gradient-to-r from-gray-800/50 to-gray-900/30 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StatusBar;
