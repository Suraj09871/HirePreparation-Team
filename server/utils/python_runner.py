# -*- coding: utf-8 -*-
"""
HirePrep Real Python Code Execution Engine
Evaluates user algorithm against problem test cases, catching syntax, compile, and runtime errors
with exact line numbers and detailed diffs.
"""

import sys
import json
import ast
import traceback
import math
import collections
from collections import defaultdict, deque, Counter
import heapq
import itertools
import bisect
import re

# Standard DSA Helper Classes
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def to_list(self):
        res = []
        curr = self
        visited = set()
        while curr and id(curr) not in visited:
            visited.add(id(curr))
            res.append(curr.val)
            curr = curr.next
        return res

    @staticmethod
    def from_list(vals):
        if not vals:
            return None
        head = ListNode(vals[0])
        curr = head
        for v in vals[1:]:
            curr.next = ListNode(v)
            curr = curr.next
        return head


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def to_list(self):
        res = []
        q = deque([self])
        while q:
            node = q.popleft()
            if node:
                res.append(node.val)
                q.append(node.left)
                q.append(node.right)
            else:
                res.append(None)
        while res and res[-1] is None:
            res.pop()
        return res

    @staticmethod
    def from_list(vals):
        if not vals:
            return None
        root = TreeNode(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = TreeNode(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = TreeNode(vals[i])
                q.append(node.right)
            i += 1
        return root


def parse_assignments(input_str):
    parts = []
    current = []
    depth = 0
    in_quote = None
    for ch in input_str:
        if in_quote:
            if ch == in_quote:
                in_quote = None
            current.append(ch)
        elif ch in ('"', "'"):
            in_quote = ch
            current.append(ch)
        elif ch in ('[', '(', '{'):
            depth += 1
            current.append(ch)
        elif ch in (']', ')', '}'):
            depth -= 1
            current.append(ch)
        elif ch == ',' and depth == 0:
            parts.append(''.join(current).strip())
            current = []
        else:
            current.append(ch)
    if current:
        parts.append(''.join(current).strip())
    return parts


def normalize_value(val):
    if isinstance(val, ListNode):
        return val.to_list()
    if isinstance(val, TreeNode):
        return val.to_list()
    if isinstance(val, tuple):
        return list(val)
    if isinstance(val, set):
        return sorted(list(val))
    return val


def compare_outputs(actual, expected_str):
    actual = normalize_value(actual)
    actual_json = json.dumps(actual)
    expected_str = expected_str.strip()

    # Boolean normalize
    if expected_str.lower() in ('true', 'false'):
        if isinstance(actual, bool):
            return actual == (expected_str.lower() == 'true')
        if actual_json.lower() == expected_str.lower():
            return True

    # Direct JSON match
    if actual_json == expected_str:
        return True

    # Direct String match
    if str(actual) == expected_str:
        return True

    # Try parsing expected as JSON
    try:
        exp_parsed = json.loads(expected_str)
        if actual == exp_parsed:
            return True
        if isinstance(actual, (list, tuple)) and isinstance(exp_parsed, (list, tuple)):
            if list(actual) == list(exp_parsed):
                return True
            # For 2Sum or order-independent arrays, if length matches
            if len(actual) == len(exp_parsed) and sorted(str(x) for x in actual) == sorted(str(x) for x in exp_parsed):
                return True
    except Exception:
        pass

    return False


def execute():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"success": False, "status": "Error", "error": "No input provided"}))
            return

        payload = json.loads(raw_input)
        user_code = payload.get("code", "")
        test_cases = payload.get("testCases", [])
        target_func = payload.get("functionName")
        code_lines = user_code.splitlines()

        # Step 1: AST Syntax Validation
        try:
            parsed = ast.parse(user_code)
        except SyntaxError as e:
            line_no = e.lineno or 1
            line_text = code_lines[line_no - 1] if 0 <= line_no - 1 < len(code_lines) else ""
            print(json.dumps({
                "success": False,
                "status": "Compile Error",
                "errorType": "SyntaxError",
                "error": e.msg,
                "line": line_no,
                "column": e.offset or 0,
                "lineText": line_text.strip(),
                "message": f"SyntaxError on Line {line_no}: {e.msg}"
            }))
            return

        # Step 2: Auto-detect function name if not supplied
        if not target_func:
            for node in ast.walk(parsed):
                if isinstance(node, ast.FunctionDef):
                    target_func = node.name
                    break

        # Step 3: Base Scope Setup
        global_scope = {
            "ListNode": ListNode,
            "TreeNode": TreeNode,
            "math": math,
            "collections": collections,
            "defaultdict": defaultdict,
            "deque": deque,
            "Counter": Counter,
            "heapq": heapq,
            "itertools": itertools,
            "bisect": bisect,
            "re": re,
            "true": True,
            "false": False,
            "null": None,
            "True": True,
            "False": False,
            "None": None
        }

        # Step 4: Compile & Exec Solution
        try:
            compiled = compile(user_code, '<solution>', 'exec')
            exec(compiled, global_scope)
        except Exception as e:
            tb = traceback.extract_tb(sys.exc_info()[2])
            user_frames = [f for f in tb if f.filename == '<solution>']
            err_line = user_frames[-1].lineno if user_frames else 1
            line_text = code_lines[err_line - 1] if 0 <= err_line - 1 < len(code_lines) else ""
            print(json.dumps({
                "success": False,
                "status": "Runtime Error",
                "errorType": type(e).__name__,
                "error": str(e),
                "line": err_line,
                "lineText": line_text.strip(),
                "message": f"{type(e).__name__} on Line {err_line}: {e}"
            }))
            return

        if target_func and target_func not in global_scope:
            print(json.dumps({
                "success": False,
                "status": "Runtime Error",
                "errorType": "NameError",
                "error": f"Function '{target_func}' is not defined.",
                "line": 1,
                "lineText": code_lines[0] if code_lines else "",
                "message": f"NameError: Function '{target_func}' was not found in your solution."
            }))
            return

        fn = global_scope.get(target_func)

        # Step 5: Run Test Cases
        results = []
        all_passed = True
        total = len(test_cases)
        passed_count = 0

        for idx, tc in enumerate(test_cases):
            input_str = tc.get("input", "")
            expected_str = str(tc.get("output", "")).strip()

            call_scope = dict(global_scope)
            assignments = parse_assignments(input_str)
            var_names = []

            for assign in assignments:
                if "=" in assign:
                    k, v = assign.split("=", 1)
                    k = k.strip()
                    try:
                        val = eval(v.strip(), call_scope)
                        call_scope[k] = val
                        var_names.append(k)
                    except Exception:
                        pass

            try:
                args = [call_scope[k] for k in var_names if k in call_scope]
                if not args and fn:
                    actual_val = fn()
                else:
                    actual_val = fn(*args)

                norm_actual = normalize_value(actual_val)
                actual_json = json.dumps(norm_actual) if norm_actual is not None else "null"
                is_match = compare_outputs(actual_val, expected_str)

                if is_match:
                    passed_count += 1
                else:
                    all_passed = False

                results.append({
                    "case": idx + 1,
                    "passed": is_match,
                    "input": input_str,
                    "expected": expected_str,
                    "actual": actual_json
                })
            except Exception as e:
                all_passed = False
                tb = traceback.extract_tb(sys.exc_info()[2])
                user_frames = [f for f in tb if f.filename == '<solution>']
                err_line = user_frames[-1].lineno if user_frames else 1
                line_text = code_lines[err_line - 1] if 0 <= err_line - 1 < len(code_lines) else ""
                print(json.dumps({
                    "success": False,
                    "status": "Runtime Error",
                    "errorType": type(e).__name__,
                    "error": str(e),
                    "line": err_line,
                    "lineText": line_text.strip(),
                    "message": f"{type(e).__name__} on Line {err_line}: {e}",
                    "failedCase": idx + 1,
                    "passed": passed_count,
                    "total": total,
                    "results": results
                }))
                return

        print(json.dumps({
            "success": all_passed,
            "status": "Accepted" if all_passed else "Wrong Answer",
            "passed": passed_count,
            "total": total,
            "results": results
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "status": "Execution Error",
            "errorType": type(e).__name__,
            "error": str(e),
            "line": 1,
            "message": f"Execution Error: {e}"
        }))


if __name__ == '__main__':
    execute()
