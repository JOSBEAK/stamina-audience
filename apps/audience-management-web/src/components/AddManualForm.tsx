import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Contact, Industry } from '@stamina-project/types';
import { X } from 'lucide-react';
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
import { ImageUpload } from './ImageUpload';

interface AddManualFormProps {
  onClose: () => void;
  onContactSubmit: (contact: Partial<Contact>) => void;
  initialData?: Contact | null;
}

type FormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

export function AddManualForm({
  onClose,
  onContactSubmit,
  initialData,
}: AddManualFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    onContactSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{initialData ? 'Edit Contact' : 'Add Manually'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
             <div className="space-y-1">
            <Label>Avatar *</Label>
            <ImageUpload
              initialImageUrl={initialData?.avatar}
              onUploadSuccess={(url) => setValue('avatar', url)}
              {...register('avatar', { required: true })}
            />
            {errors.avatar && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name', { required: true })} />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" {...register('email', { required: true })} />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Role *</Label>
            <Input id="role" {...register('role', { required: true })} />
            {errors.role && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Company *</Label>
            <Input id="company" {...register('company', { required: true })} />
            {errors.company && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Industry *</Label>
            <Select onValueChange={(value) => setValue('industry', value as Industry) } {...register('industry', { required: true })}>
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
            {errors.industry && (
              <p className="text-destructive text-xs mt-1">This field is required.</p>
            )}
          </div>
          <LocationInput control={control} error={errors.location} />
         
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Save Changes' : 'Add Person'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}