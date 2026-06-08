/**
 * LogStore — bounded, observable log buffer.
 *
 * Changes from the previous version:
 *  - MAX_ENTRIES limit prevents unbounded memory growth
 *  - subscribe returns a proper unsubscribe function
 *  - Uses the global EventBus for cross-component log events
 */

import { eventBus } from '../types';

type LogEntry = {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: number;
};

type Listener = (logs: LogEntry[]) => void;

const MAX_ENTRIES = 200;

class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Set<Listener> = new Set();
  private unsubscribed = false;

  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    if (this.unsubscribed) return;
    const fullEntry = { ...entry, timestamp: Date.now() };
    this.logs = [...this.logs, fullEntry];
    // Enforce bound — drop oldest entries
    if (this.logs.length > MAX_ENTRIES) {
      this.logs = this.logs.slice(this.logs.length - MAX_ENTRIES);
    }
    this.notify();
    // Also emit on the global event bus for cross-component awareness
    eventBus.emit('log:entry', fullEntry);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  /**
   * Subscribe to log changes. Returns an unsubscribe function.
   * Always call it in the component's cleanup (onUnmount / return of useEffect).
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    const self = this;
    return function unsubscribe() {
      self.listeners.delete(listener);
    };
  }

  /**
   * Unsubscribe all. Call during app teardown / test cleanup.
   */
  destroy() {
    this.unsubscribed = true;
    this.listeners.clear();
    this.logs = [];
  }

  private notify() {
    // Defensive copy: listeners receive a snapshot, not a live reference
    const snapshot = [...this.logs];
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const logStore = new LogStore();