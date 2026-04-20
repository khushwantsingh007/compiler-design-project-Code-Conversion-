import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { JSONTree } from 'react-json-tree';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [jsCode, setJsCode] = useState(`// Write your JavaScript code here
function calculateSum(a, b) {
  const result = a + b;
  return result;
}

function main() {
  const x = 10;
  const y = 20;
  const sum = calculateSum(x, y);
  console.log("Sum is: " + sum);
  return sum;
}`);
  
  const [tsCode, setTsCode] = useState('');
  const [astData, setAstData] = useState(null);
  const [symbolTable, setSymbolTable] = useState([]);
  const [irData, setIrData] = useState([]);
  const [cfgData, setCfgData] = useState(null);
  const [testCases, setTestCases] = useState([
    { id: 1, input: '5,10', expectedOutput: '15' }
  ]);
  const [testResults, setTestResults] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('output');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, { code: jsCode });
      
      if (response.data.success) {
        setTsCode(response.data.tsCode);
        setAstData(response.data.ast);
        setSymbolTable(response.data.semanticInfo.symbolTable);
        setIrData(response.data.ir);
        setCfgData(response.data.cfg);
        toast.success('Code converted successfully!');
      } else {
        toast.error(`Conversion failed: ${response.data.error}`);
      }
    } catch (error) {
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/optimize`, { 
        code: jsCode,
        ast: astData 
      });
      
      setOptimizationResult(response.data);
      toast.success(`Optimization complete! ${response.data.optimizationsApplied.length} optimizations applied.`);
    } catch (error) {
      toast.error('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/run-tests`, { 
        code: jsCode,
        testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
      });
      
      setTestResults(response.data);
      const passedCount = response.data.summary.passed;
      const totalCount = response.data.summary.total;
      
      if (passedCount === totalCount) {
        toast.success(`All ${totalCount} tests passed!`);
      } else {
        toast.error(`${passedCount}/${totalCount} tests passed`);
      }
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([tsCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.ts';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const addTestCase = () => {
    const newId = Math.max(...testCases.map(tc => tc.id), 0) + 1;
    setTestCases([...testCases, { id: newId, input: '', expectedOutput: '' }]);
  };

  const updateTestCase = (id, field, value) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const removeTestCase = (id) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Toaster position="top-right" />
      
      <div className="header">
        <h1>🔧 CodeMorph Lite</h1>
        <div className="header-controls">
          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={handleConvert} disabled={loading} className="btn-primary">
            {loading ? 'Converting...' : 'Convert to TS'}
          </button>
          <button onClick={handleOptimize} disabled={loading} className="btn-secondary">
            Optimize
          </button>
          <button onClick={handleRunTests} disabled={loading} className="btn-secondary">
            Run Tests
          </button>
          <button onClick={handleDownload} disabled={!tsCode} className="btn-secondary">
            Download TS
          </button>
        </div>
      </div>

      <div className="main-container">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>📝 JavaScript Input</h3>
          </div>
          <MonacoEditor
            height="400px"
            language="javascript"
            theme={darkMode ? 'vs-dark' : 'light'}
            value={jsCode}
            onChange={(value) => setJsCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true
            }}
          />
        </div>

        <div className="editor-panel">
          <div className="panel-header">
            <h3>📘 TypeScript Output</h3>
          </div>
          <MonacoEditor
            height="400px"
            language="typescript"
            theme={darkMode ? 'vs-dark' : 'light'}
            value={tsCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14
            }}
          />
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'output' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('output')}>
          📊 Compiler Output
        </button>
        <button className={activeTab === 'tests' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('tests')}>
          🧪 Test Cases
        </button>
        <button className={activeTab === 'optimization' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('optimization')}>
          ⚡ Optimization
        </button>
      </div>

      <div className="output-container">
        {activeTab === 'output' && (
          <div className="output-grid">
            <div className="output-card">
              <h4>🌳 AST (Abstract Syntax Tree)</h4>
              <div className="json-viewer">
                {astData && <JSONTree data={astData} theme={darkMode ? 'monokai' : 'light'} />}
              </div>
            </div>

            <div className="output-card">
              <h4>📋 Symbol Table</h4>
              <table className="symbol-table">
                <thead>
                  <tr><th>Identifier</th><th>Type</th><th>Scope</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {symbolTable.map((symbol, idx) => (
                    <tr key={idx}>
                      <td>{symbol.identifier}</td>
                      <td>{symbol.type}</td>
                      <td>{symbol.scope}</td>
                      <td>{symbol.value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="output-card">
              <h4>🔧 Intermediate Representation (IR)</h4>
              <pre className="code-block">{irData.join('\n')}</pre>
            </div>

            <div className="output-card">
              <h4>📊 Control Flow Graph (CFG)</h4>
              <pre className="code-block">
                {cfgData && cfgData.nodes.map(node => 
                  `Node ${node.id}: ${node.label}${node.details ? ` (${node.details})` : ''}`
                ).join('\n')}
                {'\n\nEdges:\n'}
                {cfgData && cfgData.edges.map(edge => 
                  `${edge.from} -> ${edge.to}`
                ).join('\n')}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="tests-container">
            <div className="test-cases">
              <h4>📝 Test Cases</h4>
              {testCases.map((tc) => (
                <div key={tc.id} className="test-case">
                  <input
                    type="text"
                    placeholder="Input (e.g., 5,10)"
                    value={tc.input}
                    onChange={(e) => updateTestCase(tc.id, 'input', e.target.value)}
                    className="test-input"
                  />
                  <input
                    type="text"
                    placeholder="Expected Output"
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(tc.id, 'expectedOutput', e.target.value)}
                    className="test-input"
                  />
                  <button onClick={() => removeTestCase(tc.id)} className="btn-danger">
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addTestCase} className="btn-secondary">
                + Add Test Case
              </button>
            </div>

            {testResults && (
              <div className="test-results">
                <h4>📊 Test Results</h4>
                <div className="summary">
                  <span>Total: {testResults.summary.total}</span>
                  <span className="passed">Passed: {testResults.summary.passed}</span>
                  <span className="failed">Failed: {testResults.summary.failed}</span>
                </div>
                {testResults.results.map((result, idx) => (
                  <div key={idx} className={`result-item ${result.passed ? 'passed' : 'failed'}`}>
                    <div className="result-header">
                      <strong>Test {idx + 1}</strong>
                      <span>{result.passed ? '✅ PASSED' : '❌ FAILED'}</span>
                    </div>
                    <div>Input: {result.testCase}</div>
                    <div>Expected: {result.expected}</div>
                    <div>Actual: {result.actual || result.error || 'No output'}</div>
                    <div>Time: {result.executionTime}ms</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimization' && optimizationResult && (
          <div className="optimization-container">
            <div className="optimization-stats">
              <h4>Optimization Statistics</h4>
              <div>Original Size: {optimizationResult.stats.originalSize} bytes</div>
              <div>Optimized Size: {optimizationResult.stats.optimizedSize} bytes</div>
              <div>Reduction: {optimizationResult.stats.reduction}%</div>
              <div>Optimizations Applied: {optimizationResult.optimizationsApplied.join(', ')}</div>
            </div>
            
            <div className="code-comparison">
              <div className="code-column">
                <h4>Original Code</h4>
                <pre className="code-block">{optimizationResult.original}</pre>
              </div>
              <div className="code-column">
                <h4>Optimized Code</h4>
                <pre className="code-block">{optimizationResult.optimized}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;