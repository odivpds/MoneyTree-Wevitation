"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";

export default function CreateInvitation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus("Reading ZIP file...");

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const file = formData.get('file') as File;

    if (!file || !title || !slug) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Invalid slug format. Use only lowercase letters, numbers, and hyphens.");
      setLoading(false);
      return;
    }

    try {
      // 1. Unzip the file in the browser
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      
      const filesToUpload: { name: string; type: string; content: Blob }[] = [];
      let hasIndexHtml = false;

      setUploadStatus("Extracting files...");
      
      const zipEntries = Object.values(loadedZip.files);
      for (const zipEntry of zipEntries) {
        if (zipEntry.dir) continue;
        
        if (zipEntry.name === "index.html") hasIndexHtml = true;

        const content = await zipEntry.async("blob");
        filesToUpload.push({
          name: zipEntry.name,
          type: content.type || "application/octet-stream",
          content
        });
      }

      if (!hasIndexHtml) {
        throw new Error("The uploaded zip must contain an index.html file at the root level.");
      }

      // 2. Request Presigned URLs
      setUploadStatus("Preparing upload...");
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          files: filesToUpload.map(f => ({ name: f.name, type: f.type }))
        })
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.error || "Failed to get upload URLs. (Check if slug already exists)");

      const presignedUrls = presignData.presignedUrls;

      // 3. Upload files to S3 (Bunny.net) directly
      let uploadedCount = 0;
      const totalFiles = filesToUpload.length;

      // Upload in batches of 5 to avoid overwhelming the browser/network
      const batchSize = 5;
      for (let i = 0; i < totalFiles; i += batchSize) {
        const batch = filesToUpload.slice(i, i + batchSize);
        await Promise.all(batch.map(async (fileObj) => {
          const presignedInfo = presignedUrls.find((p: any) => p.name === fileObj.name);
          if (presignedInfo) {
            const uploadRes = await fetch(presignedInfo.url, {
              method: "PUT",
              headers: { "Content-Type": presignedInfo.contentType },
              body: fileObj.content
            });
            if (!uploadRes.ok) {
              throw new Error(`Failed to upload ${fileObj.name}`);
            }
          }
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          setUploadStatus(`Uploading files... (${uploadedCount}/${totalFiles})`);
        }));
      }

      // 4. Save to Database
      setUploadStatus("Saving to database...");
      const dbRes = await fetch("/api/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug })
      });

      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error || "Failed to save invitation");

      setUploadStatus("Done!");
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
                {domain ? `${domain}/` : '.../'}
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
                <p className="text-xs leading-5 text-neutral-500">No file size limit (Client-Side Uploading)</p>
                <p className="text-xs text-neutral-500 mt-1">Must contain index.html at root level</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{uploadStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-neutral-950 px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
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
