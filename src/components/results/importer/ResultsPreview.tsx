
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ResultsPreviewProps {
  previewData: any;
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({ previewData }) => {
  if (!previewData) return null;

  return (
    <Card className="bg-betting-darkPurple border-4 border-betting-tertiaryPurple shadow-xl">
      <CardContent className="pt-4">
        <h3 className="text-lg font-medium mb-3 text-white">Preview of Scraped Results</h3>
        
        <div className="bg-betting-dark/50 p-4 rounded-md overflow-auto max-h-80 mb-4">
          <pre className="text-xs text-gray-300">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPreview;
