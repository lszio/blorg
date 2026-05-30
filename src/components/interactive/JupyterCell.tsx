import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getInterpreter } from "@/lib/interpreters/factory";
import type { EvaluationResult, Interpreter } from "@/lib/interpreters/types";
import { Play } from "lucide-react";

interface JupyterCellProps {
  initialCode: string;
  language: string;
  autoRun?: boolean;
  className?: string;
  onSave?: (code: string) => void;
}

export const JupyterCell: React.FC<JupyterCellProps> = ({
  initialCode,
  language,
  autoRun = false,
  className,
  onSave
}) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [interpreter, setInterpreter] = useState<Interpreter | null>(null);

  useEffect(() => {
    getInterpreter(language).then(setInterpreter);
  }, [language]);

  useEffect(() => {
    if (autoRun && interpreter) {
      handleRun();
    }
  }, [interpreter]);

  const handleRun = async () => {
    if (!interpreter) return;
    setIsRunning(true);
    try {
      const res = await interpreter.eval(code);
      setResult(res);
      if (onSave) onSave(code);
    } catch (e: any) {
      setResult({ output: "", error: e.message || String(e) });
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.shiftKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className={cn("group relative flex flex-col border rounded-md my-6 bg-background shadow-sm hover:shadow-md transition-shadow overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="uppercase font-bold text-primary/70">{language}</span>
          {isRunning && <span className="animate-pulse text-primary">● Running...</span>}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px]">Shift + Enter to run</span>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[80px] p-4 font-mono text-sm bg-transparent resize-y focus:outline-none leading-relaxed border-none"
          spellCheck={false}
          rows={code.split('\n').length}
        />
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute right-2 bottom-2 h-7 w-7 rounded-full shadow-sm" 
          onClick={handleRun} 
          disabled={isRunning}
        >
          <Play className="h-3 w-3" />
        </Button>
      </div>

      {(result?.output || result?.error || (result?.logs && result.logs.length > 0)) && (
        <div className="border-t bg-muted/5 p-4 font-mono text-xs overflow-x-auto">
          {result.output && <pre className="whitespace-pre-wrap text-foreground">{result.output}</pre>}
          {result.error && <pre className="whitespace-pre-wrap text-destructive mt-1 font-bold">{result.error}</pre>}
          {!result.output && !result.error && result.logs && result.logs.length > 0 && (
            <pre className="whitespace-pre-wrap text-muted-foreground italic">
              {result.logs[result.logs.length - 1]}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
