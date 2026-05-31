import type { Interpreter, EvaluationResult } from './types';

export class LipsInterpreter implements Interpreter {
  id = 'lips';
  name = 'LIPS';
  language = 'scheme';
  private lips: any = null;

  async init(): Promise<void> {
    if (this.lips) return;
    // @ts-ignore
    const lipsModule = await import('lips');
    // Handle both default export (common in ESM wrappers) and direct exports
    this.lips = lipsModule.default || lipsModule;
    
    // Some versions of LIPS might need initialization or global setup
    if (this.lips && typeof window !== 'undefined') {
        // Ensure LIPS is available for internal referencing if needed
        (window as any).lips = this.lips;
    }
  }

  async eval(code: string): Promise<EvaluationResult> {
    if (!this.lips) await this.init();

    const output: string[] = [];
    
    try {
      // Create a custom output port to capture (display) and (print) calls
      const port = new this.lips.OutputPort((chunk: string) => {
        output.push(chunk);
      });
      
      // Save current output port to restore it later
      const env = this.lips.env;
      const oldPort = env.get('current-output-port');
      
      // Set the current output port to our custom one
      env.set('current-output-port', port);
      
      try {
        const results = await this.lips.exec(code);
        const lastResult = results[results.length - 1];
        
        let finalOutput = output.join('');
        
        // If nothing was displayed explicitly, show the last return value
        if (finalOutput === "" && lastResult !== undefined) {
          finalOutput = this.lips.repr(lastResult);
        }
        
        return {
          output: finalOutput,
          logs: results.map((r: any) => this.lips.repr(r))
        };
      } finally {
        // Always restore the original port to avoid side effects
        env.set('current-output-port', oldPort);
      }
    } catch (e: any) {
      return {
        output: output.join(''),
        error: e.message || String(e)
      };
    }
  }
}
