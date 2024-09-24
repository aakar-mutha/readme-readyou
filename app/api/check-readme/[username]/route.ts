import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
    // First, check if the user exists on GitHub
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json({ exists: false, error: 'User not found' }, { status: 404 });
      }
      throw new Error('Failed to check user existence');
    }

    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");

    const existingReadme = await readmesCollection.findOne({ username });

    if (existingReadme) {
      existingReadme.content = existingReadme.content + '\n\n[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/aakar)';
      return NextResponse.json({ exists: true, readme: existingReadme.content });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking README:', error);
    return NextResponse.json({ error: 'Failed to check README' }, { status: 500 });
  }
}