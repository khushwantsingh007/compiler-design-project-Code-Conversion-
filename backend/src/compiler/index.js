const Lexer = require('./lexer');
const Parser = require('./parser');
const SemanticAnalyzer = require('./semantic');
const IRGenerator = require('./ir');
const CodeGenerator = require('./codeGenerator');
const Optimizer = require('./optimizer');
const CFGenerator = require('./cfg');

class CodeMorphCompiler {
  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.irGenerator = new IRGenerator();
    this.codeGenerator = new CodeGenerator();
    this.optimizer = new Optimizer();
    this.cfGenerator = new CFGenerator();
  }

  compile(jsCode) {
    try {
      // Phase 1: Lexical Analysis
      const tokens = this.lexer.tokenize(jsCode);
      
      // Phase 2: Syntax Analysis
      const ast = this.parser.parse(jsCode);
      
      // Phase 3: Semantic Analysis
      const semanticInfo = this.semanticAnalyzer.analyze(ast);
      
      // Phase 4: Intermediate Representation
      const ir = this.irGenerator.generate(ast);
      
      // Phase 5: Control Flow Graph
      const cfg = this.cfGenerator.generate(ir);
      
      // Phase 6: Code Generation
      const tsCode = this.codeGenerator.generateTypeScript(ast, semanticInfo.typeInfo);
      
      return {
        success: true,
        tokens,
        ast: this.parser.generateASTVisualization(ast),
        semanticInfo,
        ir: this.irGenerator.getIRVisualization(),
        cfg,
        tsCode,
        originalCode: jsCode
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  optimize(jsCode, ast) {
    return this.optimizer.optimize(jsCode, ast);
  }
}

module.exports = CodeMorphCompiler;