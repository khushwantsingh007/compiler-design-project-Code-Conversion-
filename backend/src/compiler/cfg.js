/**
 * Control Flow Graph Generation
 */
class CFGenerator {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.nodeCounter = 0;
  }

  generate(ir) {
    this.nodes.clear();
    this.edges = [];
    this.nodeCounter = 0;
    
    let currentNode = this.createNode('entry');
    let prevNode = currentNode;
    
    for (let i = 0; i < ir.length; i++) {
      const instruction = ir[i];
      
      if (instruction.op === 'func') {
        currentNode = this.createNode(`func_${instruction.result}`);
        if (prevNode) this.addEdge(prevNode, currentNode);
        prevNode = currentNode;
      } else if (instruction.op === 'endfunc') {
        currentNode = this.createNode('exit');
        if (prevNode) this.addEdge(prevNode, currentNode);
        prevNode = currentNode;
      } else {
        const node = this.createNode(`${instruction.op}_${i}`, instruction);
        if (prevNode) this.addEdge(prevNode, node);
        prevNode = node;
      }
    }
    
    return this.getCFGVisualization();
  }

  createNode(label, instruction = null) {
    const id = this.nodeCounter++;
    this.nodes.set(id, { id, label, instruction });
    return id;
  }

  addEdge(from, to) {
    this.edges.push({ from, to });
  }

  getCFGVisualization() {
    return {
      nodes: Array.from(this.nodes.values()).map(node => ({
        id: node.id,
        label: node.label,
        details: node.instruction ? `${node.instruction.op} ${node.instruction.result || ''}` : node.label
      })),
      edges: this.edges
    };
  }
}

module.exports = CFGenerator;