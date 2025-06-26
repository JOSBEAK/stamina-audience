import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// A utility for uploading files to Cloudflare R2.
// This might be used to get a pre-signed URL from the backend
// or to upload directly if the client has credentials.

interface UploadToR2Params {
  file: File;
  presignedUrl?: string; // Optional: for uploading using a pre-signed URL
}

/**
 * Uploads a file to Cloudflare R2.
 * If a presignedUrl is provided, it uses that for a direct PUT request.
 * Otherwise, it would need AWS credentials configured in the S3 client.
 * For frontend uploads, using pre-signed URLs is the recommended secure approach.
 */
export async function uploadToR2({
  file,
  presignedUrl,
}: UploadToR2Params): Promise<string> {
  if (presignedUrl) {
    // Upload using the pre-signed URL
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to R2 via pre-signed URL.');
    }

    // The public URL is typically the pre-signed URL without the query string
    return presignedUrl.split('?')[0];
  }

  // Fallback to upload using SDK client (requires credentials, not ideal for frontend)
  // This is here for completeness but should be used with caution on the client-side.
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.NX_R2_ENDPOINT, // Ensure you have these in your .env
    credentials: {
      accessKeyId: process.env.NX_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NX_R2_SECRET_ACCESS_KEY!,
    },
  });

  const uploadParams = {
    Bucket: process.env.NX_R2_BUCKET!,
    Key: `${Date.now()}-${file.name}`,
    Body: file,
    ContentType: file.type,
  };

  await r2Client.send(new PutObjectCommand(uploadParams));

  const publicUrl = `${process.env.NX_R2_PUBLIC_URL}/${uploadParams.Key}`;
  return publicUrl;
}
