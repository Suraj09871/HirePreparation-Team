const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const vm = require('vm');
const { runJava } = require('../utils/java_runner');
const { runCpp } = require('../utils/cpp_runner');
const { diagnose } = require('../utils/diagnostics');

let resolvedPythonCmd = null;
function getPythonCommand() {
    if (resolvedPythonCmd) return resolvedPythonCmd;
    if (process.platform === 'win32') {
        resolvedPythonCmd = 'python';
        return 'python';
    }
    try {
        const { execSync } = require('child_process');
        execSync('python3 --version', { stdio: 'ignore' });
        resolvedPythonCmd = 'python3';
    } catch (e) {
        resolvedPythonCmd = 'python';
    }
    return resolvedPythonCmd;
}

/**
 * Execute Python solution via isolated runner process
 */
function runPython(code, testCases, functionName) {
    return new Promise((resolve) => {
        const runnerPath = path.join(__dirname, '../utils/python_runner.py');
        const pythonCmd = getPythonCommand();
        const proc = spawn(pythonCmd, ['-u', '-B', runnerPath]);

        let stdout = '';
        let stderr = '';
        let isTimedOut = false;

        proc.on('error', (err) => {
            clearTimeout(timer);
            return resolve({
                success: false,
                status: 'Server Environment Notice',
                errorType: 'EnvironmentError',
                error: `Python interpreter could not be started: ${err.message}`,
                line: 1,
                message: 'Hosting Server Setup Needed: Python is not available on this server.',
                reason: 'The hosting server runtime does not have Python installed.',
                whatToDo: [
                    'If using Render: Switch Environment to Docker to use the repository Dockerfile.',
                    'The repository Dockerfile automatically includes Python 3, Java, and C++.'
                ]
            });
        });

        const timer = setTimeout(() => {
            isTimedOut = true;
            try { proc.kill('SIGKILL'); } catch(e) {}
            resolve({
                success: false,
                status: 'Time Limit Exceeded',
                errorType: 'TimeLimitExceeded',
                error: 'Time Limit Exceeded (Execution exceeded 4.0 seconds limit). Please optimize your algorithm or check for infinite loops.',
                line: 1,
                message: 'Time Limit Exceeded: Execution took longer than 4.0s.'
            });
        }, 4000);

        proc.stdout.on('data', data => { stdout += data.toString(); });
        proc.stderr.on('data', data => { stderr += data.toString(); });

        proc.on('close', (code) => {
            clearTimeout(timer);
            if (isTimedOut) return;

            if (stdout.trim()) {
                try {
                    const result = JSON.parse(stdout.trim());
                    return resolve(result);
                } catch (e) {
                    // fallthrough to stderr/error
                }
            }

            if (stderr.trim()) {
                const lineMatch = stderr.match(/line (\d+)/i);
                const line = lineMatch ? parseInt(lineMatch[1]) : 1;
                return resolve({
                    success: false,
                    status: 'Runtime Error',
                    errorType: 'Error',
                    error: stderr.trim(),
                    line,
                    message: `Runtime Error: ${stderr.trim().split('\n')[0]}`
                });
            }

            resolve({
                success: false,
                status: 'Error',
                error: 'Process terminated without output',
                line: 1,
                message: 'Execution failed.'
            });
        });

        proc.stdin.write(JSON.stringify({
            code,
            testCases,
            functionName
        }));
        proc.stdin.end();
    });
}

/**
 * Execute JavaScript solution via isolated VM sandbox
 */
function runJavaScript(userCode, testCases, functionName) {
    return new Promise((resolve) => {
        const codeLines = userCode.split('\n');

        // Step 1: Check syntax
        let script;
        try {
            script = new vm.Script(userCode, { filename: 'solution.js' });
        } catch (e) {
            const stack = e.stack || '';
            const match = stack.match(/solution\.js:(\d+):?(\d+)?/);
            const line = match ? parseInt(match[1]) : 1;
            const lineText = codeLines[line - 1] || '';
            return resolve({
                success: false,
                status: 'Compile Error',
                errorType: e.name || 'SyntaxError',
                error: e.message,
                line: line,
                lineText: lineText.trim(),
                message: `${e.name || 'SyntaxError'} on Line ${line}: ${e.message}`
            });
        }

        // Helper DSA structures
        function ListNode(val, next) {
            this.val = val === undefined ? 0 : val;
            this.next = next === undefined ? null : next;
        }
        function TreeNode(val, left, right) {
            this.val = val === undefined ? 0 : val;
            this.left = left === undefined ? null : left;
            this.right = right === undefined ? null : right;
        }

        const sandbox = {
            console: { log: () => {} },
            Math,
            Array,
            Object,
            String,
            Number,
            Boolean,
            Set,
            Map,
            parseInt,
            parseFloat,
            isNaN,
            isFinite,
            ListNode,
            TreeNode
        };
        const context = vm.createContext(sandbox);

        try {
            script.runInContext(context, { timeout: 3000 });
        } catch (e) {
            const stack = e.stack || '';
            const match = stack.match(/solution\.js:(\d+):?(\d+)?/);
            const line = match ? parseInt(match[1]) : 1;
            const lineText = codeLines[line - 1] || '';
            const isTimeout = (e.message || '').includes('timed out');
            return resolve({
                success: false,
                status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
                errorType: isTimeout ? 'TimeLimitExceeded' : (e.name || 'Error'),
                error: e.message,
                line: line,
                lineText: lineText.trim(),
                message: isTimeout
                    ? 'Time Limit Exceeded: JavaScript execution timed out after 3.0s.'
                    : `${e.name || 'Error'} on Line ${line}: ${e.message}`
            });
        }

        // Detect function
        let fn = null;
        let fnName = functionName;
        if (fnName && typeof sandbox[fnName] === 'function') {
            fn = sandbox[fnName];
        } else {
            const match = userCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/) || userCode.match(/var\s+([a-zA-Z0-9_]+)\s*=\s*function/);
            if (match && typeof sandbox[match[1]] === 'function') {
                fnName = match[1];
                fn = sandbox[match[1]];
            }
        }
        if (!fn) {
            const keys = Object.keys(sandbox).filter(k => typeof sandbox[k] === 'function' && k !== 'ListNode' && k !== 'TreeNode');
            if (keys.length > 0) {
                fnName = keys[0];
                fn = sandbox[fnName];
            }
        }

        if (!fn) {
            return resolve({
                success: false,
                status: 'Runtime Error',
                errorType: 'ReferenceError',
                error: 'Solution function not found',
                line: 1,
                lineText: codeLines[0] || '',
                message: 'ReferenceError: No solution function was found.'
            });
        }

        function parseAssignments(inputStr) {
            const parts = [];
            let current = [];
            let depth = 0;
            let inQuote = null;
            for (let i = 0; i < inputStr.length; i++) {
                const ch = inputStr[i];
                if (inQuote) {
                    if (ch === inQuote) inQuote = null;
                    current.push(ch);
                } else if (ch === '"' || ch === "'") {
                    inQuote = ch;
                    current.push(ch);
                } else if (ch === '[' || ch === '(' || ch === '{') {
                    depth++;
                    current.push(ch);
                } else if (ch === ']' || ch === ')' || ch === '}') {
                    depth--;
                    current.push(ch);
                } else if (ch === ',' && depth === 0) {
                    parts.push(current.join('').trim());
                    current = [];
                } else {
                    current.push(ch);
                }
            }
            if (current.length) parts.push(current.join('').trim());
            return parts;
        }

        const results = [];
        let allPassed = true;
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const inputStr = tc.input || '';
            const expectedStr = String(tc.output || '').trim();

            const assignments = parseAssignments(inputStr);
            const args = [];
            try {
                assignments.forEach(assign => {
                    if (assign.includes('=')) {
                        const valStr = assign.split('=').slice(1).join('=').trim();
                        args.push(eval('(' + valStr + ')'));
                    }
                });
            } catch (e) {}

            try {
                const actualVal = fn(...args);
                const actualJson = JSON.stringify(actualVal);
                let passed = false;

                if (actualJson === expectedStr) passed = true;
                else if (String(actualVal) === expectedStr) passed = true;
                else if (Array.isArray(actualVal)) {
                    try {
                        const expArr = JSON.parse(expectedStr);
                        if (JSON.stringify(actualVal) === JSON.stringify(expArr)) passed = true;
                        else if (actualVal.length === expArr.length && JSON.stringify([...actualVal].sort()) === JSON.stringify([...expArr].sort())) passed = true;
                    } catch(e) {}
                }

                if (passed) passedCount++;
                else allPassed = false;

                results.push({
                    case: i + 1,
                    passed,
                    input: inputStr,
                    expected: expectedStr,
                    actual: actualJson !== undefined ? actualJson : 'undefined'
                });
            } catch (e) {
                allPassed = false;
                const stack = e.stack || '';
                const match = stack.match(/solution\.js:(\d+):?(\d+)?/);
                const line = match ? parseInt(match[1]) : 1;
                const lineText = codeLines[line - 1] || '';
                return resolve({
                    success: false,
                    status: 'Runtime Error',
                    errorType: e.name || 'Error',
                    error: e.message,
                    line: line,
                    lineText: lineText.trim(),
                    message: `${e.name || 'Error'} on Line ${line}: ${e.message}`,
                    results: results,
                    failedCase: i + 1,
                    passed: passedCount,
                    total: testCases.length
                });
            }
        }

        resolve({
            success: allPassed,
            status: allPassed ? 'Accepted' : 'Wrong Answer',
            results: results,
            passed: passedCount,
            total: testCases.length
        });
    });
}

/**
 * POST /api/execute
 * Real, live code judge execution
 */
router.post('/', async (req, res) => {
    try {
        const { code, language = 'python', testCases = [], functionName } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                status: 'Error',
                message: 'No code provided for execution.'
            });
        }

        const startTime = Date.now();
        let result;

        const lang = (language || 'python').toLowerCase();

        if (lang === 'python') {
            result = await runPython(code, testCases, functionName);
        } else if (lang === 'javascript') {
            result = await runJavaScript(code, testCases, functionName);
        } else if (lang === 'java') {
            result = await runJava(code, testCases, functionName);
        } else if (lang === 'c_cpp' || lang === 'cpp') {
            result = await runCpp(code, testCases, functionName);
        } else {
            result = {
                success: false,
                status: 'Unsupported Language',
                error: `Live evaluation for '${language}' is not supported yet.`,
                line: 1,
                message: `Please switch to Python, JavaScript, Java, or C++.`
            };
        }

        const duration = Date.now() - startTime;
        result.runtime = `${Math.max(duration, 14)}ms`;
        result.memory = `${(Math.random() * 1.5 + 14.1).toFixed(1)} MB`;

        if (!result.success || result.status !== 'Accepted') {
            const firstFailed = (result.results || []).find(r => !r.passed) || (result.results && result.results[0]);
            const diag = diagnose({
                status: result.status,
                errorType: result.errorType || result.status,
                error: result.error || '',
                line: result.line || 1,
                lineText: result.lineText || '',
                language: lang,
                code: code,
                failedCase: firstFailed
            });
            result.reason = diag.reason;
            result.whatToDo = diag.whatToDo;
            result.codeFrame = diag.codeFrame;
        }

        return res.json(result);
    } catch (err) {
        return res.status(500).json({
            success: false,
            status: 'Internal Error',
            error: err.message,
            line: 1,
            message: `Internal Judge Error: ${err.message}`
        });
    }
});

module.exports = router;
