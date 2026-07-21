import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Template</h1>
        <Link 
          href="/admin/templates/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Tambah Template
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Info Template</th>
              <th className="p-4 font-semibold text-slate-600">Tipe</th>
              <th className="p-4 font-semibold text-slate-600">Kategori</th>
              <th className="p-4 font-semibold text-slate-600">Harga</th>
              <th className="p-4 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Belum ada template yang diunggah.
                </td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl.id} className="border-b last:border-b-0 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{tpl.name}</div>
                    <div className="text-sm text-slate-500">{tpl.slug}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${tpl.type === 'react' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                      {tpl.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 capitalize">{tpl.category}</td>
                  <td className="p-4 text-slate-600">{tpl.price}</td>
                  <td className="p-4">
                    <button className="text-red-500 text-sm font-medium hover:underline">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
