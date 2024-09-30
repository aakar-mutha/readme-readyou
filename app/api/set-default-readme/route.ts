import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { username, mode } = await request.json();

    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");

    // Update the user's document to set the default README
    const result = await readmesCollection.updateOne(
      { username: username.toLowerCase() },
      { $set: { defaultMode: mode } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Default README set successfully' });
  } catch (error) {
    console.error('Error setting default README:', error);
    return NextResponse.json({ error: 'An error occurred while setting default README' }, { status: 500 });
  }
}