import { TestCase, TestResult, CodeExecutionRequest, CodeExecutionResponse } from '../../types';

export interface CodeExecutionProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  execute(req: CodeExecutionRequest): Promise<CodeExecutionResponse>;
}

export class WebWorkerExecutionProvider implements CodeExecutionProvider {
  name = 'In-Browser Isolated Web Worker';

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof Worker !== 'undefined';
  }

  async execute(req: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    const { source, testCases, timeoutMs = 2000 } = req;
    const startTime = performance.now();

    // 1. Source Size Limit Check (50 KB cap)
    const MAX_SOURCE_BYTES = 50 * 1024;
    if (source.length > MAX_SOURCE_BYTES) {
      return {
        results: testCases.map(tc => ({
          testId: tc.id,
          description: tc.description,
          passed: false,
          actualOutput: `Source code size (${Math.round(source.length / 1024)} KB) exceeds 50 KB limit.`,
          expectedOutput: tc.expectedOutput,
          error: 'SOURCE_LIMIT: Code submission exceeds maximum 50 KB size limit.',
          executionTimeMs: 0,
          isHidden: tc.isHidden
        })),
        executionTimeMs: 0,
        error: 'SOURCE_LIMIT: Code submission exceeds maximum 50 KB size limit.'
      };
    }

    // Web Worker script running untrusted code and evaluating actual test inputs against outputs
    const workerScript = `
      self.onmessage = function(e) {
        const { code, testCases } = e.data;
        const results = [];
        let targetFn = null;

        try {
          // Extract primary target function or evaluate exported script
          const fnMatcher = code.match(/function\\s+([a-zA-Z0-9_]+)/g);
          let mainFnName = 'solution';
          if (fnMatcher && fnMatcher.length > 0) {
            mainFnName = fnMatcher[fnMatcher.length - 1].replace('function', '').trim();
          }

          const evaluator = new Function('code', \`
            \${code}
            if (typeof \${mainFnName} !== 'undefined') return \${mainFnName};
            if (typeof solution !== 'undefined') return solution;
            if (typeof twoSum !== 'undefined') return twoSum;
            if (typeof debounce !== 'undefined') return debounce;
            return null;
          \`);

          targetFn = evaluator(code);

          if (!targetFn || typeof targetFn !== 'function') {
            throw new Error('No valid target function definition found in submission.');
          }
        } catch (err) {
          self.postMessage({ compilationError: 'SYNTAX ERROR: ' + err.message });
          return;
        }

        for (const tc of testCases) {
          const tcStart = performance.now();
          try {
            let parsedInput;
            try {
              parsedInput = JSON.parse(tc.input);
            } catch (pErr) {
              parsedInput = tc.input;
            }

            let actualVal;
            if (Array.isArray(parsedInput)) {
              actualVal = targetFn(...parsedInput);
            } else {
              actualVal = targetFn(parsedInput);
            }

            let actualStr = '';
            if (typeof actualVal === 'object' && actualVal !== null) {
              actualStr = JSON.stringify(actualVal);
            } else {
              actualStr = String(actualVal);
            }

            // Cap actual output string length at 10 KB
            const MAX_OUTPUT_BYTES = 10 * 1024;
            if (actualStr.length > MAX_OUTPUT_BYTES) {
              actualStr = actualStr.slice(0, MAX_OUTPUT_BYTES) + '... (OUTPUT LIMIT EXCEEDED)';
            }

            const expectedClean = String(tc.expectedOutput).trim();
            const actualClean = actualStr.trim();
            const passed = actualClean === expectedClean;

            results.push({
              testId: tc.id,
              description: tc.description,
              passed: passed,
              actualOutput: actualStr,
              expectedOutput: tc.expectedOutput,
              executionTimeMs: Math.round(performance.now() - tcStart),
              isHidden: !!tc.isHidden
            });
          } catch (execErr) {
            results.push({
              testId: tc.id,
              description: tc.description,
              passed: false,
              actualOutput: 'RUNTIME ERROR: ' + execErr.message,
              expectedOutput: tc.expectedOutput,
              error: execErr.message,
              executionTimeMs: Math.round(performance.now() - tcStart),
              isHidden: !!tc.isHidden
            });
          }
        }

        self.postMessage({ results });
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const worker = new Worker(workerUrl);
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          const duration = Math.round(performance.now() - startTime);

          resolve({
            results: testCases.map(tc => ({
              testId: tc.id,
              description: tc.description,
              passed: false,
              actualOutput: `Execution timed out (> ${timeoutMs}ms limit)`,
              expectedOutput: tc.expectedOutput,
              error: `Timeout: limit of ${timeoutMs}ms exceeded`,
              executionTimeMs: timeoutMs,
              isHidden: tc.isHidden
            })),
            executionTimeMs: duration,
            runtimeError: `Execution timed out (> ${timeoutMs}ms limit)`
          });
        }
      }, timeoutMs);

      worker.onmessage = (e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);

          const duration = Math.round(performance.now() - startTime);

          if (e.data.compilationError) {
            resolve({
              results: testCases.map(tc => ({
                testId: tc.id,
                description: tc.description,
                passed: false,
                actualOutput: e.data.compilationError,
                expectedOutput: tc.expectedOutput,
                error: e.data.compilationError,
                executionTimeMs: duration,
                isHidden: tc.isHidden
              })),
              executionTimeMs: duration,
              compilationError: e.data.compilationError
            });
          } else {
            resolve({
              results: e.data.results || [],
              executionTimeMs: duration
            });
          }
        }
      };

      worker.onerror = (wErr) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);

          const duration = Math.round(performance.now() - startTime);

          resolve({
            results: testCases.map(tc => ({
              testId: tc.id,
              description: tc.description,
              passed: false,
              actualOutput: 'Worker Error: ' + wErr.message,
              expectedOutput: tc.expectedOutput,
              error: wErr.message,
              executionTimeMs: duration,
              isHidden: tc.isHidden
            })),
            executionTimeMs: duration,
            runtimeError: wErr.message
          });
        }
      };

      worker.postMessage({ code: source, testCases });
    });
  }
}

export class ServerExecutionProvider implements CodeExecutionProvider {
  name = 'Isolated Server Execution Harness';

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch('/api/code/health', { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async execute(req: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    const res = await fetch('/api/code/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: req.source,
        visibleTests: req.testCases
      })
    });

    if (!res.ok) {
      throw new Error(`Server execution error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      results: data.results || [],
      executionTimeMs: data.metrics?.runtimeMs || 0,
      error: data.error
    };
  }
}

export class FallbackExecutionProvider implements CodeExecutionProvider {
  name = 'Honest Fallback Provider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(req: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    return {
      results: req.testCases.map(tc => ({
        testId: tc.id,
        description: tc.description,
        passed: false,
        actualOutput: 'Code execution unavailable',
        expectedOutput: tc.expectedOutput,
        error: 'No active execution environment available',
        isHidden: tc.isHidden
      })),
      executionTimeMs: 0,
      error: 'Code execution unavailable. System cannot execute code safely.'
    };
  }
}
