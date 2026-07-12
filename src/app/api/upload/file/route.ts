import { NextResponse } from 'next/server';
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
    const accessKey = process.env.S3_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT; // e.g., https://sg.storage.bunnycdn.com
    
    if (!bucketName || !accessKey || !endpoint) {
      return NextResponse.json({ error: 'Storage configuration is missing.' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const key = `${slug}/${fileName}`;
    const contentType = mime.lookup(fileName) || file.type || 'application/octet-stream';
    
    // Clean up endpoint (ensure no trailing slash)
    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const uploadUrl = `${baseUrl}/${bucketName}/${key}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': accessKey,
        'Content-Type': contentType,
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("BunnyCDN Upload Error:", uploadRes.status, errText);
      throw new Error(`Upload failed: ${uploadRes.statusText}`);
    }

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
