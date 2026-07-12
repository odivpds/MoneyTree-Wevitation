"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Send, Copy, Loader2, Check, MessageSquare, Save } from "lucide-react";

export default function GuestManager({ invitationId, slug, initialWaTemplate }: { invitationId: string; slug: string, initialWaTemplate: string | null }) {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkNames, setBulkNames] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultTemplate = "Halo [Nama Tamu],\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nSilakan buka tautan undangan berikut untuk detail acara:\n[Link Undangan]\n\nKehadiran Anda adalah kehormatan bagi kami. Terima kasih!";
  const [waTemplate, setWaTemplate] = useState(initialWaTemplate || defaultTemplate);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchGuests = async () => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests`);
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [invitationId]);

  const handleBulkAdd = async () => {
    if (!bulkNames.trim()) return;
    setAdding(true);

    const names = bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names }),
      });
      
      if (res.ok) {
        setBulkNames("");
        await fetchGuests();
      }
    } catch (err) {
      console.error("Failed to add guests", err);
    } finally {
      setAdding(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waTemplate }),
      });
    } catch (err) {
      console.error("Failed to save template", err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const generateLink = (name: string) => {
    // Determine the base URL dynamically based on where we are currently hosted
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/${slug}?kepada=${encodeURIComponent(name)}`;
  };

  const handleCopy = (id: string, name: string) => {
    navigator.clipboard.writeText(generateLink(name));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWhatsAppMessage = (name: string) => {
    const link = generateLink(name);
    // Replace placeholders with actual data
    return waTemplate
      .replace(/\[Nama Tamu\]/gi, name)
      .replace(/\[Link Undangan\]/gi, link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Actions */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Bulk Add Box */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            Add Guests (Bulk)
          </h3>
          <p className="text-sm text-neutral-400 mb-4">
            Paste a list of names here (one name per line).
          </p>
          <textarea
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
            className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            placeholder={`Budi Santoso\nKeluarga Bapak Andi\nCaca & Partner`}
          />
          <button
            onClick={handleBulkAdd}
            disabled={adding || !bulkNames.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-neutral-950 px-4 py-2.5 rounded-xl font-semibold transition-all"
          >
            {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span>Add Guests</span>
          </button>
        </div>

        {/* WhatsApp Template Box */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-500" />
            WhatsApp Template
          </h3>
          <p className="text-sm text-neutral-400 mb-4">
            Use <strong className="text-emerald-400">[Nama Tamu]</strong> and <strong className="text-emerald-400">[Link Undangan]</strong> as variables.
          </p>
          <textarea
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
          />
          <button
            onClick={handleSaveTemplate}
            disabled={savingTemplate || !waTemplate.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all border border-neutral-700"
          >
            {savingTemplate ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Template</span>
          </button>
        </div>

      </div>

      {/* Right Column: Guest List */}
      <div className="lg:col-span-2">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 h-full min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4">
            Guest List ({guests.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12 border border-neutral-800 border-dashed rounded-xl bg-neutral-950/50">
              <p className="text-neutral-500">No guests added yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {guests.map((guest) => (
                <div key={guest.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors gap-4">
                  <div>
                    <h4 className="font-medium text-white">{guest.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono mt-1 break-all">
                      {generateLink(guest.name)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(guest.id, guest.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm transition-colors border border-neutral-800"
                    >
                      {copiedId === guest.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedId === guest.id ? "Copied" : "Copy"}</span>
                    </button>
                    
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppMessage(guest.name))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm transition-colors border border-[#25D366]/20"
                    >
                      <Send size={14} />
                      <span>Kirim WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
