/**
 * Semantic Analysis
 * Type inference and type checking
 */
class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new Map();
    this.currentScope = null;
    this.scopes = [];
  }

  analyze(ast) {
    this.symbolTable.clear();
    this.scopes = [];
    this.currentScope = null;
    this.enterScope('global');
    
    this.traverse(ast);
    this.exitScope();
    
    return {
      symbolTable: this.getSymbolTableDisplay(),
      typeInfo: this.inferTypes(ast)
    };
  }

  enterScope(name) {
    const scope = {
      name,
      symbols: new Map(),
      parent: this.currentScope
    };
    this.scopes.push(scope);
    this.currentScope = scope;
  }

  exitScope() {
    this.scopes.pop();
    this.currentScope = this.scopes[this.scopes.length - 1] || null;
  }

  addSymbol(name, type, value = null) {
    if (this.currentScope && !this.currentScope.symbols.has(name)) {
      this.currentScope.symbols.set(name, { type, value, scope: this.currentScope.name });
      this.symbolTable.set(`${this.currentScope.name}:${name}`, { type, value });
    }
  }

  getSymbolTableDisplay() {
    const display = [];
    for (const [key, value] of this.symbolTable) {
      display.push({
        identifier: key.split(':')[1],
        type: value.type,
        scope: key.split(':')[0],
        value: value.value
      });
    }
    return display;
  }

  traverse(node) {
    if (!node) return;
    
    switch (node.type) {
      case 'File':
        this.traverse(node.program);
        break;
      case 'VariableDeclaration':
        this.handleVariableDeclaration(node);
        break;
      case 'FunctionDeclaration':
        this.handleFunctionDeclaration(node);
        break;
      case 'Program':
        node.body.forEach(child => this.traverse(child));
        break;
      default:
        if (node.body && Array.isArray(node.body)) {
          node.body.forEach(child => this.traverse(child));
        } else if (node.body) {
          this.traverse(node.body);
        }
    }
  }

  handleVariableDeclaration(node) {
    node.declarations.forEach(decl => {
      let type = 'any';
      if (decl.init) {
        type = this.inferTypeFromNode(decl.init);
      }
      this.addSymbol(decl.id.name, type, decl.init?.value);
    });
  }

  handleFunctionDeclaration(node) {
    this.addSymbol(node.id.name, 'function');
    this.enterScope(node.id.name);
    node.params.forEach(param => {
      this.addSymbol(param.name, 'any');
    });
    this.traverse(node.body);
    this.exitScope();
  }

  inferTypeFromNode(node) {
    switch (node.type) {
      case 'NumericLiteral':
        return 'number';
      case 'StringLiteral':
        return 'string';
      case 'BooleanLiteral':
        return 'boolean';
      case 'ArrayExpression':
        return 'array';
      case 'ObjectExpression':
        return 'object';
      case 'FunctionExpression':
        return 'function';
      default:
        return 'any';
    }
  }

  inferTypes(ast) {
    const types = new Map();
    this.collectTypes(ast, types);
    return Object.fromEntries(types);
  }

  collectTypes(node, types) {
    if (node.type === 'File') {
      this.collectTypes(node.program, types);
      return;
    }
    
    if (node.type === 'VariableDeclarator' && node.init) {
      types.set(node.id.name, this.inferTypeFromNode(node.init));
    }
    
    if (node.body && Array.isArray(node.body)) {
      node.body.forEach(child => this.collectTypes(child, types));
    } else if (node.body) {
      this.collectTypes(node.body, types);
    }
  }
}

module.exports = SemanticAnalyzer;