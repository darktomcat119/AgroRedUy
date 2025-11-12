import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    
    // For production, use Railway backend URL directly
    // Construct the full image URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
    const backendUrl = apiUrl.replace('/api/v1', ''); // Remove /api/v1 if present
    const imageUrl = `${backendUrl}/uploads/${imagePath}`;
    
    console.log('Proxying image request:', imageUrl);
    
    // Fetch the image from backend
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Vercel-Image-Proxy', 
      },
      cache: 'no-store', // Don't cache the fetch request
    });
    
    if (!response.ok) {
      console.error('Backend image request failed:', response.status, response.statusText);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
