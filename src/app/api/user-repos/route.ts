import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ repos: [] });
    }

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitCode-Repo-Explorer',
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ repos: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ repos: [] });
    }

    const repos = data.map((item: { name: string; full_name: string; description: string | null; stargazers_count: number; private: boolean }) => ({
      name: item.name,
      fullName: item.full_name,
      description: item.description,
      stars: item.stargazers_count,
      isPrivate: item.private,
    }));

    return NextResponse.json({ repos });
  } catch (error) {
    console.error('API /api/user-repos GET error:', error);
    return NextResponse.json({ repos: [] });
  }
}
