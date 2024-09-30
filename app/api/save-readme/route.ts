import { NextResponse } from 'next/server';
import  clientPromise  from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { username, readme } = await request.json();

    if (!username || !readme) {
      return NextResponse.json({ error: 'Username and README are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('github_readmes');
    const result = await db.collection('readmes').updateOne(
      { username: username.toLowerCase() },
      { $set: { content:readme, updatedAt: new Date() } },
      { upsert: true }
    );

    if (result.acknowledged) {
      return NextResponse.json({ message: 'README saved successfully' }, { status: 200 });
    } else {
      throw new Error('Failed to save README');     
    }
  } catch (error) {
    console.error('Error saving README:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}