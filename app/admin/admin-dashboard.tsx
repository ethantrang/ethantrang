"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ResizableDivider } from "@/components/resizable-divider";
import * as Dialog from "@radix-ui/react-dialog";

type Section = { name: string; files: string[] };
type FileTree = { rootFiles: string[]; sections: Section[] };
type ActiveFile = { path: string; content: string; isNew: boolean };
type Popover =
  | { type: "delete"; path: string }
  | { type: "new-file"; section: string }
  | { type: "new-section" }
  | { type: "rename-section"; name: string }
  | { type: "rename-file"; path: string };

function DeletePopover({ path, onConfirm, onCancel }: { path: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-1 z-10 border border-gray-200 rounded bg-white shadow-sm p-3 w-56 space-y-2">
      <p className="text-xs text-gray-500">Delete <span className="underline text-gray-800">{path.split("/").pop()}</span>?</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        <button onClick={onCancel} className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Cancel</button>
      </div>
    </div>
  );
}

function InputPopover({ label, placeholder, onConfirm, onCancel }: {
  label: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  }

  return (
    <div className="absolute left-0 top-full mt-1 z-10 border border-gray-200 rounded bg-white shadow-sm p-3 w-52 space-y-2">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-400"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={!value.trim()} className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-40">
            Create
          </button>
          <button type="button" onClick={onCancel} className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function AdminDashboard({ initialPath }: { initialPath?: string }) {
  const [fileTree, setFileTree] = useState<FileTree>({ rootFiles: [], sections: [] });
  const [active, setActive] = useState<ActiveFile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const [popover, setPopover] = useState<Popover | null>(null);
  const [renamingSectionName, setRenamingSectionName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [titleCache, setTitleCache] = useState<{ [path: string]: string }>({});

  function getTitleFromContent(content: string): string {
    const pattern = /^Title:\s*(.+)$/m;
    const match = content.match(pattern);
    return match ? match[1].toLowerCase() : "";
  }

  async function extractDate(content: string, type: "created" | "updated" = "updated"): Promise<Date | null> {
    const pattern = type === "created" ? /^Created At:\s*(\d{2}\/\d{2}\/\d{4})$/m : /^Updated At:\s*(\d{2}\/\d{2}\/\d{4})$/m;
    const dateMatch = content.match(pattern);
    if (!dateMatch) return null;
    const [day, month, year] = dateMatch[1].split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  async function loadTree() {
    const rootRes = await fetch("/api/admin/files?path=content");
    const rootData = rootRes.ok ? await rootRes.json() : { items: [] };
    const items: { name: string; path: string; type: string }[] = rootData.items ?? [];

    const rootFiles = items
      .filter(i => i.type === "file" && i.name.endsWith(".md"))
      .map(i => `content/${i.name}`);

    // Extract titles for root files
    const newTitleCache: { [path: string]: string } = { ...titleCache };
    for (const path of rootFiles) {
      const fileRes = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
      const fileData = fileRes.ok ? await fileRes.json() : { content: "" };
      const title = getTitleFromContent(fileData.content || "");
      if (title) newTitleCache[path] = title;
    }

    const sections = await Promise.all(
      items
        .filter(i => i.type === "directory")
        .map(async dir => {
          const res = await fetch(`/api/admin/files?path=content/${dir.name}`);
          const data = res.ok ? await res.json() : { items: [] };
          let files = (data.items ?? []).map((f: { name: string }) => `content/${dir.name}/${f.name}`);

          // Sort files by updated date (newest first) if they have dates
          files = await Promise.all(
            files.map(async (path: string) => {
              const fileRes = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
              const fileData = fileRes.ok ? await fileRes.json() : { content: "" };
              const updatedDate = await extractDate(fileData.content || "", "updated");
              const title = getTitleFromContent(fileData.content || "");
              if (title) newTitleCache[path] = title;
              return { path, date: updatedDate };
            })
          ).then(filesWithDates =>
            filesWithDates
              .sort((a, b) => {
                // Files with dates come first, sorted newest-first
                if (a.date && b.date) return b.date.getTime() - a.date.getTime();
                if (a.date) return -1;
                if (b.date) return 1;
                // Files without dates sorted alphabetically
                return a.path.localeCompare(b.path);
              })
              .map(f => f.path)
          );

          return {
            name: dir.name,
            files,
          };
        })
    );

    setTitleCache(newTitleCache);
    setFileTree({ rootFiles, sections });
  }

  useEffect(() => { loadTree(); }, []);

  // Warn about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      if (active && active.isNew) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active]);

  const loadFile = useCallback(async (path: string) => {
    setStatus("Loading…");
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (res.ok) {
      setActive({ path, content: data.content, isNew: false });
      setStatus("");
      setPopover(null);
    } else {
      setStatus(`Error: ${data.error ?? res.status}`);
    }
  }, []);

  useEffect(() => { if (initialPath) loadFile(initialPath); }, [initialPath, loadFile]);

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    setStatus("");

    let contentToSave = active.content;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    // For new files, add both Created At and Updated At
    if (active.isNew) {
      const createdAt = getDateFromContent(contentToSave, "created");
      if (!createdAt) {
        contentToSave = updateDateInContent(contentToSave, dateStr, "created");
      }
      const updatedAt = getDateFromContent(contentToSave, "updated");
      if (!updatedAt) {
        contentToSave = updateDateInContent(contentToSave, dateStr, "updated");
      }
    } else {
      // For existing files, always update the Updated At date to today
      contentToSave = updateDateInContent(contentToSave, dateStr, "updated");
    }

    const res = await fetch("/api/admin/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: active.path, content: contentToSave }),
    });
    if (res.ok) {
      setActive(prev => prev ? { ...prev, isNew: false, content: contentToSave } : null);
      setStatus("Saved ✓");
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!active || active.isNew) return;
    setPopover(null);
    setDeleting(true);
    const res = await fetch("/api/admin/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: active.path }),
    });
    if (res.ok) {
      await loadTree();
      setActive(null);
      setStatus("Deleted ✓");
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setDeleting(false);
  }

  function confirmNewFile(slug: string, section: string) {
    const path = `content/${section}/${slug}.md`;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    const content = `# ${slug}\n\nTitle: ${slug}\nSlug: ${slug}\nCreated At: ${dateStr}\nUpdated At: ${dateStr}\n\n`;
    setActive({ path, content, isNew: true });
    setStatus("");
    setPopover(null);
  }

  async function confirmRenameSection(oldName: string, newName: string) {
    if (oldName === newName) { setPopover(null); return; }
    const res = await fetch("/api/admin/files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `content/${oldName}`, newPath: `content/${newName}` }),
    });
    if (res.ok) {
      // Update active path if it was inside the renamed section
      if (active?.path.startsWith(`content/${oldName}/`)) {
        setActive(prev => prev ? { ...prev, path: prev.path.replace(`content/${oldName}/`, `content/${newName}/`) } : null);
      }
      await loadTree();
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setPopover(null);
  }

  async function confirmRenameFile(oldPath: string, newSlug: string) {
    const parts = oldPath.split("/");
    const fileName = parts.pop()?.replace(/\.md$/, "") ?? "";
    if (fileName === newSlug) { setPopover(null); return; }

    const newPath = oldPath.replace(/\/[^/]+\.md$/, `/${newSlug}.md`);
    const res = await fetch("/api/admin/files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: oldPath, newPath }),
    });
    if (res.ok) {
      // Update active path if renaming the current file
      if (active?.path === oldPath) {
        setActive(prev => prev ? { ...prev, path: newPath } : null);
      }
      await loadTree();
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setPopover(null);
  }

  async function confirmNewSection(name: string) {
    const res = await fetch("/api/admin/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `content/${name}` }),
    });
    if (res.ok) {
      setFileTree(t => ({ ...t, sections: [...t.sections, { name, files: [] }] }));
    } else {
      const data = await res.json();
      setStatus(`Error: ${data.error}`);
    }
    setPopover(null);
  }

  function displayName(path: string) {
    // Return cached title if available, otherwise fallback to slug
    return titleCache[path] || (path.split("/").pop()?.replace(/\.md$/, "") ?? path);
  }

  function getDateFromContent(content: string, type: "created" | "updated" = "updated"): string {
    const pattern = type === "created" ? /^Created At:\s*(\d{2}\/\d{2}\/\d{4})$/m : /^Updated At:\s*(\d{2}\/\d{2}\/\d{4})$/m;
    const match = content.match(pattern);
    return match ? match[1] : "";
  }

  function updateDateInContent(content: string, newDate: string, type: "created" | "updated" = "updated"): string {
    const label = type === "created" ? "Created At" : "Updated At";
    const pattern = type === "created" ? /^Created At:\s*\d{2}\/\d{2}\/\d{4}$/m : /^Updated At:\s*\d{2}\/\d{2}\/\d{4}$/m;
    const dateMatch = content.match(pattern);

    if (dateMatch) {
      // Replace the entire date line
      return content.replace(pattern, `${label}: ${newDate}`);
    }

    // If no date exists, add both dates after the title with proper spacing
    const titleMatch = content.match(/^(# [^\n]+)\n*/);
    if (titleMatch) {
      if (type === "created") {
        // If adding Created At for the first time
        return content.replace(/^(# [^\n]+)(\n*)/, `$1\n\nCreated At: ${newDate}\nUpdated At: ${newDate}\n\n`);
      } else {
        // If adding Updated At, check if Created At exists
        const createdAtLine = content.match(/^Created At:\s*(\d{2}\/\d{2}\/\d{4})$/m);
        if (createdAtLine) {
          // Created At exists, just add Updated At
          return content.replace(/^(Created At:[^\n]*)\n*/, `$1\nUpdated At: ${newDate}\n\n`);
        }
      }
    }
    // Fallback: prepend dates
    return `Created At: ${newDate}\nUpdated At: ${newDate}\n\n${content}`;
  }

  function handleUpdatedAtChange(newDate: string) {
    if (active && newDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      // Only update if it's a valid dd/mm/yyyy format
      const currentDateInContent = getDateFromContent(active.content, "updated");
      if (newDate !== currentDateInContent) {
        const updated = updateDateInContent(active.content, newDate, "updated");
        setActive({ ...active, content: updated });
      }
    }
  }

  const canDelete = active && !active.isNew;
  const createdAtDate = active ? getDateFromContent(active.content, "created") : "";
  const updatedAtDate = active ? getDateFromContent(active.content, "updated") : "";

  return (
    <div className="flex gap-0 min-h-[calc(100vh-2rem)] border border-gray-200 rounded">
      {/* Sidebar */}
      <aside className="w-48 md:w-64 flex-shrink-0 p-4 space-y-4 overflow-y-auto">
        {/* Root files (home.md etc) */}
        {fileTree.rootFiles.map(path => {
          const isActive = active?.path === path;
          return (
            <div key={path} className="flex items-center gap-1 group">
              <button
                onClick={() => loadFile(path)}
                className={`text-sm flex-1 text-left ${isActive ? "underline" : "hover:underline"}`}
              >
                {displayName(path)}
              </button>
              <button
                onClick={() => setPopover(p => p?.type === "rename-file" && p.path === path ? null : { type: "rename-file", path })}
                className="text-xs text-gray-300 hover:text-gray-500 leading-none opacity-0 group-hover:opacity-100"
                title="Rename file"
              >
                ✎
              </button>
              {popover?.type === "rename-file" && popover.path === path && (
                <InputPopover
                  label="Rename file"
                  placeholder={displayName(path)}
                  onConfirm={newSlug => confirmRenameFile(path, newSlug)}
                  onCancel={() => setPopover(null)}
                />
              )}
            </div>
          );
        })}

        {/* Sections */}
        {fileTree.sections.map(section => (
          <div key={section.name}>
            <div className="relative flex items-center gap-1 mb-1 group">
              <p className="text-sm flex-1">{section.name}</p>
              <button
                onClick={() => {
                  setRenamingSectionName(section.name);
                  setRenameValue(section.name);
                }}
                className="text-xs text-gray-300 hover:text-gray-500 leading-none opacity-0 group-hover:opacity-100"
                title="Rename section"
              >
                ✎
              </button>
            </div>
            <div className="space-y-1 pl-2">
              {section.files.map(path => {
                const isActive = active?.path === path;
                return (
                  <div key={path} className="flex items-center gap-1 group">
                    <button
                      onClick={() => loadFile(path)}
                      className={`text-sm flex-1 text-left ${isActive ? "underline" : "hover:underline"}`}
                    >
                      {displayName(path)}
                    </button>
                    <button
                      onClick={() => setPopover(p => p?.type === "rename-file" && p.path === path ? null : { type: "rename-file", path })}
                      className="text-xs text-gray-300 hover:text-gray-500 leading-none opacity-0 group-hover:opacity-100"
                      title="Rename file"
                    >
                      ✎
                    </button>
                    {popover?.type === "rename-file" && popover.path === path && (
                      <InputPopover
                        label="Rename file"
                        placeholder={displayName(path)}
                        onConfirm={newSlug => confirmRenameFile(path, newSlug)}
                        onCancel={() => setPopover(null)}
                      />
                    )}
                  </div>
                );
              })}
              <div className="relative">
                <button
                  onClick={() => setPopover(p => p?.type === "new-file" && p.section === section.name ? null : { type: "new-file", section: section.name })}
                  className="text-sm text-gray-400 hover:text-gray-700"
                >
                  + new
                </button>
                {popover?.type === "new-file" && popover.section === section.name && (
                  <InputPopover
                    label={`New in ${section.name}/`}
                    placeholder="slug-here"
                    onConfirm={slug => confirmNewFile(slug, section.name)}
                    onCancel={() => setPopover(null)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add section */}
        <div className="relative">
          <button
            onClick={() => setPopover(p => p?.type === "new-section" ? null : { type: "new-section" })}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            + section
          </button>
          {popover?.type === "new-section" && (
            <InputPopover
              label="New section"
              placeholder="section-name"
              onConfirm={confirmNewSection}
              onCancel={() => setPopover(null)}
            />
          )}
        </div>
      </aside>

      <ResizableDivider />

      {/* Rename Section Dialog */}
      <Dialog.Root open={renamingSectionName !== null} onOpenChange={(open) => !open && setRenamingSectionName(null)}>
        <Dialog.Portal>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setRenamingSectionName(null)} />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded border border-gray-200 p-6 w-96 shadow-lg z-50">
            <Dialog.Title className="text-sm font-semibold mb-4">Rename section</Dialog.Title>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (renamingSectionName && renameValue.trim()) {
                confirmRenameSection(renamingSectionName, renameValue.trim());
                setRenamingSectionName(null);
              }
            }} className="space-y-4">
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRenamingSectionName(null)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim() || renameValue === renamingSectionName}
                  className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  Rename
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400">{active.path}</span>
              <div className="flex items-center gap-3">
                {status && <span className="text-xs text-gray-500">{status}</span>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {canDelete && (
                  <div className="relative">
                    <button
                      onClick={() => setPopover(p => p?.type === "delete" ? null : { type: "delete", path: active.path })}
                      disabled={deleting}
                      className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                    {popover?.type === "delete" && (
                      <DeletePopover
                        path={active.path}
                        onConfirm={confirmDelete}
                        onCancel={() => setPopover(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-semibold">Created At:</label>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded font-mono text-gray-600">{createdAtDate || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-semibold">Updated At:</label>
                <input
                  type="text"
                  value={updatedAtDate}
                  onChange={e => handleUpdatedAtChange(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className="text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-gray-400 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex-1 flex min-h-0">
              <textarea
                value={active.content}
                onChange={e => setActive(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="w-1/2 p-4 font-mono text-sm resize-none focus:outline-none border-r border-gray-200"
                spellCheck={false}
              />
              <div className="w-1/2 p-4 overflow-y-auto text-sm">
                <MarkdownRenderer content={active.content} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm">
            {status
              ? <span className="text-red-500">{status}</span>
              : <span className="text-gray-400">Select a file to edit</span>}
          </div>
        )}
      </div>
    </div>
  );
}
