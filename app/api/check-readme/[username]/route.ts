import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'standard';

    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");

    const userDocument = await readmesCollection.findOne({ username: username.toLowerCase() });
    const existingReadme = await readmesCollection.findOne({ username: username.toLowerCase(), mode });

    if (existingReadme) {
      const isDefault = userDocument?.defaultMode === mode;
      return NextResponse.json({ 
        exists: true, 
        readme: existingReadme.content, 
        mode: existingReadme.mode,
        isDefault
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error in GET function:', error);
    return NextResponse.json({ error: 'An error occurred while checking for README' }, { status: 500 });
  }
}