import { TestCase, TestResult, CodeExecutionResponse } from '../../types';
import {
  CodeExecutionProvider,
  WebWorkerExecutionProvider,
  ServerExecutionProvider,
  FallbackExecutionProvider,
} from './CodeExecutionProvider';

export class CodeExecutionService {
  private static workerProvider: CodeExecutionProvider = new WebWorkerExecutionProvider();
  private static serverProvider: CodeExecutionProvider = new ServerExecutionProvider();
  private static fallbackProvider: CodeExecutionProvider = new FallbackExecutionProvider();

  /**
   * Executes JavaScript/TypeScript code against provided test cases using active Execution Provider.
   */
  static async executeCode(
    userCode: string,
    testCases: TestCase[],
    timeLimitMs: number = 2000
  ): Promise<CodeExecutionResponse> {
    try {
      if (await this.workerProvider.isAvailable()) {
        return await this.workerProvider.execute({
          language: 'javascript',
          source: userCode,
          testCases,
          timeoutMs: timeLimitMs,
        });
      }

      if (await this.serverProvider.isAvailable()) {
        return await this.serverProvider.execute({
          language: 'javascript',
          source: userCode,
          testCases,
          timeoutMs: timeLimitMs,
        });
      }
    } catch (err: any) {
      console.warn('Execution provider failed, using fallback:', err);
    }

    return await this.fallbackProvider.execute({
      language: 'javascript',
      source: userCode,
      testCases,
      timeoutMs: timeLimitMs,
    });
  }
}
