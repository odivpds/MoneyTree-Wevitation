import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const slug = formData.get('slug') as string;
    const fileName = formData.get('fileName') as string;
    const file = formData.get('file') as File;

    if (!slug || !fileName || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'Storage configuration is missing.' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const key = `${slug}/${fileName}`;
    const contentType = mime.lookup(fileName) || file.type || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
