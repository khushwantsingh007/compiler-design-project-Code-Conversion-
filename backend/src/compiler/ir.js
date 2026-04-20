/**
 * Intermediate Representation (IR)
 * Three-Address Code generation
 */
class IRGenerator {
  constructor() {
    this.instructions = [];
    this.tempCounter = 0;
  }

  generate(ast) {
    this.instructions = [];
    this.tempCounter = 0;
    this.generateFromNode(ast);
    return this.instructions;
  }

  generateFromNode(node) {
    if (!node) return null;
    
    switch (node.type) {
      case 'File':
        this.generateFromNode(node.program);
        break;
        
      case 'Program':
        node.body.forEach(child => this.generateFromNode(child));
        break;
        
      case 'VariableDeclaration':
        node.declarations.forEach(decl => {
          if (decl.init) {
            const value = this.generateFromNode(decl.init);
            this.addInstruction('=', decl.id.name, value);
          }
        });
        break;
        
      case 'NumericLiteral':
        return node.value;
        
      case 'StringLiteral':
        return `"${node.value}"`;
        
      case 'BinaryExpression':
        const left = this.generateFromNode(node.left);
        const right = this.generateFromNode(node.right);
        const temp = this.newTemp();
        this.addInstruction(node.operator, temp, left, right);
        return temp;
        
      case 'FunctionDeclaration':
        this.addInstruction('func', node.id.name);
        if (node.body.body) {
          node.body.body.forEach(child => this.generateFromNode(child));
        }
        this.addInstruction('endfunc');
        break;
        
      case 'ReturnStatement':
        const value = node.argument ? this.generateFromNode(node.argument) : null;
        this.addInstruction('return', value);
        break;
    }
    
    return null;
  }

  newTemp() {
    return `t${this.tempCounter++}`;
  }

  addInstruction(op, result, arg1 = null, arg2 = null) {
    this.instructions.push({
      op,
      result,
      arg1,
      arg2
    });
  }

  getIRVisualization() {
    return this.instructions.map((inst, idx) => {
      if (inst.op === '=') {
        return `${idx}: ${inst.result} = ${inst.arg1}`;
      } else if (inst.op === 'return') {
        return `${idx}: return ${inst.result || 'void'}`;
      } else if (inst.op === 'func') {
        return `${idx}: function ${inst.result}`;
      } else if (inst.op === 'endfunc') {
        return `${idx}: end function`;
      } else {
        return `${idx}: ${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
      }
    });
  }
}

module.exports = IRGenerator;