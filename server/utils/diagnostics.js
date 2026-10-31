/**
 * LeetCode-Style Error Diagnostic & Guidance Engine
 * Explains exact reason for error, provides code frame, and generates step-by-step fix instructions.
 */

function generateCodeFrame(code, lineNum) {
    if (!code) return null;
    const lines = code.split('\n');
    const idx = Math.max(0, (lineNum || 1) - 1);

    const prev = idx > 0 ? { num: idx, text: lines[idx - 1] } : null;
    const current = { num: idx + 1, text: lines[idx] || '' };
    const next = idx + 1 < lines.length ? { num: idx + 2, text: lines[idx + 1] } : null;

    return {
        prev,
        current,
        next
    };
}

function diagnose({ status, errorType = '', error = '', line = 1, lineText = '', language = '', code = '', failedCase = null }) {
    const errLow = (error + ' ' + errorType).toLowerCase();
    const txtLow = (lineText || '').toLowerCase();
    const lang = (language || '').toLowerCase();

    let reason = '';
    let whatToDo = [];

    // ── 0. SERVER ENVIRONMENT / COMPILER NOT INSTALLED ──
    if (status === 'Server Environment Notice' || errorType === 'EnvironmentError' || errLow.includes('javac: not found') || errLow.includes('g++: not found')) {
        const isJava = errLow.includes('javac') || lang === 'java';
        const isCpp = errLow.includes('g++') || lang === 'cpp' || lang === 'c_cpp';
        const missingTool = isJava ? 'Java Development Kit (javac)' : isCpp ? 'C++ Compiler (g++)' : 'Compiler';
        reason = `The cloud hosting server does not have ${missingTool} installed in its environment.`;
        whatToDo = [
            `If hosted on Render: In the Render Dashboard, go to your Web Service Settings and switch the 'Environment / Runtime' from 'Node' to 'Docker' using the repository Dockerfile.`,
            `Alternatively, trigger a rebuild on Render so the automated JDK setup script installs OpenJDK 17.`,
            `Your solution code itself is syntactically valid and runs successfully once the compiler is present on the server.`
        ];
        return { reason, whatToDo, codeFrame: null };
    }

    // ── 1. TIME LIMIT EXCEEDED ──
    if (status === 'Time Limit Exceeded' || errLow.includes('time limit') || errLow.includes('timed out')) {
        reason = `Your solution exceeded the execution time limit (4.0 seconds). This typically indicates an infinite loop or a non-terminating recursion.`;
        whatToDo = [
            `Check all while / for loops to ensure loop variables (like i++, left++, right--) are advancing toward the termination condition.`,
            `If using recursion, verify that your base condition (e.g., if (node == null) return;) is reached on every execution branch.`,
            `If the problem constraints are large (e.g. N = 10^5), replace O(N^2) nested loops with an O(N) Hash Map or two-pointer approach.`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 2. WRONG ANSWER ──
    if (status === 'Wrong Answer' || failedCase) {
        const fc = failedCase || {};
        reason = `Your solution ran without crashing, but returned an incorrect output (${fc.actual || 'null'}) instead of the expected answer (${fc.expected || 'target'}).`;
        whatToDo = [
            `Carefully compare your output with the expected output for Test Case ${fc.case || 1}.`,
            `Walk through your algorithm line by line using the input: ${fc.input || 'given test case'}.`,
            `Check edge cases: empty inputs, single element lists, duplicate numbers, or negative values.`,
            `Ensure you are returning the exact required data type (e.g. indices vs values, or 0-indexed vs 1-indexed).`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 3. SYNTAX / COMPILE ERRORS: MISSING SEMICOLON OR COLON ──
    if (errLow.includes(';') || errLow.includes('semicolon') || (lang === 'python' && (errLow.includes("expected ':'") || errLow.includes('invalid syntax')))) {
        if (lang === 'python') {
            reason = `Python expected a colon ':' at the end of a header statement (def, if, for, while, else, elif, or class) on Line ${line}.`;
            whatToDo = [
                `Go to Line ${line} in your editor.`,
                `Add a colon ':' at the very end of the line (e.g. def twoSum(...): or for i in range(...):).`,
                `Ensure that the lines inside the block are indented by 4 spaces.`
            ];
        } else {
            reason = `The compiler expected a semicolon ';' at the end of the statement on Line ${line}.`;
            whatToDo = [
                `Go to Line ${line} in your editor.`,
                `Add a semicolon ';' at the end of the statement.`,
                `Check if all parentheses '(' and brackets '[' opened on this line have matching closing symbols.`
            ];
        }
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 4. ARRAY / INDEX OUT OF BOUNDS ──
    if (errLow.includes('indexoutofbounds') || errLow.includes('indexerror') || errLow.includes('out of range') || errLow.includes('out_of_range')) {
        reason = `Attempted to access an array or list index that is outside the valid range. The index is either negative or greater than or equal to the length of the container.`;
        whatToDo = [
            `Check Line ${line}: look for any array indexing like arr[i] or list.get(i).`,
            `In loop conditions, make sure you use '< arr.length' (strict inequality) instead of '<= arr.length' because arrays are 0-indexed.`,
            `Check if the array can be empty (length 0) before indexing into arr[0].`,
            `If calculating an index (e.g. i + 1 or mid - 1), ensure it stays within [0, length - 1].`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 5. NULL POINTER / UNDEFINED DEREFERENCE ──
    if (errLow.includes('nullpointer') || errLow.includes('cannot read properties of null') || errLow.includes('cannot read properties of undefined') || errLow.includes('none') && errLow.includes('attribute') || errLow.includes('segmentation fault')) {
        reason = `Your code tried to call a method or access a field on a variable or node reference that currently holds null (or None / undefined).`;
        whatToDo = [
            `Check Line ${line}: inspect which object or node is being dereferenced (e.g. node.next, root.left, or map.get(...)).`,
            `Add a null-check guard before accessing: e.g. if (node != null && node.next != null) { ... }`,
            `For linked lists or tree traversals, verify the termination condition (e.g. while (curr != null)).`,
            `If using a Hash Map, check map.containsKey(key) before calling methods on the retrieved object.`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 6. TYPE MISMATCH / INCOMPATIBLE TYPES ──
    if (errLow.includes('incompatible types') || errLow.includes('cannot be converted') || errLow.includes('typeerror') || errLow.includes('no matching function')) {
        reason = `Type mismatch on Line ${line}: You assigned or returned a value whose data type does not match what the variable or function signature expects.`;
        whatToDo = [
            `Check the expected return type in the function signature (e.g. int[] vs int, or vector<int> vs int).`,
            `If returning an array in Java, make sure to use 'return new int[]{ ... };' rather than raw braces.`,
            `In C++, ensure types match (e.g. {seen[comp], i} returns a vector<int>).`,
            `If performing division or numeric conversions, cast explicitly if necessary: (int) Math.floor(...).`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 7. SYMBOL NOT FOUND / UNDECLARED IDENTIFIER ──
    if (errLow.includes('cannot find symbol') || errLow.includes('not declared in this scope') || errLow.includes('nameerror') || errLow.includes('referenceerror')) {
        reason = `A variable, method, or class name used on Line ${line} is unrecognized or out of scope.`;
        whatToDo = [
            `Check for typos or casing errors on Line ${line} (names are case-sensitive: e.g. length vs Length).`,
            `Verify that the variable was declared before this line and is inside the current block scope.`,
            `If using data structures like HashMap, Queue, Stack, or vector, verify that the required library is imported/included.`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 8. DIVISION BY ZERO ──
    if (errLow.includes('by zero') || errLow.includes('zerodivisionerror')) {
        reason = `A division or modulo operation ('/' or '%') was executed on Line ${line} where the divisor evaluates to 0.`;
        whatToDo = [
            `Check Line ${line} for any division: '/' or '%'.`,
            `Ensure the denominator cannot evaluate to 0, or add a check: if (divisor != 0) { ... }.`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 9. STACK OVERFLOW / RECURSION DEPTH ──
    if (errLow.includes('stackoverflow') || errLow.includes('recursionerror') || errLow.includes('maximum recursion')) {
        reason = `Maximum recursion depth exceeded. The function kept calling itself recursively without ever reaching a stopping base case.`;
        whatToDo = [
            `Check your recursive base case at the top of the function: e.g. if (root == null) return ...; or if (i >= n) return ...;`,
            `Ensure every recursive call moves closer to the base case (e.g. helper(i + 1, ...)).`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 10. MISSING RETURN STATEMENT ──
    if (errLow.includes('missing return statement') || errLow.includes('control reaches end of non-void')) {
        reason = `The function is declared to return a value, but execution can reach the end of the function body without returning anything.`;
        whatToDo = [
            `Add a default return statement at the end of the function (e.g. return new int[0]; or return -1; or return {};).`,
            `Ensure that every if / else-if branch has a return statement.`
        ];
        return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
    }

    // ── 11. GENERAL COMPILE / RUNTIME FALLBACK ──
    reason = `Encountered ${status || 'an error'} on Line ${line}: ${error || 'Operation could not complete.'}`;
    whatToDo = [
        `Inspect Line ${line} in your editor.`,
        `Check variable definitions, syntax formatting, and loop boundaries on and immediately before Line ${line}.`,
        `Refer to the exact compiler/runtime message above for specific token details.`
    ];

    return { reason, whatToDo, codeFrame: generateCodeFrame(code, line) };
}

module.exports = { diagnose, generateCodeFrame };
