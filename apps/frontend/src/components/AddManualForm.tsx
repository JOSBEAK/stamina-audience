import React from 'react';
import { useForm } from 'react-hook-form';
import { Contact, Industry } from '@stamina-project/types';
import { X } from 'lucide-react';
import { addContact } from '../utils/api';
import LocationInput from './LocationInput';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddManualFormProps {
  onClose: () => void;
  onContactAdd: (contact: Contact) => void;
}

type FormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

const AddManualForm: React.FC<AddManualFormProps> = ({
  onClose,
  onContactAdd,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const newContact = await addContact(data);
      onContactAdd(newContact);
      onClose();
    } catch (error) {
      console.error(error);
      // Here you could add user-facing error handling
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Manually</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name', { required: true })} />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" {...register('email', { required: true })} />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Role *</Label>
            <Input id="role" {...register('role', { required: true })} />
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Company *</Label>
            <Input id="company" {...register('company', { required: false })} />
          </div>
          <div className="space-y-1">
            <Label>Industry *</Label>
            <Select onValueChange={(value) => setValue('industry', value as Industry)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(Industry).map((industry) => (
                    <SelectItem key={industry as string} value={industry as string}>
                      {industry as string}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <LocationInput control={control} error={errors.location} />
          <div className="space-y-1">
            <Label htmlFor="avatar">Avatar URL *</Label>
            <Input id="avatar" {...register('avatar', { required: false })} />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Person</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddManualForm;