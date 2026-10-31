import java.lang.reflect.*;
import java.util.*;
import java.io.*;

public class JavaRunner {

    public static class ListNode {
        public int val;
        public ListNode next;
        public ListNode() {}
        public ListNode(int val) { this.val = val; }
        public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
        public static ListNode fromArray(int[] arr) {
            if (arr == null || arr.length == 0) return null;
            ListNode head = new ListNode(arr[0]);
            ListNode curr = head;
            for (int i = 1; i < arr.length; i++) {
                curr.next = new ListNode(arr[i]);
                curr = curr.next;
            }
            return head;
        }
        public static List<Integer> toList(ListNode head) {
            List<Integer> list = new ArrayList<>();
            Set<ListNode> seen = new HashSet<>();
            while (head != null && !seen.contains(head)) {
                seen.add(head);
                list.add(head.val);
                head = head.next;
            }
            return list;
        }
    }

    public static class TreeNode {
        public int val;
        public TreeNode left;
        public TreeNode right;
        public TreeNode() {}
        public TreeNode(int val) { this.val = val; }
        public TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    private static List<String> splitAssignments(String input) {
        List<String> parts = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        Character inQuote = null;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (inQuote != null) {
                if (c == inQuote) inQuote = null;
                cur.append(c);
            } else if (c == '"' || c == '\'') {
                inQuote = c;
                cur.append(c);
            } else if (c == '[' || c == '(' || c == '{') {
                depth++;
                cur.append(c);
            } else if (c == ']' || c == ')' || c == '}') {
                depth--;
                cur.append(c);
            } else if (c == ',' && depth == 0) {
                parts.add(cur.toString().trim());
                cur = new StringBuilder();
            } else {
                cur.append(c);
            }
        }
        if (cur.length() > 0) parts.add(cur.toString().trim());
        return parts;
    }

    private static Object parseValue(String str, Class<?> type) {
        str = str.trim();
        if (type == int.class || type == Integer.class) {
            return Integer.parseInt(str);
        }
        if (type == long.class || type == Long.class) {
            return Long.parseLong(str);
        }
        if (type == double.class || type == Double.class) {
            return Double.parseDouble(str);
        }
        if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(str);
        }
        if (type == char.class || type == Character.class) {
            if (str.startsWith("'") && str.endsWith("'") && str.length() >= 3) return str.charAt(1);
            return str.isEmpty() ? ' ' : str.charAt(0);
        }
        if (type == String.class) {
            if (str.startsWith("\"") && str.endsWith("\"") && str.length() >= 2) {
                return str.substring(1, str.length() - 1);
            }
            return str;
        }
        if (type == int[].class) {
            if (str.startsWith("[")) str = str.substring(1);
            if (str.endsWith("]")) str = str.substring(0, str.length() - 1);
            str = str.trim();
            if (str.isEmpty()) return new int[0];
            String[] tokens = str.split(",");
            int[] arr = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                arr[i] = Integer.parseInt(tokens[i].trim());
            }
            return arr;
        }
        if (type == String[].class) {
            if (str.startsWith("[")) str = str.substring(1);
            if (str.endsWith("]")) str = str.substring(0, str.length() - 1);
            str = str.trim();
            if (str.isEmpty()) return new String[0];
            List<String> parts = splitAssignments(str);
            String[] arr = new String[parts.size()];
            for (int i = 0; i < parts.size(); i++) {
                String s = parts.get(i).trim();
                if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
                    s = s.substring(1, s.length() - 1);
                }
                arr[i] = s;
            }
            return arr;
        }
        if (type == char[].class) {
            if (str.startsWith("[")) str = str.substring(1);
            if (str.endsWith("]")) str = str.substring(0, str.length() - 1);
            str = str.trim();
            if (str.isEmpty()) return new char[0];
            String[] tokens = str.split(",");
            char[] arr = new char[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                String t = tokens[i].trim();
                if (t.startsWith("'") && t.endsWith("'") && t.length() >= 3) arr[i] = t.charAt(1);
                else arr[i] = t.charAt(0);
            }
            return arr;
        }
        if (type.getSimpleName().equals("ListNode")) {
            int[] arr = (int[]) parseValue(str, int[].class);
            return ListNode.fromArray(arr);
        }
        return str;
    }

    private static String formatOutput(Object val) {
        if (val == null) return "null";
        if (val instanceof int[]) return Arrays.toString((int[]) val);
        if (val instanceof long[]) return Arrays.toString((long[]) val);
        if (val instanceof double[]) return Arrays.toString((double[]) val);
        if (val instanceof boolean[]) return Arrays.toString((boolean[]) val);
        if (val instanceof String[]) return Arrays.toString((String[]) val);
        if (val instanceof char[]) return Arrays.toString((char[]) val);
        if (val instanceof int[][]) return Arrays.deepToString((int[][]) val);
        if (val instanceof Boolean) return val.toString().toLowerCase();
        if (val instanceof ListNode) return ListNode.toList((ListNode) val).toString();
        if (val instanceof Collection) return val.toString();
        return String.valueOf(val);
    }

    private static boolean compareOutputs(String actual, String expected) {
        actual = actual.trim();
        expected = expected.trim();
        if (actual.equalsIgnoreCase(expected)) return true;
        String actualNoSpace = actual.replaceAll("\\s+", "");
        String expectedNoSpace = expected.replaceAll("\\s+", "");
        if (actualNoSpace.equalsIgnoreCase(expectedNoSpace)) return true;
        return false;
    }

    public static void main(String[] args) {
        try {
            Class<?> solClass = Class.forName("Solution");
            Object solInstance = solClass.getDeclaredConstructor().newInstance();

            Method targetMethod = null;
            for (Method m : solClass.getDeclaredMethods()) {
                if (Modifier.isPublic(m.getModifiers()) && !m.getName().equals("main")) {
                    targetMethod = m;
                    break;
                }
            }

            if (targetMethod == null) {
                System.out.println("{\"success\":false,\"status\":\"Compile Error\",\"errorType\":\"NoSuchMethodError\",\"error\":\"No public solution method found in Solution class\",\"line\":1}");
                return;
            }

            File f = new File("test_cases.txt");
            if (!f.exists()) {
                System.out.println("{\"success\":false,\"status\":\"Error\",\"error\":\"Missing test_cases.txt\",\"line\":1}");
                return;
            }

            BufferedReader br = new BufferedReader(new FileReader(f));
            String line;
            List<String> inputs = new ArrayList<>();
            List<String> expecteds = new ArrayList<>();
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split("###EXPECTED###");
                if (parts.length >= 2) {
                    inputs.add(parts[0]);
                    expecteds.add(parts[1]);
                }
            }
            br.close();

            Class<?>[] paramTypes = targetMethod.getParameterTypes();
            boolean allPassed = true;
            int passedCount = 0;
            StringBuilder resultsJson = new StringBuilder("[");

            for (int i = 0; i < inputs.size(); i++) {
                String inStr = inputs.get(i);
                String expStr = expecteds.get(i);

                List<String> rawAssigns = splitAssignments(inStr);
                List<String> valStrings = new ArrayList<>();
                for (String a : rawAssigns) {
                    if (a.contains("=")) {
                        valStrings.add(a.substring(a.indexOf("=") + 1).trim());
                    } else {
                        valStrings.add(a.trim());
                    }
                }

                Object[] methodArgs = new Object[paramTypes.length];
                for (int p = 0; p < paramTypes.length; p++) {
                    String v = p < valStrings.size() ? valStrings.get(p) : "";
                    methodArgs[p] = parseValue(v, paramTypes[p]);
                }

                try {
                    Object actual = targetMethod.invoke(solInstance, methodArgs);
                    String actualStr = formatOutput(actual);
                    boolean isPass = compareOutputs(actualStr, expStr);

                    if (isPass) {
                        passedCount++;
                    } else {
                        allPassed = false;
                    }

                    if (i > 0) resultsJson.append(",");
                    resultsJson.append("{")
                        .append("\"case\":").append(i + 1).append(",")
                        .append("\"passed\":").append(isPass).append(",")
                        .append("\"input\":").append("\"").append(inStr.replace("\\", "\\\\").replace("\"", "\\\"")).append("\",")
                        .append("\"expected\":").append("\"").append(expStr.replace("\\", "\\\\").replace("\"", "\\\"")).append("\",")
                        .append("\"actual\":").append("\"").append(actualStr.replace("\\", "\\\\").replace("\"", "\\\"")).append("\"")
                        .append("}");

                } catch (InvocationTargetException ite) {
                    Throwable cause = ite.getCause();
                    int errLine = 1;
                    for (StackTraceElement ste : cause.getStackTrace()) {
                        if ("Solution.java".equals(ste.getFileName())) {
                            errLine = ste.getLineNumber();
                            break;
                        }
                    }
                    String errType = cause.getClass().getSimpleName();
                    String errMsg = cause.getMessage() != null ? cause.getMessage() : errType;
                    System.out.println("{"
                        + "\"success\":false,"
                        + "\"status\":\"Runtime Error\","
                        + "\"errorType\":\"" + errType + "\","
                        + "\"error\":\"" + errMsg.replace("\"", "\\\"") + "\","
                        + "\"line\":" + errLine + ","
                        + "\"message\":\"" + errType + " on Line " + errLine + ": " + errMsg.replace("\"", "\\\"") + "\","
                        + "\"failedCase\":" + (i + 1) + ","
                        + "\"passed\":" + passedCount + ","
                        + "\"total\":" + inputs.size()
                        + "}");
                    return;
                }
            }

            resultsJson.append("]");

            System.out.println("{"
                + "\"success\":" + allPassed + ","
                + "\"status\":\"" + (allPassed ? "Accepted" : "Wrong Answer") + "\","
                + "\"passed\":" + passedCount + ","
                + "\"total\":" + inputs.size() + ","
                + "\"results\":" + resultsJson.toString()
                + "}");

        } catch (Exception e) {
            System.out.println("{\"success\":false,\"status\":\"Execution Error\",\"error\":\"" + e.getMessage() + "\",\"line\":1}");
        }
    }
}
