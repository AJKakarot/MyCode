import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb, ensureTablesExist } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ authenticated: false, repos: [] });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ authenticated: true, dbConfigured: false, repos: [] });
    }

    await ensureTablesExist();

    const rows = await sql`
      SELECT 
        full_name as "fullName",
        owner,
        name,
        description,
        stars,
        forks,
        avatar_url as "avatarUrl",
        html_url as "htmlUrl",
        saved_at as "savedAt"
      FROM user_saved_repos
      WHERE user_id = ${userId}
      ORDER BY saved_at DESC
    `;

    return NextResponse.json({
      authenticated: true,
      dbConfigured: true,
      repos: rows,
    });
  } catch (error) {
    console.error('API /api/saved-repos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved repos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await req.json();
    const { fullName, owner, name, description, stars, forks, avatarUrl, htmlUrl } = body;

    if (!fullName || !owner || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await ensureTablesExist();

    const savedAt = Date.now();

    await sql`
      INSERT INTO user_saved_repos (
        user_id, full_name, owner, name, description, stars, forks, avatar_url, html_url, saved_at
      ) VALUES (
        ${userId}, ${fullName}, ${owner}, ${name}, ${description || null}, ${stars || 0}, ${forks || 0}, ${avatarUrl || null}, ${htmlUrl || `https://github.com/${fullName}`}, ${savedAt}
      )
      ON CONFLICT (user_id, full_name) 
      DO UPDATE SET 
        description = EXCLUDED.description,
        stars = EXCLUDED.stars,
        forks = EXCLUDED.forks,
        avatar_url = EXCLUDED.avatar_url,
        saved_at = EXCLUDED.saved_at;
    `;

    return NextResponse.json({ success: true, savedAt });
  } catch (error) {
    console.error('API /api/saved-repos POST error:', error);
    return NextResponse.json({ error: 'Failed to save repo' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const fullName = searchParams.get('fullName');

    if (!fullName) {
      return NextResponse.json({ error: 'Missing fullName parameter' }, { status: 400 });
    }

    await ensureTablesExist();

    await sql`
      DELETE FROM user_saved_repos
      WHERE user_id = ${userId} AND LOWER(full_name) = LOWER(${fullName});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/saved-repos DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete saved repo' }, { status: 500 });
  }
}
