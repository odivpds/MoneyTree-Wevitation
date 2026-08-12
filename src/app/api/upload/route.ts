import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string || 'thumbnails';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'Storage configuration is missing.' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const key = `${slug}/${name}`;
    const contentType = file.type || mime.lookup(name) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    const url = `${publicUrlBase.replace(/\/$/, '')}/${key}`;

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
