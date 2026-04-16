import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function repoBase() {
  return `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents`;
}

// GET /api/admin/files?path=content/home.md  (file → { content, sha })
// GET /api/admin/files?path=content/work     (directory → { items: [...] })
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  const res = await fetch(`${repoBase()}/${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "File not found" }, { status: res.status });
  }

  const data = await res.json();

  // Directory listing — GitHub returns an array
  if (Array.isArray(data)) {
    const items = data
      .filter((f: { type: string }) => f.type === "file")
      .map((f: { name: string; path: string }) => ({ name: f.name, path: f.path }));
    return NextResponse.json({ items });
  }

  // Single file
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return NextResponse.json({ content, sha: data.sha });
}

// PUT /api/admin/files — create or update
export async function PUT(req: Request) {
  const { path, content } = await req.json();
  if (!path || content === undefined) {
    return NextResponse.json({ error: "path and content required" }, { status: 400 });
  }

  // Fetch current SHA if file exists (required for updates)
  let sha: string | undefined;
  const existing = await fetch(`${repoBase()}/${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const body: Record<string, unknown> = {
    message: `Update ${path}`,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${repoBase()}/${path}`, {
    method: "PUT",
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/files
export async function DELETE(req: Request) {
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  // Fetch SHA (required for deletion)
  const existing = await fetch(`${repoBase()}/${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!existing.ok) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  const data = await existing.json();

  const res = await fetch(`${repoBase()}/${path}`, {
    method: "DELETE",
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `Delete ${path}`,
      sha: data.sha,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
