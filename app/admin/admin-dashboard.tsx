"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ResizableDivider } from "@/components/resizable-divider";

type Section = { name: string; files: string[] };
type FileTree = { rootFiles: string[]; sections: Section[] };
type ActiveFile = { path: string; content: string; isNew: boolean };
type Popover =
  | { type: "delete"; path: string }
  | { type: "new-section" }
  | { type: "rename-section"; name: string }
  | { type: "rename-file"; path: string };

function DeletePopover({ path, onConfirm, onCancel }: { path: string; onConfirm: () => void; onCancel: () => void }) {
  const handleDelete = () => {
    const fileName = path.split("/").pop();
    if (confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
      onConfirm();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-1 z-10 border border-border rounded bg-card shadow-sm p-3 w-56 space-y-2">
      <p className="text-xs text-muted-foreground">Delete <span className="underline text-foreground">{path.split("/").pop()}</span>?</p>
      <div className="flex gap-2">
        <button onClick={handleDelete} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        <button onClick={onCancel} className="text-xs px-2 py-1 border border-border rounded hover:bg-muted">Cancel</button>
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
    <div className="absolute left-0 top-full mt-1 z-10 border border-border rounded bg-card shadow-sm p-3 w-52 space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-input rounded px-2 py-1 text-sm focus:outline-none focus:border-ring bg-background text-foreground"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={!value.trim()} className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40">
            Create
          </button>
          <button type="button" onClick={onCancel} className="text-xs px-2 py-1 border border-border rounded hover:bg-muted">
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const [popover, setPopover] = useState<Popover | null>(null);
  const [sectionNameEdit, setSectionNameEdit] = useState<string>("");
  const [titleCache, setTitleCache] = useState<{ [path: string]: string }>({});
  const [statusCache, setStatusCache] = useState<{ [path: string]: string }>({});
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [editingStatus, setEditingStatus] = useState<"public" | "draft" | "private">("draft");
  const [isDirty, setIsDirty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs that always hold current values — used by handleSave to avoid stale closures
  const activeRef = useRef<ActiveFile | null>(null);
  const editingTitleRef = useRef("");
  const editingSlugRef = useRef("");
  const editingStatusRef = useRef<"public" | "draft" | "private">("draft");
  activeRef.current = active;
  editingTitleRef.current = editingTitle;
  editingSlugRef.current = editingSlug;
  editingStatusRef.current = editingStatus;

  function getTitleFromContent(content: string): string {
    const match = content.match(/^Title:\s*(.+)$/m);
    return match ? match[1].trim() : "";
  }

  function getSlugFromContent(content: string): string {
    const match = content.match(/^Slug:\s*(.+)$/m);
    return match ? match[1].trim() : "";
  }

  function getStatusFromContent(content: string): "public" | "draft" | "private" {
    const match = content.match(/^Status:\s*(.+)$/m);
    const val = match?.[1].trim().toLowerCase();
    if (val === "draft" || val === "private") return val;
    return "public";
  }

  function getMarkdownBodyFromContent(content: string): string {
    return content
      .replace(/^\s*#\s+[^\n]+\n?/, "")
      .replace(/^Title:\s*[^\n]*\n?/m, "")
      .replace(/^Slug:\s*[^\n]*\n?/m, "")
      .replace(/^Status:\s*[^\n]*\n?/m, "")
      .replace(/\n\nCreated At:[^\n]*/g, "")
      .replace(/\nUpdated At:[^\n]*/g, "")
      .replace(/^Created At:[^\n]*\n?/m, "")
      .replace(/^Updated At:[^\n]*\n?/m, "")
      .replace(/^\n+/, "");
  }

  function reconstructContent(
    title: string,
    slug: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    body: string
  ): string {
    const metaLines: string[] = [];
    if (title) metaLines.push(`Title: ${title}`);
    if (slug) metaLines.push(`Slug: ${slug}`);
    metaLines.push(`Status: ${status || "draft"}`);

    const trimmedBody = body.replace(/^\n+/, '');
    const result = metaLines.length > 0
      ? `${metaLines.join("\n")}\n\n${trimmedBody}`
      : trimmedBody;

    return `${result}\n\nCreated At: ${createdAt}\nUpdated At: ${updatedAt}`;
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

    // Extract titles and statuses for root files
    const newTitleCache: { [path: string]: string } = { ...titleCache };
    const newStatusCache: { [path: string]: string } = { ...statusCache };
    for (const path of rootFiles) {
      const fileRes = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
      const fileData = fileRes.ok ? await fileRes.json() : { content: "" };
      const title = getTitleFromContent(fileData.content || "");
      if (title) newTitleCache[path] = title;
      newStatusCache[path] = getStatusFromContent(fileData.content || "");
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
              newStatusCache[path] = getStatusFromContent(fileData.content || "");
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
    setStatusCache(newStatusCache);
    setFileTree({ rootFiles, sections });
  }

  useEffect(() => { loadTree(); }, []);

  // Default open on desktop, closed on mobile
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Warn about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const loadFile = useCallback(async (path: string) => {
    if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
    setStatus("Loading…");
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (res.ok) {
      const content = data.content;
      setActive({ path, content, isNew: false });
      setEditingTitle(getTitleFromContent(content));
      setEditingSlug(getSlugFromContent(content));
      setEditingStatus(getStatusFromContent(content));
      setIsDirty(false);
      setStatus("");
      setPopover(null);
    } else {
      setStatus(`Error: ${data.error ?? res.status}`);
    }
  }, []);

  useEffect(() => { if (initialPath) loadFile(initialPath); }, [initialPath, loadFile]);

  async function handleSave() {
    // active.content is already kept in sync with all editing fields
    // (title, slug, status, body) — we only need to update the date
    const currentActive = activeRef.current;
    if (!currentActive) return;
    console.log("[handleSave] path:", currentActive.path, "content preview:", currentActive.content.slice(0, 200));
    setSaving(true);
    setStatus("");

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    let contentToSave = currentActive.content;

    if (currentActive.isNew) {
      if (!getDateFromContent(contentToSave, "created")) {
        contentToSave = updateDateInContent(contentToSave, dateStr, "created");
      }
      if (!getDateFromContent(contentToSave, "updated")) {
        contentToSave = updateDateInContent(contentToSave, dateStr, "updated");
      }
    } else {
      contentToSave = updateDateInContent(contentToSave, dateStr, "updated");
    }

    const res = await fetch("/api/admin/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: currentActive.path, content: contentToSave }),
    });
    if (res.ok) {
      if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
      setActive(prev => prev ? { ...prev, isNew: false, content: contentToSave } : null);
      setTitleCache(prev => ({ ...prev, [currentActive.path]: editingTitleRef.current }));
      setStatusCache(prev => ({ ...prev, [currentActive.path]: editingStatusRef.current }));
      setIsDirty(false);
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

  function confirmNewFile(section: string) {
    const path = `content/${section}/new-file.md`;
    const content = `Title: \nSlug: \nStatus: draft\n\n\nCreated At: \nUpdated At: \n\n`;
    setActive({ path, content, isNew: true });
    setEditingTitle("");
    setEditingSlug("");
    setEditingStatus("draft");
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

  async function confirmDeleteSection(sectionName: string) {
    if (confirm(`Are you sure you want to delete the "${sectionName}" section and all its files? This cannot be undone.`)) {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `content/${sectionName}` }),
      });
      if (res.ok) {
        // Clear active file if it was in the deleted section
        if (active?.path.startsWith(`content/${sectionName}/`)) {
          setActive(null);
        }
        setActiveSection(null);
        await loadTree();
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error}`);
      }
    }
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
    // Return cached title if available, otherwise fallback to slug - all lowercase
    const name = titleCache[path] || (path.split("/").pop()?.replace(/\.md$/, "") ?? path);
    return name.toLowerCase();
  }

  function getDateFromContent(content: string, type: "created" | "updated" = "updated"): string {
    const pattern = type === "created" ? /^Created At:\s*(\d{2}\/\d{2}\/\d{4})$/m : /^Updated At:\s*(\d{2}\/\d{2}\/\d{4})$/m;
    const match = content.match(pattern);
    return match ? match[1] : "";
  }

  // Convert dd/mm/yyyy to YYYY-MM-DD for HTML5 date input
  function formatDateForInput(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  }

  // Convert YYYY-MM-DD from HTML5 date input to dd/mm/yyyy for markdown
  function formatDateForMarkdown(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return "";
  }

  function updateDateInContent(content: string, newDate: string, type: "created" | "updated" = "updated"): string {
    const label = type === "created" ? "Created At" : "Updated At";
    const pattern = new RegExp(`^${label}:.*$`, 'm');
    if (pattern.test(content)) {
      return content.replace(pattern, `${label}: ${newDate}`);
    }
    return `Created At: ${newDate}\nUpdated At: ${newDate}\n\n${content}`;
  }

  function handleCreatedAtChange(dateInputValue: string) {
    if (active && dateInputValue) {
      const markdownDate = formatDateForMarkdown(dateInputValue);
      const currentDateInContent = getDateFromContent(active.content, "created");
      if (markdownDate !== currentDateInContent) {
        const updated = updateDateInContent(active.content, markdownDate, "created");
        setActive({ ...active, content: updated });
        scheduleAutoSave();
      }
    }
  }

  function handleUpdatedAtChange(dateInputValue: string) {
    if (active && dateInputValue) {
      const markdownDate = formatDateForMarkdown(dateInputValue);
      const currentDateInContent = getDateFromContent(active.content, "updated");
      if (markdownDate !== currentDateInContent) {
        const updated = updateDateInContent(active.content, markdownDate, "updated");
        setActive({ ...active, content: updated });
        scheduleAutoSave();
      }
    }
  }

  function scheduleAutoSave() {
    setIsDirty(true);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!activeRef.current || activeRef.current.isNew) return;
    autoSaveTimerRef.current = setTimeout(handleSave, 1500);
  }

  function handleTitleChange(newTitle: string) {
    setEditingTitle(newTitle);
    if (!active) return;
    const createdAt = getDateFromContent(active.content, "created");
    const updatedAt = getDateFromContent(active.content, "updated");
    const body = getMarkdownBodyFromContent(active.content);
    const newContent = reconstructContent(newTitle, editingSlug, editingStatus, createdAt, updatedAt, body);
    setActive(prev => prev ? { ...prev, content: newContent } : null);
    scheduleAutoSave();
  }

  function handleSlugChange(newSlug: string) {
    setEditingSlug(newSlug);
    if (!active) return;
    const createdAt = getDateFromContent(active.content, "created");
    const updatedAt = getDateFromContent(active.content, "updated");
    const body = getMarkdownBodyFromContent(active.content);
    setActive(prev => prev ? { ...prev, content: reconstructContent(editingTitle, newSlug, editingStatus, createdAt, updatedAt, body) } : null);
    scheduleAutoSave();
  }

  function handleStatusChange(newStatus: "public" | "draft" | "private") {
    setEditingStatus(newStatus);
    if (!active) return;
    const createdAt = getDateFromContent(active.content, "created");
    const updatedAt = getDateFromContent(active.content, "updated");
    const body = getMarkdownBodyFromContent(active.content);
    setActive(prev => prev ? { ...prev, content: reconstructContent(editingTitle, editingSlug, newStatus, createdAt, updatedAt, body) } : null);
    scheduleAutoSave();
  }

  const canDelete = active && !active.isNew;
  const createdAtDate = active ? getDateFromContent(active.content, "created") : "";
  const updatedAtDate = active ? getDateFromContent(active.content, "updated") : "";

  return (
    <div className="flex gap-0 min-h-[calc(100vh-2rem)] border border-border rounded md:max-w-[75vw] mx-auto w-full">
      {/* Sidebar */}
      <div className={sidebarOpen ? "contents" : "hidden"}>
      <aside className="w-full md:w-64 flex-shrink-0 p-4 space-y-4 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-sm hover:underline block mb-2"
        >
          ← collapse
        </button>
        {/* Root files (home.md etc) */}
        {fileTree.rootFiles.map(path => {
          const isActive = active?.path === path;
          const fileStatus = statusCache[path] ?? "public";
          return (
            <button
              key={path}
              onClick={() => loadFile(path)}
              className={`text-sm block text-left ${isActive ? "underline" : "hover:underline"}`}
            >
              {displayName(path)}
              {fileStatus !== "public" && (
                <span className="ml-1 text-xs text-muted-foreground">({fileStatus})</span>
              )}
            </button>
          );
        })}

        {/* Sections */}
        {fileTree.sections.map(section => (
          <div key={section.name}>
            <button
              onClick={() => {
                setActive(null);
                setActiveSection(section.name);
                setSectionNameEdit(section.name);
              }}
              className="text-sm mb-1 block hover:underline w-full text-left"
            >
              {section.name}
            </button>
            <div className="space-y-1 pl-2">
              {section.files.map(path => {
                const isActive = active?.path === path;
                const fileStatus = statusCache[path] ?? "public";
                return (
                  <button
                    key={path}
                    onClick={() => loadFile(path)}
                    className={`text-sm block text-left ${isActive ? "underline" : "hover:underline"}`}
                  >
                    {displayName(path)}
                    {fileStatus !== "public" && (
                      <span className="ml-1 text-xs text-muted-foreground">({fileStatus})</span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => confirmNewFile(section.name)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                + new
              </button>
            </div>
          </div>
        ))}

        {/* Add section */}
        <div className="relative">
          <button
            onClick={() => setPopover(p => p?.type === "new-section" ? null : { type: "new-section" })}
            className="text-sm text-muted-foreground hover:text-foreground"
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
      </div>

      {/* Main panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? "hidden md:flex" : "flex"}`}>
        {!sidebarOpen && (
          <button
            className="text-sm hover:underline p-4 pb-0 block"
            onClick={() => setSidebarOpen(true)}
          >
            ≡ menu
          </button>
        )}
        {activeSection ? (
          <>
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Section: {activeSection}</span>
              <div className="flex items-center gap-3">
                {status && <span className="text-xs text-muted-foreground">{status}</span>}
                <button
                  onClick={() => confirmDeleteSection(activeSection)}
                  className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Delete
                </button>
                <button
                  onClick={() => setActiveSection(null)}
                  className="text-sm px-3 py-1 border border-border rounded hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (sectionNameEdit.trim() && sectionNameEdit !== activeSection) {
                      confirmRenameSection(activeSection, sectionNameEdit.trim());
                      setActiveSection(null);
                    }
                  }}
                  disabled={!sectionNameEdit.trim() || sectionNameEdit === activeSection}
                  className="text-sm px-3 py-1 bg-black text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="px-4 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground font-semibold">Section Name:</label>
                <input
                  type="text"
                  value={sectionNameEdit}
                  onChange={(e) => setSectionNameEdit(e.target.value)}
                  className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground flex-1 max-w-xs"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Edit section name and click Save to confirm
            </div>
          </>
        ) : active ? (
          <>
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{active.path}</span>
              <div className="flex items-center gap-3">
                {status
                  ? <span className="text-xs text-muted-foreground">{status}</span>
                  : isDirty && <span className="text-xs text-muted-foreground">unsaved</span>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-3 py-1 bg-black text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {canDelete && (
                  <div className="relative">
                    <button
                      onClick={() => setPopover(p => p?.type === "delete" ? null : { type: "delete", path: active.path })}
                      disabled={deleting}
                      className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
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

            <div className="px-4 py-2 border-b border-border bg-card space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-muted-foreground font-semibold">Title:</label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Page title"
                    className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground flex-1"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-muted-foreground font-semibold">Slug:</label>
                  <input
                    type="text"
                    value={editingSlug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="url-slug"
                    className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground font-semibold">Created At:</label>
                  <input
                    type="date"
                    value={formatDateForInput(createdAtDate)}
                    onChange={e => handleCreatedAtChange(e.target.value)}
                    className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground font-semibold">Updated At:</label>
                  <input
                    type="date"
                    value={formatDateForInput(updatedAtDate)}
                    onChange={e => handleUpdatedAtChange(e.target.value)}
                    className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground font-semibold">Status:</label>
                  <select
                    value={editingStatus}
                    onChange={e => handleStatusChange(e.target.value as "public" | "draft" | "private")}
                    className="text-sm px-2 py-1 border border-input rounded focus:outline-none focus:border-ring bg-background text-foreground"
                  >
                    <option value="public">public</option>
                    <option value="draft">draft</option>
                    <option value="private">private</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 flex min-h-0">
              <textarea
                value={getMarkdownBodyFromContent(active.content)}
                onChange={e => {
                  const createdAt = getDateFromContent(active.content, "created");
                  const updatedAt = getDateFromContent(active.content, "updated");
                  setActive(prev => prev ? { ...prev, content: reconstructContent(editingTitle, editingSlug, editingStatus, createdAt, updatedAt, e.target.value) } : null);
                  scheduleAutoSave();
                }}
                className="w-1/2 p-4 font-mono text-sm resize-none focus:outline-none border-r border-border bg-background text-foreground"
                spellCheck={false}
                placeholder="Write your markdown here..."
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
              : <span className="text-muted-foreground">Select a file to edit</span>}
          </div>
        )}
      </div>
    </div>
  );
}
