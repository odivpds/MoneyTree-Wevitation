import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, Plus } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="font-bold text-neutral-950 text-xl">M</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">MoneyTree</h1>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium transition-colors">
              <LayoutDashboard size={20} />
              <span>Invitations</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors">
              <Users size={20} />
              <span>Clients</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <Link href="/admin/signout" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full mt-auto">
          <LogOut size={20} />
          <span>Sign Out</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="p-10 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
