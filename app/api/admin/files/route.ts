import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync, mkdirSync, renameSync } from "fs";
import { join, dirname } from "path";

function abs(path: string) {
  return join(process.cwd(), path);
}

// GET ?path=content/home.md  → { content }
// GET ?path=content/work     → { items: [{ name, path, type }] }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  try {
    const stat = statSync(abs(path));
    if (stat.isDirectory()) {
      const items = readdirSync(abs(path)).map(name => {
        const isDir = statSync(join(abs(path), name)).isDirectory();
        return { name, path: `${path}/${name}`, type: isDir ? "directory" : "file" };
      }).filter(item => item.type === "directory" || item.name.endsWith(".md"));
      return NextResponse.json({ items });
    }
    return NextResponse.json({ content: readFileSync(abs(path), "utf-8") });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// POST { path } → creates directory
export async function POST(req: Request) {
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });
  try {
    mkdirSync(abs(path), { recursive: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT { path, content } → writes file to disk
export async function PUT(req: Request) {
  const { path, content } = await req.json();
  if (!path || content === undefined) {
    return NextResponse.json({ error: "path and content required" }, { status: 400 });
  }
  try {
    mkdirSync(dirname(abs(path)), { recursive: true });
    writeFileSync(abs(path), content, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH { path, newPath } → renames file or directory
export async function PATCH(req: Request) {
  const { path, newPath } = await req.json();
  if (!path || !newPath) return NextResponse.json({ error: "path and newPath required" }, { status: 400 });
  try {
    renameSync(abs(path), abs(newPath));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE { path } → removes file from disk
export async function DELETE(req: Request) {
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });
  try {
    unlinkSync(abs(path));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
