import { LipsInterpreter } from './lips';
import type { Interpreter } from './types';

const instances: Record<string, Interpreter> = {};

export async function getInterpreter(lang: string): Promise<Interpreter> {
  const normalizedLang = lang.toLowerCase();
  if (normalizedLang === 'scheme' || normalizedLang === 'lisp') {
    if (!instances.scheme) {
      instances.scheme = new LipsInterpreter();
      await instances.scheme.init();
    }
    return instances.scheme;
  }
  throw new Error(`Unsupported language: ${lang}`);
}
