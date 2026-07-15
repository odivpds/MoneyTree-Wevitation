"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInvitation } from "../actions";

export default function DeleteInvitationButton({ id, title }: { id: string, title: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus undangan "${title}"?`)) {
      setDeleting(true);
      const res = await deleteInvitation(id);
      if (!res.success) {
        alert(res.error);
        setDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleting}
      title="Hapus Undangan"
      className="text-neutral-500 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}
