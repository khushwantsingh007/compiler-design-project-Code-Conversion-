/**
 * Lexical Analysis (Tokenizer)
 * Converts source code into tokens
 */
class Lexer {
  tokenize(code) {
    const tokens = [];
    const patterns = {
      keyword: /\b(const|let|var|function|return|if|else|for|while|class|export|import|try|catch)\b/,
      type: /\b(number|string|boolean|void|any)\b/,
      identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
      number: /\d+(?:\.\d+)?/,
      string: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
      operator: /[+\-*/%=<>!&|]+/,
      punctuation: /[{}()[\],;:.]/,
      whitespace: /\s+/,
      comment: /\/\/.*|\/\*[\s\S]*?\*\//
    };

    let pos = 0;
    const lines = code.split('\n');

    while (pos < code.length) {
      let matched = false;

      for (const [type, pattern] of Object.entries(patterns)) {
        const match = code.slice(pos).match(pattern);
        if (match && match.index === 0) {
          const value = match[0];
          
          if (type !== 'whitespace') {
            tokens.push({
              type,
              value,
              line: this.getLineNumber(pos, lines)
            });
          }
          
          pos += value.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        throw new Error(`Unexpected character at position ${pos}`);
      }
    }

    return tokens;
  }

  getLineNumber(pos, lines) {
    let lineCount = 1;
    let charCount = 0;
    
    for (const line of lines) {
      if (charCount + line.length >= pos) {
        return lineCount;
      }
      charCount += line.length + 1;
      lineCount++;
    }
    
    return lineCount;
  }
}

module.exports = Lexer;