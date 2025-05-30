
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import { formatOTBUrl } from '@/components/dashboard/utils/scraper-utils';

interface TrackRaceInputSectionProps {
  trackName?: string;
  raceTrack: string;
  setRaceTrack: (track: string) => void;
  raceNumber: string;
  setRaceNumber: (number: string) => void;
  setUrl: (url: string) => void;
}

const TrackRaceInputSection: React.FC<TrackRaceInputSectionProps> = ({
  trackName,
  raceTrack,
  setRaceTrack,
  raceNumber,
  setRaceNumber,
  setUrl
}) => {
  const handleTrackChange = (value: string) => {
    setRaceTrack(value);
    
    // When track changes, update URL suggestion
    if (value && raceNumber) {
      setUrl(formatOTBUrl(value, parseInt(raceNumber)));
    }
  };

  const handleRaceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRaceNumber(value);
    
    // When race number changes, update URL suggestion
    if (raceTrack && value) {
      setUrl(formatOTBUrl(raceTrack, parseInt(value)));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Track Name
        </label>
        {trackName ? (
          <Input 
            value={trackName} 
            disabled 
            className="bg-betting-dark border-betting-tertiaryPurple text-white"
          />
        ) : (
          <Select value={raceTrack} onValueChange={handleTrackChange}>
            <SelectTrigger className="bg-betting-dark border-betting-tertiaryPurple text-white">
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent className="bg-betting-darkPurple border-betting-tertiaryPurple text-white">
              {TRACK_OPTIONS.map(track => (
                <SelectItem key={track.value} value={track.value}>
                  {track.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Race Number
        </label>
        <Input
          type="number"
          placeholder="Race number"
          value={raceNumber}
          onChange={handleRaceNumberChange}
          min="1"
          className="bg-betting-dark border-betting-tertiaryPurple text-white"
        />
      </div>
    </div>
  );
};

export default TrackRaceInputSection;
