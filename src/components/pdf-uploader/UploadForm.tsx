
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UploadFormProps {
  isUploading: boolean;
  onFileSelected: (file: File) => void;
  onUpload: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  isUploading,
  onFileSelected,
  onUpload
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  // File size limit: 50MB
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      return;
    }

    // Validate MIME type
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="pdf-upload">Upload Race Card PDF</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="border border-betting-mediumBlue rounded-md px-4 py-2 w-full flex items-center justify-between bg-betting-dark text-white">
            <span className="truncate">
              {file ? file.name : "Select a PDF file"}
            </span>
            <FileUp className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <Button 
          onClick={onUpload} 
          disabled={!file || isUploading}
          className="whitespace-nowrap"
        >
          {isUploading ? "Uploading..." : "Process PDF"}
        </Button>
      </div>
    </div>
  );
};

export default UploadForm;
