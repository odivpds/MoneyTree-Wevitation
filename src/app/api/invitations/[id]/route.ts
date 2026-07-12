import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { waTemplate } = body;

    const invitation = await prisma.invitation.update({
      where: { id: params.id },
      data: { waTemplate },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Update invitation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
