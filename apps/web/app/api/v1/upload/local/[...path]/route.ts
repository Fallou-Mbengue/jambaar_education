/**
 * Proxy pour l'upload local (PUT) et la lecture (GET).
 * Next.js rewrites ne transmettent pas correctement le body des requêtes PUT,
 * donc on proxy explicitement ici.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const segment = path.join('/');
  const objectKey = decodeURIComponent(segment);
  const backendUrl = `${API_URL}/api/v1/upload/local/${encodeURIComponent(objectKey)}`;

  const contentType = request.headers.get('content-type') || 'application/octet-stream';
  const body = await request.arrayBuffer();

  const res = await fetch(backendUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });

  const headers = new Headers();
  res.headers.forEach((v, k) => headers.set(k, v));

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const segment = path.join('/');
  const objectKey = decodeURIComponent(segment);
  const backendUrl = `${API_URL}/api/v1/upload/local/${encodeURIComponent(objectKey)}`;

  const res = await fetch(backendUrl, {
    method: 'GET',
    headers: request.headers,
    cache: 'no-store',
  });

  const headers = new Headers();
  res.headers.forEach((v, k) => headers.set(k, v));

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
