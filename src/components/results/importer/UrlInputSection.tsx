
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkIcon } from 'lucide-react';
import { formatOTBUrl } from '@/components/dashboard/utils/scraper-utils';

interface UrlInputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  raceTrack: string;
  raceNumber: string;
}

const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url,
  setUrl,
  raceTrack,
  raceNumber
}) => {
  const generateUrlSuggestion = () => {
    if (raceTrack && raceNumber) {
      return formatOTBUrl(raceTrack, parseInt(raceNumber));
    }
    return '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Results Page URL
      </label>
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://app.offtrackbetting.com/#/lobby/live-racing"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-betting-dark border-betting-tertiaryPurple text-white flex-grow"
          required
        />
        {raceTrack && raceNumber && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setUrl(generateUrlSuggestion())}
            className="shrink-0 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
            title="Generate URL for selected track/race"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Enter the URL of the race results page you want to import
      </p>
    </div>
  );
};

export default UrlInputSection;
