const vm = require('vm');

class TestExecutor {
  async runTests(code, testCases) {
    const results = [];
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const output = await this.executeCode(code, testCase.input);
        const endTime = Date.now();
        
        const passed = this.compareOutput(output, testCase.expectedOutput);
        
        results.push({
          testCase: testCase.input,
          expected: testCase.expectedOutput,
          actual: output,
          passed,
          executionTime: endTime - startTime,
          error: null
        });
      } catch (error) {
        results.push({
          testCase: testCase.input,
          expected: testCase.expectedOutput,
          actual: null,
          passed: false,
          executionTime: Date.now() - startTime,
          error: error.message
        });
      }
    }
    
    return {
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      }
    };
  }

  async executeCode(code, input) {
    return new Promise((resolve, reject) => {
      try {
        // Create a sandboxed environment
        const sandbox = {
          console: {
            log: (...args) => {
              this.output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ');
            }
          },
          input: input,
          result: null
        };
        
        // Wrap code to capture return value
        const wrappedCode = `
          ${code}
          result = (function() {
            if (typeof main === 'function') return main(${input});
            if (typeof run === 'function') return run(${input});
            return null;
          })();
        `;
        
        const script = new vm.Script(wrappedCode);
        const context = vm.createContext(sandbox);
        script.runInContext(context);
        
        resolve(sandbox.result || sandbox.output || '');
      } catch (error) {
        reject(error);
      }
    });
  }

  compareOutput(actual, expected) {
    // Normalize both outputs for comparison
    const normalizedActual = String(actual).trim();
    const normalizedExpected = String(expected).trim();
    
    return normalizedActual === normalizedExpected;
  }
}

module.exports = TestExecutor;