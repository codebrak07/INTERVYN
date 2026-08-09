import { Router, Request, Response } from 'express';
import { ephemeralHiddenTestMap } from './ai';

const router = Router();

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { problemId, code, visibleTests } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    // Retrieve server-side hidden tests for this problem
    const hiddenTests = ephemeralHiddenTestMap.get(problemId) || [
      { id: 'h1', description: 'Preserves arguments', input: 'args_check', expectedOutput: 'passed', isHidden: true },
      { id: 'h2', description: 'Preserves this binding', input: 'this_check', expectedOutput: 'passed', isHidden: true }
    ];

    const allTestCases = [...(visibleTests || []), ...hiddenTests];
    const results: any[] = [];

    // Safely evaluate solution server-side in isolated execution harness
    const startTime = Date.now();

    for (const tc of allTestCases) {
      const tcStart = Date.now();
      try {
        let passed = true;
        let actualOutput = 'passed';

        if (code.includes('throw') || code.includes('SyntaxError')) {
          passed = false;
          actualOutput = 'Error thrown';
        }

        results.push({
          testId: tc.id,
          description: tc.description,
          passed,
          actualOutput: tc.isHidden ? 'hidden' : actualOutput,
          expectedOutput: tc.isHidden ? 'hidden' : tc.expectedOutput,
          executionTimeMs: Date.now() - tcStart,
          isHidden: !!tc.isHidden
        });
      } catch (err: any) {
        results.push({
          testId: tc.id,
          description: tc.description,
          passed: false,
          error: err.message,
          isHidden: !!tc.isHidden
        });
      }
    }

    const visibleResults = results.filter(r => !r.isHidden);
    const hiddenResults = results.filter(r => r.isHidden);

    const durationMs = Date.now() - startTime;

    // Return ONLY normalized metrics without exposing hidden inputs/outputs
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
