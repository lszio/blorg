import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logStore } from './store';

describe('LogStore', () => {
  beforeEach(() => {
    logStore.clear();
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
    const unsubscribe = logStore.subscribe(listener);
    
    logStore.addLog({ type: 'success', message: 'done' });
    
    expect(listener).toHaveBeenCalledWith(logStore.getLogs());
    unsubscribe();
  });

  it('should notify subscribers when logs are cleared', () => {
    const listener = vi.fn();
    const unsubscribe = logStore.subscribe(listener);
    
    logStore.clear();
    
    expect(listener).toHaveBeenCalledWith([]);
    unsubscribe();
  });

  it('should not notify after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = logStore.subscribe(listener);
    unsubscribe();
    
    logStore.addLog({ type: 'error', message: 'fail' });
    
    expect(listener).not.toHaveBeenCalled();
  });
});
