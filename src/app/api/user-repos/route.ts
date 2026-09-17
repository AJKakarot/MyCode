import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let username = searchParams.get('username');

    let oauthToken: string | undefined;

    // Check Clerk authenticated session
    try {
      const user = await currentUser();
      if (user) {
        const ghAccount = user.externalAccounts?.find(
          (acc) =>
            acc.provider === 'github' ||
            acc.provider === 'oauth_github' ||
            acc.verification?.strategy === 'oauth_github'
        );

        if (!username && ghAccount?.username) {
          username = ghAccount.username;
        }
        if (!username && user.username) {
          username = user.username;
        }

        try {
          const client = await clerkClient();
          const tokens = await client.users.getUserOauthAccessToken(user.id, 'oauth_github');
          if (tokens && tokens.data && tokens.data.length > 0) {
            oauthToken = tokens.data[0].token;
          }
        } catch {
          // Fallback gracefully without OAuth token
        }
      }
    } catch {
      // Ignore auth error if guest
    }

    if (!username && !oauthToken) {
      return NextResponse.json({ repos: [] });
    }

    // If OAuth token exists, fetch user's repos (including private), otherwise public repos
    const apiUrl = oauthToken
      ? `https://api.github.com/user/repos?sort=updated&per_page=100`
      : `https://api.github.com/users/${encodeURIComponent(username || '')}/repos?sort=updated&per_page=100`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitCode-Repo-Explorer',
    };

    if (oauthToken) {
      headers['Authorization'] = `Bearer ${oauthToken}`;
    }

    const res = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ repos: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ repos: [] });
    }

    const repos = data.map(
      (item: {
        name: string;
        full_name: string;
        description: string | null;
        stargazers_count: number;
        private: boolean;
      }) => ({
        name: item.name,
        fullName: item.full_name,
        description: item.description,
        stars: item.stargazers_count,
        isPrivate: item.private,
      })
    );

    return NextResponse.json({ repos, username });
  } catch (error) {
    console.error('API /api/user-repos GET error:', error);
    return NextResponse.json({ repos: [] });
  }
}
