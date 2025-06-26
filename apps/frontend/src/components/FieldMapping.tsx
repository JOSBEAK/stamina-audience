import React, { useState } from 'react';
import { Contact } from '@stamina-project/types';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FieldMappingProps {
  onClose: () => void;
  onConfirm: (mappedData: Partial<Contact>[]) => void;
  csvData: any[];
  csvHeaders: string[];
}

const APP_FIELDS = [
  'name',
  'email',
  'role',
  'company',
  'industry',
  'location',
  'avatar',
];

const FieldMapping: React.FC<FieldMappingProps> = ({
  onClose,
  onConfirm,
  csvData,
  csvHeaders,
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [ignoreEmpty, setIgnoreEmpty] = useState(true);

  const handleMappingChange = (csvHeader: string, appField: string) => {
    setMapping((prev) => ({ ...prev, [csvHeader]: appField }));
  };

  const handleConfirm = () => {
    let processedData = csvData.map((row) => {
      const newRow: Partial<Contact> = {};
      for (const csvHeader in mapping) {
        const appField = mapping[csvHeader] as keyof Contact;
        if (row[csvHeader]) {
          newRow[appField] = row[csvHeader];
        }
      }
      return newRow;
    });

    if (ignoreEmpty) {
      processedData = processedData.filter(
        (row) =>
          Object.keys(row).length > 0 &&
          APP_FIELDS.some((field) => row[field as keyof Contact])
      );
    }
    onConfirm(processedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Match Fields</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        <div className="space-y-4">
          {csvHeaders.map((header) => (
            <div key={header} className="flex items-center justify-between">
              <Select value={header} disabled>
                <SelectTrigger>
                  <SelectValue>{header}</SelectValue>
                </SelectTrigger>
              </Select>
              <ArrowRight />
              <Select
                onValueChange={(value) => handleMappingChange(header, value)}
                value={mapping[header] || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {APP_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mapping[header] && <Check className="text-green-500" />}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="flex items-center">
            <Checkbox
              checked={ignoreEmpty}
              onCheckedChange={(checked) => setIgnoreEmpty(Boolean(checked))}
              className="mr-2"
            />
            Ignore empty fields
          </label>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default FieldMapping; 