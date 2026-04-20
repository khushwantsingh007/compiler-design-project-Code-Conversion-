/**
 * Code Optimizer
 * Implements Dead Code Elimination, Constant Folding, and Unused Variable Removal
 */
class Optimizer {
  optimize(code, ast) {
    const originalCode = code;
    let optimizedCode = code;
    const optimizations = [];
    
    // 1. Constant Folding
    const foldedCode = this.constantFolding(code);
    if (foldedCode !== code) {
      optimizations.push('Constant Folding applied');
      optimizedCode = foldedCode;
    }
    
    // 2. Dead Code Elimination
    const deadCodeRemoved = this.deadCodeElimination(optimizedCode);
    if (deadCodeRemoved !== optimizedCode) {
      optimizations.push('Dead Code Elimination applied');
      optimizedCode = deadCodeRemoved;
    }
    
    // 3. Remove Unused Variables
    const unusedRemoved = this.removeUnusedVariables(optimizedCode, ast);
    if (unusedRemoved !== optimizedCode) {
      optimizations.push('Unused Variables removed');
      optimizedCode = unusedRemoved;
    }
    
    return {
      original: originalCode,
      optimized: optimizedCode,
      optimizationsApplied: optimizations,
      stats: {
        originalSize: originalCode.length,
        optimizedSize: optimizedCode.length,
        reduction: ((originalCode.length - optimizedCode.length) / originalCode.length * 100).toFixed(2)
      }
    };
  }

  constantFolding(code) {
    // Fold constant expressions like 2 + 3 -> 5
    let folded = code;
    
    // Handle numeric operations
    const patterns = [
      { regex: /(\d+)\s*\+\s*(\d+)/g, evaluate: (a, b) => a + b },
      { regex: /(\d+)\s*-\s*(\d+)/g, evaluate: (a, b) => a - b },
      { regex: /(\d+)\s*\*\s*(\d+)/g, evaluate: (a, b) => a * b },
      { regex: /(\d+)\s*\/\s*(\d+)/g, evaluate: (a, b) => Math.floor(a / b) }
    ];
    
    patterns.forEach(pattern => {
      folded = folded.replace(pattern.regex, (match, a, b) => {
        return pattern.evaluate(parseInt(a), parseInt(b));
      });
    });
    
    return folded;
  }

  deadCodeElimination(code) {
    // Remove unreachable code after return statements
    const lines = code.split('\n');
    const filteredLines = [];
    let unreachable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (unreachable && !line.includes('function') && !line.includes('if')) {
        continue; // Skip unreachable code
      }
      
      filteredLines.push(line);
      
      if (line.includes('return') && !line.includes('function')) {
        unreachable = true;
      } else if (line.includes('function') || line.includes('if')) {
        unreachable = false;
      }
    }
    
    return filteredLines.join('\n');
  }

  removeUnusedVariables(code, ast) {
    const usedVariables = new Set();
    
    // Find all used variables (simplified)
    const varUsageRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;
    while ((match = varUsageRegex.exec(code)) !== null) {
      if (!this.isKeyword(match[1])) {
        usedVariables.add(match[1]);
      }
    }
    
    // Remove declarations of unused variables
    const lines = code.split('\n');
    const filteredLines = lines.filter(line => {
      const declarationMatch = line.match(/(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (declarationMatch) {
        const varName = declarationMatch[1];
        return usedVariables.has(varName);
      }
      return true;
    });
    
    return filteredLines.join('\n');
  }

  isKeyword(word) {
    const keywords = ['let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while'];
    return keywords.includes(word);
  }
}

module.exports = Optimizer;