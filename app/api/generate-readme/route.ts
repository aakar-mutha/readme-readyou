import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  const data = await request.json();
  const username = data.username.toLowerCase();
  const mode = data.mode || 'standard';

  try {
    const client = await clientPromise;
    const db = client.db("github_readmes");
    const readmesCollection = db.collection("readmes");

    const existingReadme = await readmesCollection.findOne({ username, mode });

    if (existingReadme) {
      return NextResponse.json({ readme: existingReadme.content, mode: existingReadme.mode, isCached: true });
    }

    // If README doesn't exist or a different mode is selected, generate a new one
    const githubResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw new Error('Failed to fetch user data from GitHub');
    }
    const userData = await githubResponse.json();

    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch user repositories from GitHub');
    }
    const repos = await reposResponse.json();

    const repoList = repos.map((repo: Repository) => `- [${repo.name}](${repo.html_url}): ${repo.description}`).join('\n');

    // Prepare the prompt for Perplexity AI
    let prompt = `Generate a funny and engaging GitHub profile README for a user with the following information:

User Data: ${JSON.stringify(userData)}
Repositories:
${repoList}

Regardless of the mode, always include humor and wit in the README. Make it entertaining to read.

`;

    switch (mode) {
      case 'minimal':
        prompt += `Create a minimal, yet humorous README with the following:
1. A witty welcome message with the user's name
2. A one-line description of their main skills or interests, with a touch of humor
3. A list of their top 3 repositories, each with a funny one-liner
4. A clever "Connect with me" section
Keep it concise but make sure each line has a humorous twist.`;
        break;
      case 'detailed':
        prompt += `Create a detailed and amusing README with the following sections:
1. A hilarious introduction including the user's name, role, and key skills
2. A "About Me" section that reads like a funny personal ad
3. A "Skills" section presented as a humorous recipe for a great developer
4. A "Projects" section detailing their top 5 repositories with witty descriptions
5. A "GitHub Stats" section with stats presented as bizarre achievements
6. A "Blog Posts" section with clickbait-style titles (if they have any recent posts)
7. A "Connect with Me" section that reads like a desperate plea for friendship
Use extensive markdown formatting, including tables, lists, and code blocks where appropriate, but always with a humorous twist.`;
        break;
      case 'creative':
        prompt += `Create an extremely creative and hilarious README with the following:
1. An outrageous title that incorporates the user's name in a pun or wordplay
2. An introduction that reads like a movie trailer voice-over
3. Their skills presented as superpowers with funny limitations
4. Their projects presented as items in a bizarre museum exhibition
5. GitHub stats presented as prophecies from a comically inaccurate fortune teller
6. A "Fun Facts" section with 3-5 absolutely ridiculous 'facts' about the user
7. A call-to-action for connecting that sounds like an infomercial
Go wild with creative markdown formatting, emojis, and ASCII art to make it visually unique and funny.`;
        break;
      default: // 'standard' mode
        prompt += `Create a standard but amusing README with the following sections:
1. A welcoming title that incorporates the user's name in a pun
2. A brief introduction and "About Me" section with subtle jokes
3. A "Skills" section listing their main technologies, each with a funny comment
4. A "Projects" section with their top 3-5 repositories, each with a witty description
5. A "GitHub Stats" section with stats presented in a playfully exaggerated manner
6. A "Connect with Me" section that sounds like a cheesy pick-up line
Use appropriate markdown formatting and maintain a professional tone, but sprinkle humor throughout.`;
    }

    prompt += `\n\nEnsure all sections use proper markdown formatting (including # for headings). Use relevant emojis and occasional puns or wordplay to enhance the humor. The README should be funny and engaging while still providing useful information about the user.`;

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

    // Always add the social media section, regardless of whether it exists in the AI-generated content
    const socialMediaSection = `\n\n## Connect with me\n\n`;
    const socialMediaLinks = [];

    if (userData.blog) socialMediaLinks.push(`🌐 Website: [${userData.blog}](${userData.blog})`);
    if (userData.twitter_username) socialMediaLinks.push(`🐦 Twitter: [@${userData.twitter_username}](https://twitter.com/${userData.twitter_username})`);
    if (userData.company) socialMediaLinks.push(`💼 Company: ${userData.company}`);
    if (userData.email) socialMediaLinks.push(`📧 Email: ${userData.email}`);

    if (socialMediaLinks.length > 0) {
      generatedReadme += socialMediaSection + socialMediaLinks.join('\n') + '\n\n';
    } else {
      generatedReadme += socialMediaSection + "I'm a bit shy on social media, but feel free to check out my repositories!\n\n";
    }

    // Get the website URL from environment variable
    const websiteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-website-url.com';

    // Add the custom line at the end of the README
    generatedReadme += `\n\n---\n\nWant your own funny README? Check out [ReadMe ReadYou](${websiteUrl})!`;

    // Save or update the generated README in MongoDB
    await readmesCollection.updateOne(
      { username, mode },
      { $set: { content: generatedReadme, createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ readme: generatedReadme, mode: mode, isCached: false });
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