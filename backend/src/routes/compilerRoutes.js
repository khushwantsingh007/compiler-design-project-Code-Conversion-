const express = require('express');
const router = express.Router();
const CodeMorphCompiler = require('../compiler');
const TestExecutor = require('../executor/testExecutor');

const compiler = new CodeMorphCompiler();
const executor = new TestExecutor();

// Store test cases temporarily (in-memory)
let testCases = [];

router.post('/convert', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const result = compiler.compile(code);
  res.json(result);
});

router.post('/optimize', (req, res) => {
  const { code, ast } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const result = compiler.optimize(code, ast);
  res.json(result);
});

router.post('/run-tests', async (req, res) => {
  const { code, testCases: requestTestCases } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const testsToRun = requestTestCases || testCases;
  
  if (testsToRun.length === 0) {
    return res.status(400).json({ error: 'No test cases defined' });
  }
  
  const results = await executor.runTests(code, testsToRun);
  res.json(results);
});

router.post('/test-cases', (req, res) => {
  const { testCases: newTestCases } = req.body;
  
  if (newTestCases) {
    testCases = newTestCases;
  }
  
  res.json({ testCases });
});

module.exports = router;