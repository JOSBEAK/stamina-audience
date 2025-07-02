import React, { useState } from 'react';
import { X, FileUp } from 'lucide-react';
import Papa from 'papaparse';
import { Button, buttonVariants } from './ui/button';
import { cn } from '@stamina-project/frontend-utils';
import { CsvRowData } from '@stamina-project/types';

interface UploadCsvModalProps {
  onClose: () => void;
  onDataParsed: (data: CsvRowData[], headers: string[], file: File) => void;
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
        const csvData = results.data as CsvRowData[];
        onDataParsed(csvData, results.meta.fields || [], file);
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
    <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-50">
      <div className="p-8 w-full max-w-lg bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Upload .CSV</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <div className="mb-4 text-center">
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
            dragging ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
          }`}
        >
          <FileUp size={48} className="mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">
            <label
              htmlFor="csv-upload"
              className={cn(
                buttonVariants({ variant: 'link' }),
                'px-0 underline cursor-pointer',
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
          <p className="mt-1 text-xs text-gray-400">.csv file</p>
        </div>
        <div className="flex gap-4 justify-end mt-8">
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