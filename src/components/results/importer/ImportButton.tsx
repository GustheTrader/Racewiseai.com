
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImportButtonProps {
  onClick: () => void;
  disabled: boolean;
  isImporting: boolean;
  hasPreviewData: boolean;
}

const ImportButton: React.FC<ImportButtonProps> = ({
  onClick,
  disabled,
  isImporting,
  hasPreviewData
}) => {
  if (!hasPreviewData) return null;

  return (
    <Button 
      onClick={onClick} 
      disabled={disabled}
      className="w-full bg-orange-500 hover:bg-orange-600"
    >
      {isImporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Importing...
        </>
      ) : (
        'Import Results to Database'
      )}
    </Button>
  );
};

export default ImportButton;
