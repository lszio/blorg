/**
 * Simple OPFS (Origin Private File System) wrapper for code persistence
 */

export async function saveFile(path: string, content: string): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const parts = path.split('/');
  let current = root;

  // Create directories if they don't exist
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i], { create: true });
  }

  const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function readFile(path: string): Promise<string | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const parts = path.split('/');
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }

    const fileHandle = await current.getFileHandle(parts[parts.length - 1]);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (e) {
    return null;
  }
}

export async function listFiles(dirPath: string = ''): Promise<string[]> {
  try {
    const root = await navigator.storage.getDirectory();
    let current = root;

    if (dirPath) {
      const parts = dirPath.split('/');
      for (const part of parts) {
        current = await current.getDirectoryHandle(part);
      }
    }

    const files: string[] = [];
    // @ts-ignore - entries() is available in most modern browsers
    for await (const [name, handle] of current.entries()) {
      if (handle.kind === 'file') {
        files.push(name);
      }
    }
    return files;
  } catch (e) {
    return [];
  }
}
