import React, { useState, useEffect } from 'react';
import { InteractiveCell } from './InteractiveCell';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { readFile, saveFile } from "@/lib/persistence/opfs";

export const BottomPlayground: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [code, setCode] = useState('(+ 1 2 3)');

  useEffect(() => {
    readFile('playground.scm').then(content => {
      if (content) setCode(content);
    });
  }, []);

  const handleSave = (newCode: string) => {
    setCode(newCode);
    saveFile('playground.scm', newCode).catch(console.error);
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 shadow-lg gap-2 z-50 bg-background"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
      >
        <Terminal className="h-4 w-4" />
        Playground
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl transition-all duration-300 ease-in-out",
      isMinimized ? "h-12" : "h-[450px]"
    )}>
      <div className="flex items-center justify-between px-4 h-12 border-b cursor-pointer hover:bg-muted/30" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Interactive Playground (Scheme)</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-4 overflow-auto h-[400px]">
          <div className="max-w-4xl mx-auto">
            <InteractiveCell 
              initialCode={code} 
              language="scheme" 
              onSave={handleSave}
              className="my-0 border-none shadow-none bg-muted/20"
            />
            <div className="mt-4 text-[10px] text-muted-foreground text-center">
              Your code is automatically saved to local storage (OPFS).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
