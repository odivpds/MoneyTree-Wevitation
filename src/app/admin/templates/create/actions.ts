"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTemplate(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const cssContent = formData.get("cssContent") as string;
  const jsContent = formData.get("jsContent") as string;

  if (!name || !slug || !type) {
    throw new Error("Data wajib tidak boleh kosong.");
  }

  // Cek duplicate slug
  const existing = await prisma.template.findUnique({
    where: { slug }
  });

  if (existing) {
    throw new Error("Slug sudah digunakan.");
  }

  await prisma.template.create({
    data: {
      name,
      slug,
      type,
      category: category || "tradisional",
      price: price || "Gratis",
      htmlContent: (type === 'html' || type === 'html-js') ? htmlContent : null,
      cssContent: (type === 'html' || type === 'html-js') ? cssContent : null,
      jsContent: type === 'html-js' ? jsContent : null,
    }
  });

  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}
