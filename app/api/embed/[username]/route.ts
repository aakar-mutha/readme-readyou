import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");

    // First, find the user document to check for the default mode
    const userDocument = await readmesCollection.findOne({ username: username.toLowerCase() });

    if (!userDocument) {
      return new NextResponse(`README not found. Please generate a README first at ${process.env.NEXT_PUBLIC_BASE_URL}`, { status: 404 });
    }

    let readme;
    if (userDocument.defaultMode) {
      // If a default mode is set, fetch that README
      const defaultReadme = await readmesCollection.findOne({ 
        username: username.toLowerCase(), 
        mode: userDocument.defaultMode 
      });
      readme = defaultReadme ? defaultReadme.content : null;
    }

    // If no default README is found, fall back to the 'standard' mode
    if (!readme) {
      const standardReadme = await readmesCollection.findOne({ 
        username: username.toLowerCase(), 
        mode: 'standard' 
      });
      readme = standardReadme ? standardReadme.content : null;
    }

    if (!readme) {
      return new NextResponse(`No README found for the user. Please generate a README first at ${process.env.NEXT_PUBLIC_BASE_URL}`, { status: 404 });
    }

    // The rest of the SVG generation code remains the same
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(readme);
    let renderedHtml = processedContent.toString();
    
    // Replace <hr> tags with custom SVG lines
    renderedHtml = renderedHtml.replace(/<hr\s*\/?>/g, '<svg width="100%" height="1"><line x1="0" y1="0" x2="100%" y2="0" stroke="#ffffff" /></svg>');

    // Escape special characters to prevent XML parsing errors
    const escapedHtml = renderedHtml.replace(/&/g, '&amp;')
    // Significantly increase the estimated height
    // const estimatedHeight = Math.max(2000, escapedHtml.length);

    // Set a fixed height for the SVG
    const fixedHeight = 900;

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${fixedHeight}" id="readme-svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#161b22;stop-opacity:1" />
          </linearGradient>
        </defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Fira+Code&amp;display=swap');
          .container { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #c9d1d9; overflow-y: auto; max-height: ${fixedHeight - 60}px; }
          .container::-webkit-scrollbar { width: 10px; }
          .container::-webkit-scrollbar-track { background: #1c2128; }
          .container::-webkit-scrollbar-thumb { background: #30363d; border-radius: 5px; }
          .container::-webkit-scrollbar-thumb:hover { background: #3f4954; }
          h1, h2, h3, h4, h5, h6 { font-weight: 600; color: #58a6ff; margin-top: 24px; margin-bottom: 16px; letter-spacing: -0.5px; }
          h1 { font-size: 32px; border-bottom: 1px solid #30363d; padding-bottom: 10px; }
          h2 { font-size: 24px; }
          h3 { font-size: 20px; }
          h4 { font-size: 18px; }
          h5, h6 { font-size: 16px; }
          p { margin: 0 0 16px; font-size: 16px; }
          code { background: #2a2a2a; border-radius: 4px; padding: 2px 5px; font-family: 'Fira Code', monospace; font-size: 14px; }
          pre { background: #2a2a2a; border-radius: 6px; padding: 16px; overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); white-space: pre-wrap; word-wrap: break-word; }
          pre code { background: none; padding: 0; font-size: 14px; }
          ul, ol { margin: 0 0 16px; padding-left: 24px; }
          li { margin-bottom: 8px; }
          a { color: #58a6ff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          hr { border: none; border-top: 1px solid #30363d; margin: 24px 0; }
          blockquote { border-left: 4px solid #30363d; margin: 0 0 16px; padding: 0 16px; color: #8b949e; }
          table { border-collapse: collapse; margin-bottom: 16px; width: 100%; }
          th, td { border: 1px solid #30363d; padding: 8px 12px; }
          th { background-color: #161b22; font-weight: 600; }
          .container > *:first-child { margin-top: 0; }
          .container > *:last-child { margin-bottom: 0; }
        </style>
        <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
        <foreignObject width="1140" height="${fixedHeight}" x="30" y="30">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <div id="content-container" class="container" style="background: rgba(13,17,23,0.8); padding: 30px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
              ${escapedHtml}
            </div>
          </div>
        </foreignObject>
      </svg>
    `;

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating SVG:', error);
    return new NextResponse('Failed to generate SVG', { status: 500 });
  }
}