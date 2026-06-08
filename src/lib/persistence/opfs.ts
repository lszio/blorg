/**
 * PersistBackend — abstraction for workspace/cell persistence.
 *
 * The interface is small and stable. Implementations swap underneath
 * without changing callers. Current implementation uses OPFS; future
 * impls can use IndexedDB, localStorage, or remote storage.
 *
 * Every public function guards against SSR: if `navigator.storage`
 * is not available (SSR/browser-unsupported), the functions silently
 * no-op. This prevents crashes during Astro's build phase.
 */

// ── Interface ───────────────────────────────────────────────

export interface PersistBackend {
  save(name: string, data: unknown): Promise<void>;
  load(name: string): Promise<unknown | null>;
  list(prefix?: string): Promise<string[]>;
  remove(name: string): Promise<void>;
}

// ── SSR guard ───────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'storage' in navigator;
}

// ── OPFS Implementation ─────────────────────────────────────

class OPFSBackend implements PersistBackend {
  async save(name: string, data: unknown): Promise<void> {
    if (!isBrowser()) return;
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const root = await navigator.storage.getDirectory();
    const parts = this._resolve(name);
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }
    const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async load(name: string): Promise<unknown | null> {
    if (!isBrowser()) return null;
    try {
      const root = await navigator.storage.getDirectory();
      const parts = this._resolve(name);
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i]);
      }
      const fileHandle = await current.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      const text = await file.text();
      // Attempt JSON parse; fall back to raw text
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch {
      return null;
    }
  }

  async list(prefix: string = ''): Promise<string[]> {
    if (!isBrowser()) return [];
    try {
      const root = await navigator.storage.getDirectory();
      let current = root;
      if (prefix) {
        const parts = prefix.split('/');
        for (const part of parts) {
          current = await current.getDirectoryHandle(part);
        }
      }
      const names: string[] = [];
      for await (const [name, handle] of (current as any).entries()) {
        if (handle.kind === 'file') names.push(name);
      }
      return names;
    } catch {
      return [];
    }
  }

  async remove(name: string): Promise<void> {
    if (!isBrowser()) return;
    try {
      const root = await navigator.storage.getDirectory();
      const parts = this._resolve(name);
      const fileName = parts.pop()!;
      let current = root;
      for (const part of parts) {
        current = await current.getDirectoryHandle(part);
      }
      await current.removeEntry(fileName);
    } catch {
      // File might not exist; silently ignore.
    }
  }

  private _resolve(name: string): string[] {
    return name.split('/').filter(Boolean);
  }
}

// ── Singleton ───────────────────────────────────────────────

let _backend: PersistBackend | null = null;

/**
 * Get or create the default persist backend.
 * On first call, creates an OPFSBackend.
 * Can be overridden for testing with setBackend().
 */
export function getBackend(): PersistBackend {
  if (!_backend) {
    _backend = new OPFSBackend();
  }
  return _backend;
}

/**
 * Override the backend (for testing or alternate storage).
 */
export function setBackend(backend: PersistBackend): void {
  _backend = backend;
}

/**
 * Reset to default.
 */
export function resetBackend(): void {
  _backend = null;
}