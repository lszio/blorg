import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvaluationResult, Interpreter } from "@/lib/interpreters/types";

interface TerminalProps {
  interpreter: Interpreter;
  initialCode?: string;
  className?: string;
  onSave?: (code: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  interpreter,
  initialCode = "",
  className,
  onSave
}) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    interpreter.init().then(() => setIsInitializing(false));
  }, [interpreter]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await interpreter.eval(code);
      setResult(res);
      if (onSave) onSave(code);
    } catch (e) {
      setResult({ output: "", error: String(e) });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden bg-background", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {interpreter.name} ({interpreter.language})
        </span>
        <Button 
          size="sm" 
          onClick={handleRun} 
          disabled={isRunning || isInitializing}
          className="h-8 px-3"
        >
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
        <div className="flex-1 p-0">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 md:h-64 p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            placeholder="Type your code here..."
            spellCheck={false}
          />
        </div>
        
        <div className="flex-1 p-4 bg-muted/30 font-mono text-sm overflow-auto max-h-48 md:max-h-64">
          {isInitializing ? (
            <div className="text-muted-foreground italic">Initializing interpreter...</div>
          ) : result ? (
            <>
              {result.output && <div className="text-foreground whitespace-pre-wrap">{result.output}</div>}
              {result.error && <div className="text-destructive whitespace-pre-wrap mt-2">{result.error}</div>}
              {result.logs && result.logs.map((log, i) => (
                <div key={i} className="text-muted-foreground whitespace-pre-wrap">{log}</div>
              ))}
            </>
          ) : (
            <div className="text-muted-foreground italic">Result will appear here...</div>
          )}
        </div>
      </div>
    </div>
  );
};
