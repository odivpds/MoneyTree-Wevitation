import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuestManager from "./GuestManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function InvitationManagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const invitation = await prisma.invitation.findUnique({
    where: { id: params.id },
  });

  if (!invitation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{invitation.title}</h2>
          <p className="text-neutral-400">Manage guests and generate WhatsApp links</p>
        </div>
      </div>

      <GuestManager invitationId={invitation.id} slug={invitation.slug} initialWaTemplate={invitation.waTemplate} />
    </div>
  );
}
