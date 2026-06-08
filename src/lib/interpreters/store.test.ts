import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import { logStore } from './store';

const MAX_ENTRIES = 200;

describe('LogStore', () => {
  beforeEach(() => {
    logStore.clear();
  });

  afterAll(() => {
    logStore.destroy();
  });

  it('should start with an empty log list', () => {
    expect(logStore.getLogs()).toEqual([]);
  });

  it('should add a log entry', () => {
    const entry = { type: 'info' as const, message: 'test message' };
    logStore.addLog(entry);
    const logs = logStore.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject(entry);
    expect(logs[0].timestamp).toBeDefined();
  });

  it('should clear logs', () => {
    logStore.addLog({ type: 'info', message: 'test' });
    logStore.clear();
    expect(logStore.getLogs()).toEqual([]);
  });

  it('should notify subscribers when a log is added', () => {
    const listener = vi.fn();
    const unsub = logStore.subscribe(listener);

    logStore.addLog({ type: 'success', message: 'done' });

    expect(listener).toHaveBeenCalled();
    unsub();
  });

  it('should notify subscribers when logs are cleared', () => {
    const listener = vi.fn();
    const unsub = logStore.subscribe(listener);

    logStore.clear();

    expect(listener).toHaveBeenCalledWith([]);
    unsub();
  });

  it('should not notify after unsubscribe', () => {
    const listener = vi.fn();
    const unsub = logStore.subscribe(listener);
    unsub();

    logStore.addLog({ type: 'error', message: 'fail' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should enforce MAX_ENTRIES limit', () => {
    // Fill with MAX_ENTRIES + some overflow
    for (let i = 0; i < MAX_ENTRIES + 50; i++) {
      logStore.addLog({ type: 'info', message: `entry ${i}` });
    }
    expect(logStore.getLogs().length).toBe(MAX_ENTRIES);
    // The oldest entry should be gone
    const logs = logStore.getLogs();
    expect(logs[0].message).toBe('entry 50');
    expect(logs[logs.length - 1].message).toBe(`entry ${MAX_ENTRIES + 49}`);
  });

  it('should provide a defensive copy to subscribers', () => {
    const listener = vi.fn();
    const unsub = logStore.subscribe(listener);

    logStore.addLog({ type: 'info', message: 'hello' });
    const capturedLogs = listener.mock.calls[0][0];
    // Mutating the received snapshot should not affect the store
    capturedLogs.push({ type: 'info', message: 'injected', timestamp: 0 });
    expect(logStore.getLogs()).toHaveLength(1);
    unsub();
  });
});