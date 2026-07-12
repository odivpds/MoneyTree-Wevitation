import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Bypass system routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Extract slug from pathname (e.g. /gung-istri-gung-praba/style.css -> gung-istri-gung-praba)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    // It's the homepage
    return NextResponse.next();
  }

  const slug = segments[0];
  const restOfPath = segments.slice(1).join('/');

  const bucketUrl = process.env.S3_PUBLIC_URL;
  if (!bucketUrl) {
    return NextResponse.next();
  }

  // Construct destination URL
  // If it's just the slug, point to index.html
  // Otherwise, point to the specific file
  const destinationPath = restOfPath ? `${slug}/${restOfPath}` : `${slug}/index.html`;
  const destination = `${bucketUrl}/${destinationPath}${search}`;

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
