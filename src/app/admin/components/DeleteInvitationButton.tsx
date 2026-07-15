"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteInvitation } from "../actions";

export default function DeleteInvitationButton({ id, title }: { id: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteInvitation(id);
    if (!res.success) {
      alert(res.error);
      setDeleting(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title="Hapus Undangan"
        className="text-neutral-500 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !deleting && setIsOpen(false)}
          ></div>
          
          {/* Dialog */}
          <div className="relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-neutral-800 bg-neutral-950 p-6 shadow-lg sm:rounded-lg md:w-full animate-in fade-in-90 zoom-in-95 duration-200">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-neutral-50">
                Are you absolutely sure?
              </h2>
              <p className="text-sm text-neutral-400">
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen undangan 
                <strong className="text-white font-medium ml-1">"{title}"</strong> dari server kami.
              </p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={deleting}
                className="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-neutral-800 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors sm:mt-0 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center space-x-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
