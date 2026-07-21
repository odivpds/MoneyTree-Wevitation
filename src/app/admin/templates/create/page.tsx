"use client";

import { useState } from "react";
import Link from "next/link";
import { createTemplate } from "./actions";

export default function CreateTemplatePage() {
  const [type, setType] = useState('html');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tambah Template Baru</h1>
        <Link href="/admin/templates" className="text-slate-500 hover:underline">
          Batal
        </Link>
      </div>

      <form action={createTemplate} className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Template</label>
            <input type="text" name="name" required className="w-full border rounded-lg p-2 text-black" placeholder="Contoh: Agung" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (ID Unik)</label>
            <input type="text" name="slug" required className="w-full border rounded-lg p-2 text-black" placeholder="contoh: agung-v2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Template</label>
            <select name="type" className="w-full border rounded-lg p-2 text-black" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="html">Vanilla HTML (Platform-Driven)</option>
              <option value="html-js">Advanced HTML + JS (Iframe)</option>
              <option value="react">React Component (Internal)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select name="category" className="w-full border rounded-lg p-2 text-black">
              <option value="tradisional">Tradisional</option>
              <option value="modern">Modern</option>
              <option value="minimalis">Minimalis</option>
              <option value="romantis">Romantis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Harga / Paket</label>
            <input type="text" name="price" className="w-full border rounded-lg p-2 text-black" placeholder="Rp 350.000 atau Gratis" />
          </div>
        </div>

        {(type === 'html' || type === 'html-js') && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HTML Content</label>
              <p className="text-xs text-slate-500 mb-2">Gunakan tag kurung kurawal ganda, cth: {'{{groomName}}'}</p>
              <textarea name="htmlContent" rows={8} className="w-full border rounded-lg p-2 font-mono text-sm text-black" placeholder="<div class='undangan'>...</div>"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CSS Content</label>
              <textarea name="cssContent" rows={6} className="w-full border rounded-lg p-2 font-mono text-sm text-black" placeholder=".undangan { color: red; }"></textarea>
            </div>
          </>
        )}

        {type === 'html-js' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">JavaScript Content (Opsional)</label>
            <p className="text-xs text-slate-500 mb-2">Skrip ini akan berjalan di dalam Sandbox Iframe terpisah.</p>
            <textarea name="jsContent" rows={6} className="w-full border rounded-lg p-2 font-mono text-sm text-black" placeholder="console.log('Template loaded');"></textarea>
          </div>
        )}

        <div className="pt-4 border-t">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Simpan Template
          </button>
        </div>
      </form>
    </div>
  );
}
