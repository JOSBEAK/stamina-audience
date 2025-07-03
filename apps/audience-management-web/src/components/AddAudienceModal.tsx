import React from 'react';
import { X, UploadCloud, UserPlus } from 'lucide-react';
import { Button } from './ui/button';

interface AddAudienceModalProps {
  onClose: () => void;
  onAddManually: () => void;
  onUploadCsv: () => void;
}

const AddAudienceModal: React.FC<AddAudienceModalProps> = ({
  onClose,
  onAddManually,
  onUploadCsv,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Audience</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div
            className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50"
            onClick={onUploadCsv}
          >
            <UploadCloud size={40} className="mb-2" />
            <h3 className="font-semibold">Upload .CSV</h3>
            <p className="text-sm text-gray-500">
              Bulk upload your audience onto stamina by uploading a .csv file
            </p>
          </div>
          <div
            className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50"
            onClick={onAddManually}
          >
            <UserPlus size={40} className="mb-2" />
            <h3 className="font-semibold">Add Manually</h3>
            <p className="text-sm text-gray-500">
              Manually enter your audience details to add it to the list
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddManually} // Defaulting Next to Add Manually for simplicity
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAudienceModal; 