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

    const existingReadme = await readmesCollection.findOne({ username });

    if (!existingReadme) {
      return new NextResponse(`README not found. Please generate a README first at ${process.env.NEXT_PUBLIC_BASE_URL}`, { status: 404 });
    }

    const markdown = existingReadme.content;

    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(markdown);
    let renderedHtml = processedContent.toString();
    
    // Replace <hr> tags with custom SVG lines
    renderedHtml = renderedHtml.replace(/<hr\s*\/?>/g, '<svg width="100%" height="1"><line x1="0" y1="0" x2="100%" y2="0" stroke="#ffffff" /></svg>');

    // Escape special characters to prevent XML parsing errors
    const escapedHtml = renderedHtml


    // Estimate the height based on content length (adjust multiplier as needed)
    const estimatedHeight = Math.max(630, escapedHtml.length / 2);

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${estimatedHeight}">
        <style>
          .container { font: 14px Arial, sans-serif; line-height: 1.5; }
          h1 { font-size: 24px; color: #ffffff; margin-bottom: 10px; }
          h2 { font-size: 20px; color: #ffffff; margin-top: 15px; margin-bottom: 8px; }
          h3, h4, h5, h6 { color: #ffffff; }
          p { margin: 0 0 10px; }
          code { background: #2a2a2a; border-radius: 3px; padding: 2px 5px; }
          pre { background: #2a2a2a; border-radius: 3px; padding: 10px; overflow-x: auto; }
          ul { margin: 0 0 10px; padding-left: 20px; }
          li { margin-bottom: 5px; }
          a { color: #58a6ff; text-decoration: none; }
          img { max-width: 100%; height: auto; }
        </style>
        <rect width="100%" height="100%" fill="#000000"/>
        <foreignObject width="1180" height="${estimatedHeight - 20}" x="10" y="10">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <div class="container" style="color: #ffffff;">
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