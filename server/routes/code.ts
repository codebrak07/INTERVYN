import { Router, Request, Response } from 'express';
import vm from 'vm';
import { ephemeralHiddenTestMap } from './ai';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', provider: 'server-isolated-vm' });
});

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { problemId, code, visibleTests } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    // Retrieve server-side hidden tests for this problem
    const hiddenTests = ephemeralHiddenTestMap.get(problemId) || [];
    const allTestCases = [...(visibleTests || []), ...hiddenTests];
    const results: any[] = [];
    const startTime = Date.now();

    for (const tc of allTestCases) {
      const tcStart = Date.now();
      try {
        const sandbox: any = { console: { log: () => {} } };
        vm.createContext(sandbox);

        const script = new vm.Script(`
          ${code}
          const fnMatches = code.match(/function\\s+([a-zA-Z0-9_]+)/g);
          let targetName = 'solution';
          if (fnMatches && fnMatches.length > 0) {
            targetName = fnMatches[fnMatches.length - 1].replace('function', '').trim();
          }
          let fn = eval(targetName);
          if (typeof fn !== 'function' && typeof solution === 'function') fn = solution;
          if (typeof fn !== 'function' && typeof debounce === 'function') fn = debounce;
          __targetFn = fn;
        `);

        script.runInContext(sandbox, { timeout: 1000 });

        if (typeof sandbox.__targetFn !== 'function') {
          throw new Error('No target function exported or defined in script.');
        }

        let parsedInput;
        try {
          parsedInput = JSON.parse(tc.input);
        } catch {
          parsedInput = tc.input;
        }

        const actualVal = Array.isArray(parsedInput)
          ? sandbox.__targetFn(...parsedInput)
          : sandbox.__targetFn(parsedInput);

        const actualStr = typeof actualVal === 'object' && actualVal !== null
          ? JSON.stringify(actualVal)
          : String(actualVal);

        const passed = actualStr.trim() === String(tc.expectedOutput).trim();

        results.push({
          testId: tc.id,
          description: tc.description,
          passed,
          actualOutput: tc.isHidden ? 'hidden' : actualStr,
          expectedOutput: tc.isHidden ? 'hidden' : tc.expectedOutput,
          executionTimeMs: Date.now() - tcStart,
          isHidden: !!tc.isHidden
        });
      } catch (err: any) {
        results.push({
          testId: tc.id,
          description: tc.description,
          passed: false,
          actualOutput: tc.isHidden ? 'hidden' : ('Runtime Error: ' + err.message),
          expectedOutput: tc.isHidden ? 'hidden' : tc.expectedOutput,
          error: err.message,
          executionTimeMs: Date.now() - tcStart,
          isHidden: !!tc.isHidden
        });
      }
    }

    const visibleResults = results.filter(r => !r.isHidden);
    const hiddenResults = results.filter(r => r.isHidden);
    const durationMs = Date.now() - startTime;

    return res.json({
      metrics: {
        visible: {
          passed: visibleResults.filter(r => r.passed).length,
          total: visibleResults.length
        },
        hidden: {
          passed: hiddenResults.filter(r => r.passed).length,
          total: hiddenResults.length
        },
        runtimeMs: durationMs
      },
      results
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Code execution error: ' + err.message });
  }
});

export default router;
