import React, { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from "codemirror";
import { StreamLanguage } from "@codemirror/language";
import { scheme } from "@codemirror/legacy-modes/mode/scheme";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { getInterpreter } from "@/lib/interpreters/factory";
import { logStore } from "@/lib/interpreters/store";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { oneDark } from "@codemirror/theme-one-dark";

interface InteractiveCellProps {
  initialCode: string;
  language: string;
  className?: string;
  onSave?: (code: string) => void;
}

export const InteractiveCell: React.FC<InteractiveCellProps> = ({ initialCode, language, className, onSave }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [result, setResult] = useState<{output?: string, error?: string} | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorView.create({
      doc: initialCode.trim(),
      extensions: [
        basicSetup,
        StreamLanguage.define(scheme),
        oneDark,
        keymap.of([
          indentWithTab,
          {
            key: "Mod-Enter",
            run: () => { handleRun(); return true; }
          }
        ]),
        EditorView.theme({
          "&": { height: "auto", minHeight: "80px", fontSize: "13px" },
          ".cm-scroller": { overflow: "auto", borderRadius: "8px" },
          ".cm-content": { fontFamily: "var(--font-mono)", padding: "10px 0" },
          "&.cm-focused": { outline: "none" }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });
    viewRef.current = view;

    return () => view.destroy();
  }, [initialCode]);

  const handleRun = async () => {
    const code = viewRef.current?.state.doc.toString() || "";
    setIsRunning(true);
    if (onSave) onSave(code);
    const interpreter = await getInterpreter(language);
    try {
      const res = await interpreter.eval(code);
      setResult({ output: res.output });
      logStore.addLog({ type: 'success', message: `[${language}] ${res.output}` });
    } catch (e: any) {
      setResult({ error: e.message });
      logStore.addLog({ type: 'error', message: `[${language}] ${e.message}` });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={cn("glass rounded-xl my-6 overflow-hidden shadow-sm hover:shadow-md transition-all", className)}>
      <div className="px-4 py-2 border-b border-white/20 bg-white/10 flex justify-between items-center">
        <span className="text-xs font-mono uppercase opacity-60">{language}</span>
        <button onClick={handleRun} disabled={isRunning} className="hover:text-primary transition-colors cursor-pointer">
          {isRunning ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
        </button>
      </div>
      <div ref={editorRef} className="p-2" />
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="border-t border-white/10 bg-black/5 p-4 font-mono text-xs overflow-hidden"
          >
            {result.output && <div className="text-emerald-700 whitespace-pre-wrap">{result.output}</div>}
            {result.error && <div className="text-rose-700 whitespace-pre-wrap">{result.error}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
