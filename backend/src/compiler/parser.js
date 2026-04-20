const parser = require('@babel/parser');

/**
 * Syntax Analysis (Parser)
 * Generates AST from tokens using Babel Parser
 */
class Parser {
  parse(code) {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
      
      return ast;
    } catch (error) {
      throw new Error(`Parse error: ${error.message}`);
    }
  }

  generateASTVisualization(ast) {
    return this.simplifyAST(ast);
  }

  simplifyAST(node, depth = 0) {
    if (depth > 5) return { type: '...' };
    
    const simplified = {
      type: node.type
    };

    if (node.loc) {
      simplified.loc = {
        start: node.loc.start,
        end: node.loc.end
      };
    }

    // Handle common node properties
    if (node.name) simplified.name = node.name;
    if (node.value) simplified.value = node.value;
    
    if (node.program) {
      simplified.program = this.simplifyAST(node.program, depth + 1);
    }
    
    if (node.body && Array.isArray(node.body)) {
      simplified.body = node.body.map(child => this.simplifyAST(child, depth + 1));
    } else if (node.body) {
      simplified.body = this.simplifyAST(node.body, depth + 1);
    }
    
    if (node.declarations) {
      simplified.declarations = node.declarations.map(dec => this.simplifyAST(dec, depth + 1));
    }
    
    if (node.expression) {
      simplified.expression = this.simplifyAST(node.expression, depth + 1);
    }
    
    if (node.arguments) {
      simplified.arguments = node.arguments.map(arg => this.simplifyAST(arg, depth + 1));
    }
    
    if (node.params) {
      simplified.params = node.params.map(param => this.simplifyAST(param, depth + 1));
    }
    
    return simplified;
  }
}

module.exports = Parser;