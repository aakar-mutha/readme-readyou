import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  const data = await request.json();
  const username = data.username.toLowerCase(); // Convert username to lowercase

  try {
    // Fetch GitHub data
    const githubResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw new Error('Failed to fetch user data from GitHub');
    }
    const userData = await githubResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch user repositories from GitHub');
    }
    const repos = await reposResponse.json();

    // Prepare repository list
    const repoList = repos.map((repo: Repository) => `- [${repo.name}](${repo.html_url}): ${repo.description}`).join('\n');

    // Prepare the prompt for Perplexity AI
    const prompt = `Generate a funny and engaging GitHub profile README for a user with the following information:

User Data: ${JSON.stringify(userData)}
Repositories:
${repoList}

Create a README with the following sections, using proper markdown formatting (including # for headings). Feel free to change the headings to something more creative, funny, and tailored to the user's profile. Use relevant emojis throughout the README to make it more fun and visually appealing:

1. # A welcoming title that incorporates the user's name and a fun description of their coding persona. (Include an appropriate emoji)
2. ## A subtitle with 2-3 playful descriptors of the user's skills or interests. (Use an emoji for each descriptor)
3. ### A humorous greeting or introduction. (Add a waving hand emoji or something similar)
4. ## A section listing the user's repositories (use the provided repository list). (Add a relevant emoji for each repo or a general "repository" emoji)
5. ## A section for GitHub stats, presented in a fun way. (Use emojis for different stats)
6. ## A section with 4 funny, personalized "achievements" or facts about the user, based on their profile and repositories. (Add a trophy emoji or other relevant emojis)
7. ## A "Connect with me" section for social links or ways to contact the user. (Use emojis for each contact method)
8. ## A humorous call-to-action encouraging people to check out the user's projects. (Add an eye-catching emoji)
9. ### A funny sign-off or closing statement, like "See you around the code block!" (Include a farewell emoji)
10. #### A note mentioning that the README was generated by an AI, with a humorous disclaimer. (Add a robot emoji or similar)

For the "Connect with me" section, include placeholder links for common social platforms (GitHub, LinkedIn, Twitter, etc.) and encourage the user to replace these with their actual profiles.

Make sure to include a creative "See you around" type of closing before the AI generation disclaimer.

Make each section heading unique, funny, and related to coding, technology, or the user's specific interests if apparent from their profile. The overall tone should be witty, engaging, and tailored to the user's GitHub profile and repositories. Be creative with wordplay, puns, and tech humor! Remember to use emojis generously but appropriately throughout the README to enhance its visual appeal and fun factor. Ensure all headings are properly formatted with the correct number of # symbols for markdown.`;

    // Call Perplexity AI API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error('Failed to generate README from Perplexity AI');
    }

    const perplexityResult = await perplexityResponse.json();
    let generatedReadme = perplexityResult.choices[0].message.content;

    // Get the website URL from environment variable
    const websiteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-website-url.com';

    // Add the custom line at the end of the README
    generatedReadme += `\n\n---\n\nWant your own funny README? Check out [ReadMe ReadYou](${websiteUrl})!`;

    // Save the generated README to MongoDB
    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");
    await readmesCollection.insertOne({
      username, // This will now be lowercase
      content: generatedReadme,
      createdAt: new Date()
    });

    return NextResponse.json({ readme: generatedReadme });
  } catch (error: unknown) {
    console.error('Error in POST function:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

interface Repository {
  name: string;
  html_url: string;
  description: string | null;
}