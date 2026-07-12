import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Define the correct props for Next.js 15+ compatible dynamic route
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InvitationPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const invitation = await prisma.invitation.findUnique({
    where: { slug: params.slug },
  });

  if (!invitation) {
    notFound();
  }

  // Convert searchParams back to a query string to pass to the iframe
  const query = new URLSearchParams(searchParams as Record<string, string>).toString();
  
  // Use bucketUrl from CDN if available, else fallback to old local storage
  const baseUrl = invitation.bucketUrl ? `${invitation.bucketUrl}/index.html` : `/uploads/${params.slug}/index.html`;
  const iframeUrl = `${baseUrl}${query ? `?${query}` : ''}`;

  return (
    <div className="w-full h-screen overflow-hidden bg-black m-0 p-0">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-none"
        title={`Invitation for ${invitation.title}`}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
