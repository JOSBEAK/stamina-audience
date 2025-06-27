import React, { useState } from 'react';
import { X, FileUp } from 'lucide-react';
import Papa from 'papaparse';
import { Button, buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

interface UploadCsvModalProps {
  onClose: () => void;
  onDataParsed: (data: any[], headers: string[]) => void;
}

const UploadCsvModal: React.FC<UploadCsvModalProps> = ({
  onClose,
  onDataParsed,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleFileParse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataParsed(results.data, results.meta.fields || []);
      },
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileParse(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileParse(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Upload .CSV</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <div className="text-center mb-4">
          <p>
            Download our sample .csv file.{' '}
            <a
              href="/sample_people_data.csv"
              download
              className={cn(buttonVariants({ variant: 'link' }), 'px-0 underline cursor-pointer')}
            >
              Download here
            </a>
          </p>
        </div>
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <FileUp size={48} className="mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">
            <label
              htmlFor="csv-upload"
              className={cn(
                buttonVariants({ variant: 'link' }),
                'cursor-pointer px-0 underline',
              )}
            >
              Click to upload
            </label>{' '}
            or drag and drop
          </p>
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-1">.csv file</p>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default UploadCsvModal; 