"use client";

import { useState, useEffect, useCallback } from "react";

type FileTree = {
  home: string | null;
  work: string[];
  writings: string[];
};

type ActiveFile = {
  path: string;
  content: string;
  isNew: boolean;
};

export function AdminDashboard({ initialPath }: { initialPath?: string }) {
  const [fileTree, setFileTree] = useState<FileTree>({ home: null, work: [], writings: [] });
  const [active, setActive] = useState<ActiveFile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");

  // Load file tree via GitHub API listing
  useEffect(() => {
    async function loadTree() {
      const [workRes, writingsRes] = await Promise.all([
        fetch("/api/admin/files?path=content/work"),
        fetch("/api/admin/files?path=content/writings"),
      ]);
      const workData = workRes.ok ? await workRes.json() : { items: [] };
      const writingsData = writingsRes.ok ? await writingsRes.json() : { items: [] };
      setFileTree({
        home: "content/home.md",
        work: (workData.items ?? []).map((f: { name: string }) => `content/work/${f.name}`),
        writings: (writingsData.items ?? []).map((f: { name: string }) => `content/writings/${f.name}`),
      });
    }
    loadTree();
  }, []);

  const loadFile = useCallback(async (path: string) => {
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      setActive({ path, content: data.content, isNew: false });
      setStatus("");
    }
  }, []);

  useEffect(() => {
    if (initialPath) loadFile(initialPath);
  }, [initialPath, loadFile]);

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/admin/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: active.path, content: active.content }),
    });
    if (res.ok) {
      setActive(prev => prev ? { ...prev, isNew: false } : null);
      setStatus("Saved ✓");
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!active || active.isNew) return;
    if (!confirm(`Delete ${active.path}?`)) return;
    setDeleting(true);
    const res = await fetch("/api/admin/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: active.path }),
    });
    if (res.ok) {
      // Remove from tree
      const name = active.path.split("/").pop()!;
      if (active.path.startsWith("content/work/")) {
        setFileTree(t => ({ ...t, work: t.work.filter(f => f !== active.path) }));
      } else if (active.path.startsWith("content/writings/")) {
        setFileTree(t => ({ ...t, writings: t.writings.filter(f => f !== active.path) }));
      }
      setActive(null);
      setStatus("Deleted ✓");
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setDeleting(false);
  }

  function handleNewFile(category: "work" | "writings") {
    const slug = prompt(`Slug for new ${category} entry (e.g. my-post):`);
    if (!slug) return;
    const path = `content/${category}/${slug}.md`;
    setActive({ path, content: `# ${slug}\n\n`, isNew: true });
    setStatus("");
  }

  function displayName(path: string) {
    return path.split("/").pop()?.replace(/\.md$/, "") ?? path;
  }

  return (
    <div className="flex gap-0 min-h-[600px] border border-gray-200 rounded">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 border-r border-gray-200 p-4 space-y-4">
        {/* home.md */}
        {fileTree.home && (
          <div>
            <button
              onClick={() => loadFile(fileTree.home!)}
              className={`text-sm w-full text-left hover:underline ${active?.path === fileTree.home ? "font-medium" : ""}`}
            >
              home.md
            </button>
          </div>
        )}

        {/* work/ */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">work/</p>
          <div className="space-y-1 pl-2">
            {fileTree.work.map(path => (
              <button
                key={path}
                onClick={() => loadFile(path)}
                className={`text-sm w-full text-left hover:underline block ${active?.path === path ? "font-medium" : ""}`}
              >
                {displayName(path)}
              </button>
            ))}
            <button
              onClick={() => handleNewFile("work")}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              + New
            </button>
          </div>
        </div>

        {/* writings/ */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">writings/</p>
          <div className="space-y-1 pl-2">
            {fileTree.writings.map(path => (
              <button
                key={path}
                onClick={() => loadFile(path)}
                className={`text-sm w-full text-left hover:underline block ${active?.path === path ? "font-medium" : ""}`}
              >
                {displayName(path)}
              </button>
            ))}
            <button
              onClick={() => handleNewFile("writings")}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              + New
            </button>
          </div>
        </div>
      </aside>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">{active.path}</span>
              <div className="flex items-center gap-3">
                {status && <span className="text-xs text-gray-600">{status}</span>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {!active.isNew && active.path !== "content/home.md" && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={active.content}
              onChange={e => setActive(prev => prev ? { ...prev, content: e.target.value } : null)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
}
