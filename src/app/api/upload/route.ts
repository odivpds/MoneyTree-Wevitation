import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import AdmZip from 'adm-zip';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';

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

    // Read the zip file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save uploaded files to public/uploads/[slug]
    const uploadDir = join(process.cwd(), 'public', 'uploads', slug);
    
    // Clear directory if it exists somehow
    if (existsSync(uploadDir)) {
      rmSync(uploadDir, { recursive: true, force: true });
    }
    await mkdir(uploadDir, { recursive: true });

    // Unzip the file
    const zip = new AdmZip(buffer);
    zip.extractAllTo(uploadDir, true);

    // Ensure index.html exists
    if (!existsSync(join(uploadDir, 'index.html'))) {
      // Clean up the directory if it's invalid
      rmSync(uploadDir, { recursive: true, force: true });
      return NextResponse.json({ error: 'The uploaded zip must contain an index.html file at the root level.' }, { status: 400 });
    }

    // Create database record
    const invitation = await prisma.invitation.create({
      data: {
        title,
        slug,
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process upload' }, { status: 500 });
  }
}
