const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const JAVA_RUNNER_TEMPLATE = path.join(__dirname, 'JavaRunner.java');

function runJava(code, testCases, functionName) {
    return new Promise((resolve) => {
        const tmpBase = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpBase)) fs.mkdirSync(tmpBase, { recursive: true });

        const runDir = path.join(tmpBase, `java_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
        fs.mkdirSync(runDir, { recursive: true });

        const codeLines = code.split('\n');

        // Normalize Solution class definition (ensure it's public class Solution)
        let normalizedCode = code;
        if (!normalizedCode.includes('class Solution')) {
            const classMatch = normalizedCode.match(/class\s+([a-zA-Z0-9_]+)/);
            if (classMatch) {
                normalizedCode = normalizedCode.replace(new RegExp(`class\\s+${classMatch[1]}`), 'class Solution');
            }
        }
        if (normalizedCode.includes('class Solution') && !normalizedCode.includes('public class Solution')) {
            normalizedCode = normalizedCode.replace('class Solution', 'public class Solution');
        }

        // Add standard imports if missing
        let lineOffset = 0;
        if (!normalizedCode.includes('import java.util.')) {
            normalizedCode = 'import java.util.*;\n' + normalizedCode;
            lineOffset = 1;
        }

        fs.writeFileSync(path.join(runDir, 'Solution.java'), normalizedCode);
        fs.copyFileSync(JAVA_RUNNER_TEMPLATE, path.join(runDir, 'JavaRunner.java'));

        // Format test_cases.txt
        const tcLines = (testCases || []).map(tc => {
            const input = (tc.input || '').replace(/\r?\n/g, ' ');
            const output = (tc.output || '').replace(/\r?\n/g, ' ');
            return `${input}###EXPECTED###${output}`;
        }).join('\n');
        fs.writeFileSync(path.join(runDir, 'test_cases.txt'), tcLines);

        const cleanup = () => {
            try {
                fs.rmSync(runDir, { recursive: true, force: true });
            } catch (e) {}
        };

        // Step 1: Compile with javac
        exec('javac -encoding UTF-8 Solution.java JavaRunner.java', { cwd: runDir, timeout: 6000 }, (compileErr, compileStdout, compileStderr) => {
            if (compileErr) {
                const stderr = (compileStderr || compileErr.message || '').toString();
                const match = stderr.match(/Solution\.java:(\d+):(?:\s*error:\s*(.*))?/);
                const rawLine = match ? parseInt(match[1]) : 1;
                const line = Math.max(1, rawLine - lineOffset);
                const errorMsg = match && match[2] ? match[2].trim() : (stderr.split('\n')[0] || 'Compilation error');
                const lineText = codeLines[line - 1] || '';

                cleanup();
                return resolve({
                    success: false,
                    status: 'Compile Error',
                    errorType: 'CompileError',
                    error: errorMsg,
                    line: line,
                    lineText: lineText.trim(),
                    message: `CompileError on Line ${line}: ${errorMsg}`
                });
            }

            // Step 2: Execute with java
            exec('java -Xmx256m JavaRunner', { cwd: runDir, timeout: 5000 }, (runErr, runStdout, runStderr) => {
                cleanup();

                if (runStdout && runStdout.trim()) {
                    try {
                        const parsed = JSON.parse(runStdout.trim());
                        if (parsed.line) {
                            parsed.line = Math.max(1, parsed.line - lineOffset);
                        }
                        if (parsed.line && codeLines[parsed.line - 1]) {
                            parsed.lineText = codeLines[parsed.line - 1].trim();
                        }
                        return resolve(parsed);
                    } catch (e) {}
                }

                if (runErr) {
                    const isTimeout = (runErr.message || '').includes('timed out');
                    return resolve({
                        success: false,
                        status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
                        errorType: isTimeout ? 'TimeLimitExceeded' : 'RuntimeError',
                        error: isTimeout ? 'Java execution timed out after 5.0 seconds.' : (runStderr || runErr.message),
                        line: 1,
                        message: isTimeout ? 'Time Limit Exceeded (5.0s)' : 'Runtime Error'
                    });
                }

                resolve({
                    success: false,
                    status: 'Error',
                    error: 'Java runner returned no output.',
                    line: 1,
                    message: 'Execution error'
                });
            });
        });
    });
}

module.exports = { runJava };
