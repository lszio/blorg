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
    this.lips = lipsModule;
  }

  async eval(code: string): Promise<EvaluationResult> {
    if (!this.lips) await this.init();

    const output: string[] = [];
    
    // In LIPS, we can create a custom output port
    const originalStdout = this.lips.env.get('current-output-port');
    
    try {
      // Create a custom port to capture output from (display ...) or (print ...)
      const port = new this.lips.OutputPort((chunk: string) => {
        output.push(chunk);
      });
      
      // We might need to set the current output port in the environment
      // But for simple exec, lips often uses the global env
      
      const results = await this.lips.exec(code);
      const lastResult = results[results.length - 1];
      
      return {
        output: output.join('') || (lastResult !== undefined ? this.lips.repr(lastResult) : ""),
        logs: results.map((r: any) => this.lips.repr(r))
      };
    } catch (e: any) {
      return {
        output: output.join(''),
        error: e.message || String(e)
      };
    }
  }
}
