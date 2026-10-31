const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function splitAssignments(inputStr) {
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

function parseMethodSignature(code) {
    // Find method inside class Solution
    const clean = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const m = clean.match(/(?:(?:vector<[^>]+>|string|int|bool|double|long\s+long|void|ListNode\*|TreeNode\*)\s+)+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/);
    if (!m) return null;

    const methodName = m[1];
    const rawParams = m[2].trim();
    if (!rawParams) return { methodName, params: [] };

    const paramTokens = rawParams.split(',').map(s => s.trim());
    const params = paramTokens.map(p => {
        // e.g. "vector<int>& nums" or "int target"
        const lastSpace = p.lastIndexOf(' ');
        const lastAmp = p.lastIndexOf('&');
        const lastStar = p.lastIndexOf('*');
        const splitIdx = Math.max(lastSpace, lastAmp, lastStar);

        const typeStr = p.slice(0, splitIdx + 1).replace(/[&*]/g, '').trim();
        const nameStr = p.slice(splitIdx + 1).trim();
        return { type: typeStr, name: nameStr };
    });

    return { methodName, params };
}

function runCpp(code, testCases, functionName) {
    return new Promise((resolve) => {
        const tmpBase = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpBase)) fs.mkdirSync(tmpBase, { recursive: true });

        const runDir = path.join(tmpBase, `cpp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
        fs.mkdirSync(runDir, { recursive: true });

        const codeLines = code.split('\n');
        const userLineCount = codeLines.length;

        const sig = parseMethodSignature(code);
        const methodName = sig ? sig.methodName : (functionName || 'twoSum');
        const params = sig ? sig.params : [];

        // Build test cases in main()
        let testCaseCalls = '';
        (testCases || []).forEach((tc, idx) => {
            const rawAssigns = splitAssignments(tc.input || '');
            const valStrings = rawAssigns.map(a => a.includes('=') ? a.split('=').slice(1).join('=').trim() : a.trim());

            let varDefs = '';
            let callArgs = [];

            params.forEach((param, pIdx) => {
                const rawVal = pIdx < valStrings.length ? valStrings[pIdx] : '0';
                const varName = `arg_${idx}_${pIdx}`;
                callArgs.push(varName);

                // Convert JSON array syntax to C++ initializer syntax: [ ... ] -> { ... }
                let cppVal = rawVal.replace(/\[/g, '{').replace(/\]/g, '}');
                varDefs += `        ${param.type} ${varName} = ${cppVal};\n`;
            });

            const expStr = String(tc.output || '').trim();

            testCaseCalls += `
    {
${varDefs}
        try {
            auto actual_val = sol.${methodName}(${callArgs.join(', ')});
            string actual_str = to_json(actual_val);
            cout << "CASE:${idx + 1}:" << actual_str << endl;
        } catch (const exception& e) {
            cout << "ERROR:${idx + 1}:" << e.what() << endl;
        }
    }
`;
        });

        const cppHarness = `
// ================= AUTO HARNESS =================
#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <exception>
using namespace std;

template<typename T>
string to_json(const T& val) {
    stringstream ss;
    ss << val;
    return ss.str();
}

string to_json(bool val) {
    return val ? "true" : "false";
}

string to_json(const string& val) {
    return "\\"" + val + "\\"";
}

template<typename T>
string to_json(const vector<T>& vec) {
    string s = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        if (i > 0) s += ", ";
        s += to_json(vec[i]);
    }
    s += "]";
    return s;
}

int main() {
    Solution sol;
${testCaseCalls}
    return 0;
}
`;

        const fullSource = code + '\n' + cppHarness;
        fs.writeFileSync(path.join(runDir, 'solution.cpp'), fullSource);

        const cleanup = () => {
            try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (e) {}
        };

        // Step 1: Compile with g++
        exec('g++ -std=c++17 -O2 solution.cpp -o solution.exe', { cwd: runDir, timeout: 6000 }, (compileErr, compileStdout, compileStderr) => {
            if (compileErr) {
                const stderr = (compileStderr || compileErr.message || '').toString();
                // Match g++ error: solution.cpp:Line:Col: error: Message
                const match = stderr.match(/solution\.cpp:(\d+):(?:(\d+):)?\s*error:\s*(.*)/);
                let line = match ? parseInt(match[1]) : 1;
                const col = match && match[2] ? parseInt(match[2]) : 0;
                let errorMsg = match && match[3] ? match[3].trim() : (stderr.split('\n')[0] || 'Compilation error');

                // If error is past user's code length (in harness), map back to end of user code
                if (line > userLineCount) {
                    line = Math.min(userLineCount, line);
                }
                const lineText = codeLines[line - 1] || '';

                cleanup();
                return resolve({
                    success: false,
                    status: 'Compile Error',
                    errorType: 'CompileError',
                    error: errorMsg,
                    line: line,
                    column: col,
                    lineText: lineText.trim(),
                    message: `CompileError on Line ${line}: ${errorMsg}`
                });
            }

            // Step 2: Execute compiled solution.exe
            exec('solution.exe', { cwd: runDir, timeout: 4000 }, (runErr, runStdout, runStderr) => {
                cleanup();

                if (runErr) {
                    const isTimeout = (runErr.message || '').includes('timed out');
                    return resolve({
                        success: false,
                        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
                        errorType: isTimeout ? 'TimeLimitExceeded' : 'RuntimeError',
                        error: isTimeout ? 'C++ execution timed out after 4.0 seconds.' : (runStderr || runErr.message),
                        line: 1,
                        message: isTimeout ? 'Time Limit Exceeded (4.0s)' : 'Runtime Error'
                    });
                }

                const outLines = (runStdout || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                const results = [];
                let allPassed = true;
                let passedCount = 0;

                (testCases || []).forEach((tc, i) => {
                    const casePrefix = `CASE:${i + 1}:`;
                    const errPrefix = `ERROR:${i + 1}:`;

                    const caseLine = outLines.find(l => l.startsWith(casePrefix));
                    const errLine = outLines.find(l => l.startsWith(errPrefix));

                    if (errLine) {
                        allPassed = false;
                        const errMsg = errLine.slice(errPrefix.length);
                        results.push({
                            case: i + 1,
                            passed: false,
                            input: tc.input || '',
                            expected: tc.output || '',
                            actual: `Error: ${errMsg}`
                        });
                    } else if (caseLine) {
                        const actualVal = caseLine.slice(casePrefix.length).trim();
                        const expectedVal = String(tc.output || '').trim();

                        const normActual = actualVal.replace(/\s+/g, '');
                        const normExp = expectedVal.replace(/\s+/g, '');
                        const isPass = normActual.toLowerCase() === normExp.toLowerCase();

                        if (isPass) passedCount++;
                        else allPassed = false;

                        results.push({
                            case: i + 1,
                            passed: isPass,
                            input: tc.input || '',
                            expected: tc.output || '',
                            actual: actualVal
                        });
                    } else {
                        allPassed = false;
                        results.push({
                            case: i + 1,
                            passed: false,
                            input: tc.input || '',
                            expected: tc.output || '',
                            actual: 'No output produced'
                        });
                    }
                });

                resolve({
                    success: allPassed,
                    status: allPassed ? 'Accepted' : 'Wrong Answer',
                    passed: passedCount,
                    total: (testCases || []).length,
                    results: results
                });
            });
        });
    });
}

module.exports = { runCpp };
