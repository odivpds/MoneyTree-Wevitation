"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateInvitation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Create Invitation</h2>
          <p className="text-neutral-400">Upload a custom HTML/CSS/JS bundle for your client.</p>
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-300">
              Event Title / Client Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., Pernikahan Gung Istri & Gung Praba"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-neutral-300">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="bg-neutral-900 border border-r-0 border-neutral-800 rounded-l-xl px-4 py-3 text-neutral-500 text-sm">
                domain-kita.com/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                placeholder="gung-istri-gung-praba"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-r-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              Upload Files (.zip)
            </label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-neutral-700 px-6 py-10 bg-neutral-950 hover:bg-neutral-900/80 transition-colors relative group">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-neutral-500 group-hover:text-emerald-400 transition-colors" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-neutral-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-emerald-400 hover:text-emerald-300 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file" type="file" accept=".zip" className="sr-only" required />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-neutral-500">ZIP up to 10MB</p>
                <p className="text-xs text-neutral-500 mt-1">Must contain index.html at root level</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-neutral-950 px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={18} strokeWidth={2.5} />
                  <span>Create Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
