import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import AdmZip from 'adm-zip';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;

    if (!file || !title || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' }, { status: 400 });
    }

    // Check if slug already exists in DB
    const existing = await prisma.invitation.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'URL slug already exists. Please choose a different one.' }, { status: 400 });
    }

    // Check env vars
    const bucketName = process.env.S3_BUCKET_NAME;
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    
    if (!bucketName || !cdnUrl) {
      return NextResponse.json({ error: 'Storage configuration is missing. Please setup S3_BUCKET_NAME and NEXT_PUBLIC_CDN_URL.' }, { status: 500 });
    }

    // Read the zip file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Unzip the file in memory
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Ensure index.html exists at the root
    const hasIndexHtml = zipEntries.some(entry => entry.entryName === 'index.html' && !entry.isDirectory);
    if (!hasIndexHtml) {
      return NextResponse.json({ error: 'The uploaded zip must contain an index.html file at the root level.' }, { status: 400 });
    }

    // Upload files to S3/Bunny.net
    console.log(`Starting upload to S3 for slug: ${slug}`);
    
    const uploadPromises = zipEntries.map(async (entry) => {
      if (entry.isDirectory) return null;
      
      const fileData = entry.getData();
      const s3Key = `invitations/${slug}/${entry.entryName}`;
      const contentType = mime.lookup(entry.entryName) || 'application/octet-stream';
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileData,
        ContentType: contentType,
        // ACL is generally not used for Bunny.net as it's public by pull zone, but S3 standard can include it
      });

      return s3Client.send(command);
    });

    await Promise.all(uploadPromises.filter(Boolean));
    
    console.log(`Upload completed for slug: ${slug}`);

    const bucketUrl = `${cdnUrl.replace(/\/$/, '')}/invitations/${slug}`;

    // Create database record
    const invitation = await prisma.invitation.create({
      data: {
        title,
        slug,
        status: 'PUBLISHED',
        bucketUrl,
      },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process upload' }, { status: 500 });
  }
}
