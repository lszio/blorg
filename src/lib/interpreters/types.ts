export interface EvaluationResult {
  output: string;
  error?: string;
  logs?: string[];
}

export interface Interpreter {
  id: string;
  name: string;
  language: string;
  init(): Promise<void>;
  eval(code: string): Promise<EvaluationResult>;
  reset?(): Promise<void>;
}

export type InterpreterFactory = (lang: string) => Promise<Interpreter>;
