
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import { useNavigate } from 'react-router-dom';

interface RaceNavBarProps {
  currentTrack?: string;
  currentRace?: number;
  mtp?: number;
  allowanceInfo?: {
    purse: string;
    age: string;
    distance: string;
    surface: string;
  };
  onTrackChange?: (track: string) => void;
  onRaceChange?: (race: number) => void;
}

const RaceNavBar: React.FC<RaceNavBarProps> = ({
  currentTrack = "CHURCHILL DOWNS",
  currentRace = 7,
  mtp = 21,
  allowanceInfo = {
    purse: "$127K",
    age: "3YO+",
    distance: "6F",
    surface: "Fast"
  },
  onTrackChange,
  onRaceChange
}) => {
  const navigate = useNavigate();
  const [track, setTrack] = useState(currentTrack);
  const [race, setRace] = useState(currentRace);

  const races = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleTrackChange = (value: string) => {
    setTrack(value);
    if (onTrackChange) onTrackChange(value);
  };

  const handleRaceChange = (value: string) => {
    const raceNumber = parseInt(value);
    setRace(raceNumber);
    if (onRaceChange) onRaceChange(raceNumber);
  };

  const navigateToPreviousRace = () => {
    if (race > 1) {
      const newRace = race - 1;
      setRace(newRace);
      if (onRaceChange) onRaceChange(newRace);
    }
  };

  const navigateToNextRace = () => {
    if (race < 12) {
      const newRace = race + 1;
      setRace(newRace);
      if (onRaceChange) onRaceChange(newRace);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-4 rounded-xl shadow-lg mb-4 border-2 border-betting-tertiaryPurple/50 backdrop-blur-sm hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center space-x-3 relative z-10">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-white/80" />
          <Select value={track} onValueChange={handleTrackChange}>
            <SelectTrigger className="w-[200px] bg-gradient-to-r from-betting-darkPurple/80 to-betting-darkPurple/60 text-white border border-betting-tertiaryPurple/50 backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300">
              <SelectValue placeholder="Select Track" />
            </SelectTrigger>
            <SelectContent className="bg-gradient-to-br from-betting-darkPurple/95 to-betting-darkPurple/90 text-white border-2 border-betting-tertiaryPurple/50 backdrop-blur-lg">
              {TRACK_OPTIONS.map((trackOption) => (
                <SelectItem key={trackOption.value} value={trackOption.value} className="hover:bg-purple-500/20">
                  {trackOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center border-l border-white/20 pl-3">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateToPreviousRace}
            disabled={race <= 1}
            className="bg-gradient-to-r from-betting-darkPurple/80 to-betting-darkPurple/60 text-white border border-betting-tertiaryPurple/50 backdrop-blur-sm hover:border-purple-400/70 disabled:opacity-50 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="mx-2">
            <Select value={race.toString()} onValueChange={handleRaceChange}>
              <SelectTrigger className="w-[120px] bg-gradient-to-r from-betting-darkPurple/80 to-betting-darkPurple/60 text-white border border-betting-tertiaryPurple/50 backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300">
                <SelectValue placeholder="Race" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-br from-betting-darkPurple/95 to-betting-darkPurple/90 text-white border-2 border-betting-tertiaryPurple/50 backdrop-blur-lg">
                {races.map((raceNumber) => (
                  <SelectItem key={raceNumber} value={raceNumber.toString()} className="hover:bg-purple-500/20">
                    RACE {raceNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={navigateToNextRace}
            disabled={race >= 12}
            className="bg-gradient-to-r from-betting-darkPurple/80 to-betting-darkPurple/60 text-white border border-betting-tertiaryPurple/50 backdrop-blur-sm hover:border-purple-400/70 disabled:opacity-50 transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="ml-3 rounded-xl bg-gradient-to-r from-betting-darkPurple/80 to-betting-darkPurple/60 text-white px-4 py-2 font-bold border border-betting-tertiaryPurple/50 backdrop-blur-sm shadow-lg flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{mtp} MTP</span>
        </div>
      </div>

      <div className="text-white flex items-center space-x-3 relative z-10">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg px-4 py-2 border border-white/10 backdrop-blur-sm">
          <span className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">ALLOWANCE</span>
          <span className="ml-2 text-gray-300">Purse: {allowanceInfo.purse} | {allowanceInfo.age} | {allowanceInfo.distance} | Dirt: {allowanceInfo.surface}</span>
        </div>
        <Button 
          onClick={() => navigate('/model-process')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold shadow-lg hover:shadow-orange-500/20 transition-all duration-300 border border-orange-400/50"
        >
          MORE
        </Button>
      </div>
    </div>
  );
};

export default RaceNavBar;
