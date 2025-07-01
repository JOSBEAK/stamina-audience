import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import { getPresignedUrl } from '@stamina-project/api-client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

interface ImageUploadProps {
  initialImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function ImageUpload({
  initialImageUrl,
  onUploadSuccess,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { presignedUrl, publicUrl } = await getPresignedUrl(
        file.name,
        file.type
      );

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      setPreview(publicUrl);
      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: Add user-facing error message
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex relative justify-center items-center w-12 h-12 rounded-full border-2 border-dashed">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Avatar preview"
              className="object-cover w-12 h-12 rounded-full"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X size={16} />
            </Button>
          </>
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <div className="flex flex-col gap-2">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="mr-2 w-4 h-4" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </Button>
      {uploading && <Progress value={progress} className="w-full" />}
      </div>
    </div>
  );
} 