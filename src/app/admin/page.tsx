import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ExternalLink, Calendar } from "lucide-react";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import DeleteInvitationButton from "./components/DeleteInvitationButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Invitations</h2>
          <p className="text-neutral-400">Manage your clients' digital wedding invitations.</p>
        </div>
        <Link
          href="/admin/invitations/create"
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Invitation</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invitations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-neutral-800 border-dashed rounded-2xl bg-neutral-900/30">
            <p className="text-neutral-400 text-lg mb-4">No invitations found.</p>
            <Link href="/admin/invitations/create" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Create your first invitation &rarr;
            </Link>
          </div>
        ) : (
          invitations.map((inv: any) => (
            <div key={inv.id} className="group relative flex flex-col border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors">
              
              {/* Live Thumbnail using Iframe */}
              <div className="relative w-full h-48 bg-neutral-950 border-b border-neutral-800 overflow-hidden">
                {/* 
                  By setting the iframe size to 4x (400%) and scaling it down to 25%, 
                  we get a nice miniature preview of the actual webpage.
                */}
                <iframe
                  src={`/${inv.slug}`}
                  className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none border-0"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                
                {/* Gradient overlay to make text/UI over it readable and look sleek */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-80 pointer-events-none"></div>
                
                {/* Status Badge floating on top right of thumbnail */}
                <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 text-xs font-medium text-neutral-300 shadow-xl">
                  <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span>{inv.status}</span>
                </div>
              </div>

              {/* Card Details Content */}
              <div className="p-6 relative flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-1 pr-4">{inv.title}</h3>
                  <div className="shrink-0 -mt-1 -mr-2">
                    <DeleteInvitationButton id={inv.id as string} title={inv.title as string} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-neutral-400 text-sm mb-6">
                  <Calendar size={14} />
                  <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800 pt-4 mt-auto">
                  <div className="text-sm text-neutral-500 font-mono truncate max-w-[200px]">
                    /{inv.slug}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/admin/invitations/${String(inv.id)}`}
                      className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                    >
                      <span>Manage</span>
                    </Link>
                    <a
                      href={`/${inv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-neutral-400 hover:text-neutral-300 text-sm font-medium transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
