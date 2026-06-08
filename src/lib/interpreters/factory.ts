/**
 * Session — manages per-session interpreter isolation.
 *
 * Each Session owns its own interpreter instance and environment,
 * so code executed in one session (or cell group) cannot leak into another.
 *
 * Sessions can optionally fork: `session.fork()` creates a child with
 * a clean (or parent-copied) environment.
 */

import { LipsInterpreter } from './lips';
import type { Interpreter, EvaluationResult } from './types';

// ── Interpreters are still singletons *per language* (runtime reuse),
//    but each Session gets its own context/environment.

const runtimeCache = new Map<string, Interpreter>();

async function getOrCreateRuntime(lang: string): Promise<Interpreter> {
  const key = lang.toLowerCase();
  if (!runtimeCache.has(key)) {
    if (key === 'scheme' || key === 'lisp') {
      const i = new LipsInterpreter();
      await i.init();
      runtimeCache.set(key, i);
    } else {
      throw new Error(`Unsupported language: ${lang}`);
    }
  }
  return runtimeCache.get(key)!;
}

// ── Session ─────────────────────────────────────────────────

export interface SessionSnapshot {
  id: string;
  language: string;
  // Context is opaque: serialized representation of the current env.
  // For LIPS this is a JSON-safe representation; other interpreters may differ.
  context: unknown;
}

export class Session {
  readonly id: string;
  readonly language: string;

  private runtime: Interpreter | null = null;
  /** LIPS-specific env reference for fork isolation.
   *  Stored after init so we can snapshot/restore clean copies. */
  private env: any = null;

  constructor(language: string) {
    this.language = language;
    this.id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async init(): Promise<void> {
    this.runtime = await getOrCreateRuntime(this.language);
    // Capture a reference to the top-level environment.
    // LipsInterpreter exposes it on the module instance.
    if (this.runtime && 'lips' in (this.runtime as any)) {
      const lips = (this.runtime as any).lips;
      this.env = lips.env; // root env
    }
  }

  async eval(code: string): Promise<EvaluationResult> {
    if (!this.runtime) await this.init();
    return this.runtime!.eval(code);
  }

  /**
   * Create a forked child session that shares the same interpreter
   * runtime but gets an isolated environment.
   *
   * For LIPS this clones the current env so the child starts with
   * all parent bindings but mutations stay local.
   */
  async fork(): Promise<Session> {
    const child = new Session(this.language);
    if (!this.runtime) await this.init();
    child.runtime = this.runtime;
    // Clone env — LIPS envs are plain objects that can be shallow-copied
    // for the top level. A deep clone ensures mutations don't leak.
    if (this.env) {
      child.env = deepCloneEnv(this.env);
      // Patch the child's runtime eval to use the cloned env.
      // We do this by wrapping runtime.eval to set env before each call.
      const originalEval = this.runtime!.eval.bind(this.runtime!);
      child.eval = async (code: string) => {
        const lips = (this.runtime as any).lips;
        const oldEnv = lips.env;
        lips.env = child.env;
        try {
          return await originalEval(code);
        } finally {
          lips.env = oldEnv;
        }
      };
    }
    return child;
  }

  async reset(): Promise<void> {
    this.env = null;
    this.runtime = null;
  }

  snapshot(): SessionSnapshot {
    return { id: this.id, language: this.language, context: this.env };
  }
}

function deepCloneEnv(env: any): any {
  if (!env || typeof env !== 'object') return env;
  if (Array.isArray(env)) return env.map(deepCloneEnv);
  const clone: Record<string, any> = {};
  for (const key of Object.keys(env)) {
    const val = env[key];
    // Skip functions, keep primitives and plain objects
    if (typeof val === 'function' || typeof val === 'symbol') {
      clone[key] = val;
    } else if (typeof val === 'object' && val !== null) {
      clone[key] = deepCloneEnv(val);
    } else {
      clone[key] = val;
    }
  }
  return clone;
}

// ── Backward-compatible factory (no longer a global single-instance) ──

import type { InterpreterFactory as IF } from './types';

/**
 * @deprecated Use `new Session(language)` instead.
 *             Kept for backward compatibility with existing components.
 */
export const getInterpreter: IF = async (lang: string): Promise<Interpreter> => {
  const session = new Session(lang);
  await session.init();
  return session as unknown as Interpreter;
};