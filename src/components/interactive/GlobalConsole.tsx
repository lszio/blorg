import React, { useEffect, useState, useRef } from 'react';
import { logStore } from "@/lib/interpreters/store";
import { Terminal, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const GlobalConsole: React.FC = () => {
  const [logs, setLogs] = useState(logStore.getLogs());
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return logStore.subscribe(setLogs);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 glass-dark text-white transition-all duration-300 ease-in-out",
      isExpanded ? "h-64" : "h-12"
    )}>
      <div 
        className="flex items-center justify-between px-6 h-12 cursor-pointer border-b border-white/10 hover:bg-white/5 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Interpreter Session</span>
          {logs.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px]">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); logStore.clear(); }} 
            className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="size-4" />
          </button>
          {isExpanded ? <ChevronDown className="size-4 opacity-50" /> : <ChevronUp className="size-4 opacity-50" />}
        </div>
      </div>
      
      {isExpanded && (
        <div ref={scrollRef} className="p-4 overflow-y-auto h-52 font-mono text-[11px] space-y-2 selection:bg-white/20">
          {logs.length === 0 && (
            <div className="flex items-center justify-center h-full text-white/20 italic tracking-tight">
              No output yet. Run a cell to see results here.
            </div>
          )}
          {logs.map((log, i) => (
            <div key={log.timestamp + i} className={cn(
              "flex gap-3 leading-relaxed border-l-2 pl-3 py-0.5",
              log.type === 'error' ? "text-rose-400 border-rose-400/30" : 
              log.type === 'success' ? "text-emerald-400 border-emerald-400/30" : 
              "text-white/80 border-white/10"
            )}>
              <span className="opacity-30 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
              <span className="break-all whitespace-pre-wrap">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
