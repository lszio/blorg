/**
 * Blorg Core Domain Model
 *
 * These types define the stable abstractions of the system.
 * Components consume these interfaces — not raw React state.
 */

// ── Evaluation ──────────────────────────────────────────────

export interface EvaluationResult {
  output: string;
  error?: string;
  logs?: string[];
}

export interface Interpreter {
  id: string;
  name: string;
  language: string;
  /**
   * Boot the interpreter runtime. Safe to call multiple times.
   */
  init(): Promise<void>;
  /**
   * Evaluate code in this interpreter's environment.
   * The caller is responsible for session isolation — pass a forked
   * environment if cells should not share bindings.
   */
  eval(code: string): Promise<EvaluationResult>;
  /**
   * Reset the internal environment to a clean state.
   */
  reset?(): Promise<void>;
}

export type InterpreterFactory = (lang: string) => Promise<Interpreter>;

// ── Cell ────────────────────────────────────────────────────

export type CellStatus = 'idle' | 'running' | 'success' | 'error';

export interface Cell {
  readonly id: string;
  readonly created: number;
  language: string;
  code: string;
  output: EvaluationResult | null;
  status: CellStatus;
  modified: number;
}

/**
 * Create a new cell with default state.
 */
export function createCell(language: string, code: string = ''): Cell {
  const now = Date.now();
  return {
    id: `cell_${now}_${Math.random().toString(36).slice(2, 8)}`,
    created: now,
    language,
    code,
    output: null,
    status: 'idle',
    modified: now,
  };
}

// ── Workspace ───────────────────────────────────────────────

export interface Workspace {
  readonly id: string;
  readonly created: number;
  title: string;
  cells: Cell[];
  modified: number;
}

export function createWorkspace(title: string): Workspace {
  const now = Date.now();
  return {
    id: `ws_${now}`,
    created: now,
    title,
    cells: [],
    modified: now,
  };
}

// ── Event Bus (lightweight, replaces global singleton listeners) ──

export type EventMap = {
  'cell:run': { cellId: string; code: string; language: string };
  'cell:result': { cellId: string; result: EvaluationResult; duration: number };
  'cell:error': { cellId: string; error: string };
  'workspace:save': { workspaceId: string };
  'workspace:load': { workspaceId: string };
  'log:entry': { type: 'info' | 'error' | 'success'; message: string };
};

type EventHandler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export class EventBus {
  private listeners = new Map<string, Set<Function>>();
  private nextId = 0;

  on<K extends keyof EventMap>(event: K, handler: EventHandler<K>): () => void {
    const token = `l_${this.nextId++}`;
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    // Store token on the handler for removal
    (handler as any).__token = token;
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }

  /**
   * Remove all listeners — useful in tests or workspace teardown.
   */
  clear(): void {
    this.listeners.clear();
  }
}

/** Global singleton event bus. */
export const eventBus = new EventBus();