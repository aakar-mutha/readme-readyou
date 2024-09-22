import { NextResponse } from 'next/server';

async function fetchRepoDetails(username: string, repoName: string) {
  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
    const repoData = await repoResponse.json();

    return {
      name: repoData.name,
      html_url: repoData.html_url,
      description: repoData.description || 'No description available'
    };
  } catch (error) {
    console.error(`Error fetching repo details for ${repoName}:`, error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`)
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('Failed to fetch GitHub data');
    }

    const user: GithubUser = await userResponse.json();
    const repos: Repository[] = await reposResponse.json();

    const repoDetails = await Promise.all(
      repos
        .filter((repo: Repository) => repo.name !== username)
        .map((repo: Repository) => fetchRepoDetails(username, repo.name))
    );

    const validRepoDetails = repoDetails.filter(repo => repo !== null);

    return NextResponse.json({ user, repos: validRepoDetails });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}

interface GithubUser {
  login: string;
  name: string;
  // ... other fields
}

interface Repository {
  name: string;
  html_url: string;
  description: string | null;
  // ... other fields
}