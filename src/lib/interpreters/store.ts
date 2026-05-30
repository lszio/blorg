type LogEntry = {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: number;
};

type Listener = (logs: LogEntry[]) => void;

class LogStore {
  private logs: LogEntry[] = [];
  private listeners: Set<Listener> = new Set();

  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    const fullEntry = { ...entry, timestamp: Date.now() };
    this.logs = [...this.logs, fullEntry];
    this.notify();
  }

  getLogs() { return this.logs; }

  clear() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }
}

export const logStore = new LogStore();
