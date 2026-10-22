function makeTemplates(funcName, pySig, jsSig, javaSig, cppSig, pyRet = 'None', javaRet = 'void', cppRet = 'void') {
    return {
        python: `# ${funcName}\ndef ${funcName}(${pySig}):\n    # Write your solution below:\n    pass\n\n# Example execution:\n# print(${funcName}(...))\n`,
        javascript: `// ${funcName}\nfunction ${funcName}(${jsSig}) {\n    // Write your solution below:\n    \n}\n\n// console.log(${funcName}(...));\n`,
        java: `import java.util.*;\n\nclass Solution {\n    public ${javaRet} ${funcName}(${javaSig}) {\n        // Write your solution below:\n        return null;\n    }\n}\n`,
        c_cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppRet} ${funcName}(${cppSig}) {\n        // Write your solution below:\n        \n    }\n};\n`
    };
}

module.exports = {
    'Maximal Rectangle': {
        topic: 'Monotonic Stack',
        difficulty: 'Hard',
        tags: ['Array', 'Dynamic Programming', 'Stack', 'Matrix', 'Monotonic Stack'],
        description: 'Given a <code>rows x cols</code> binary <code>matrix</code> filled with <code>0</code>\'s and <code>1</code>\'s, find the largest rectangle containing only <code>1</code>\'s and return <em>its area</em>.',
        examples: [
            { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '6', explanation: 'The maximal rectangle has area = 6 formed by the 2x3 block in rows 1-2.' },
            { input: 'matrix = [["0"]]', output: '0', explanation: 'No 1s exist.' },
            { input: 'matrix = [["1"]]', output: '1', explanation: 'Single 1 has area 1.' }
        ],
        constraints: ['rows == matrix.length', 'cols == matrix[i].length', '1 <= row, cols <= 200', 'matrix[i][j] is \'0\' or \'1\'.'],
        hints: ['Maintain heights array for each row and apply Largest Rectangle in Histogram.'],
        templates: makeTemplates('maximalRectangle', 'matrix', 'matrix', 'char[][] matrix', 'vector<vector<char>>& matrix', 'int', 'int', 'int')
    },

    'Count Good Nodes in Binary Tree': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given a binary tree <code>root</code>, a node <em>X</em> in the tree is named <strong>good</strong> if in the path from the root to <em>X</em> there are no nodes with a value <em>greater than</em> X.<br><br>Return the number of <strong>good</strong> nodes in the binary tree.',
        examples: [
            { input: 'root = [3,1,4,3,null,1,5]', output: '4', explanation: 'Nodes in blue are good.\nRoot Node (3) is always a good node.\nNode 4 -> (3,4) is the maximum value in the path starting from the root.\nNode 5 -> (3,4,5) is the maximum value in the path\nNode 3 -> (3,1,3) is the maximum value.' },
            { input: 'root = [3,3,null,4,2]', output: '3', explanation: 'Node 2 is not good because "3" is higher than it.' },
            { input: 'root = [1]', output: '1', explanation: 'Root is always good.' }
        ],
        constraints: ['The number of nodes in the binary tree is in the range [1, 10^5].', '-10^4 <= Node.val <= 10^4'],
        hints: ['Traverse the tree passing down the maximum value seen so far on the path from root.'],
        templates: makeTemplates('goodNodes', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'int', 'int', 'int')
    },

    'Lowest Common Ancestor of a Binary Search Tree': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
        description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.<br><br>According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes <code>p</code> and <code>q</code> as the lowest node in <code>T</code> that has both <code>p</code> and <code>q</code> as descendants (where we allow <strong>a node to be a descendant of itself</strong>).”',
        examples: [
            { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6', explanation: 'The LCA of nodes 2 and 8 is 6.' },
            { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4', output: '2', explanation: 'The LCA of nodes 2 and 4 is 2, since a node can be a descendant of itself.' }
        ],
        constraints: ['The number of nodes in the tree is in the range [2, 10^5].', '-10^9 <= Node.val <= 10^9', 'All Node.val are unique.', 'p != q', 'p and q will exist in the BST.'],
        hints: ['Leverage the BST property: if both p and q are less than root, LCA is in left subtree; if both are greater, LCA is in right subtree; otherwise current node is LCA.'],
        templates: makeTemplates('lowestCommonAncestor', 'root, p, q', 'root, p, q', 'TreeNode root, TreeNode p, TreeNode q', 'TreeNode* root, TreeNode* p, TreeNode* q', 'TreeNode', 'TreeNode', 'TreeNode*')
    },

    'Binary Tree Right Side View': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, imagine yourself standing on the <strong>right side</strong> of it, return <em>the values of the nodes you can see ordered from top to bottom</em>.',
        examples: [
            { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]', explanation: 'Looking from the right, nodes 1, 3, 4 are visible.' },
            { input: 'root = [1,null,3]', output: '[1,3]', explanation: 'Only right branch is present.' },
            { input: 'root = []', output: '[]', explanation: 'Empty tree.' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
        hints: ['Level order traversal: the rightmost node at each level is visible from the right side.'],
        templates: makeTemplates('rightSideView', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'list', 'List<Integer>', 'vector<int>')
    },

    'Construct Binary Tree from Preorder and Inorder Traversal': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'],
        description: 'Given two integer arrays <code>preorder</code> and <code>inorder</code> where <code>preorder</code> is the preorder traversal of a binary tree and <code>inorder</code> is the inorder traversal of the same tree, construct and return <em>the binary tree</em>.',
        examples: [
            { input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]', explanation: 'Root is 3. Inorder split gives left subtree [9] and right subtree [15, 20, 7].' },
            { input: 'preorder = [-1], inorder = [-1]', output: '[-1]', explanation: 'Single node tree.' }
        ],
        constraints: ['1 <= preorder.length <= 3000', 'inorder.length == preorder.length', '-3000 <= preorder[i], inorder[i] <= 3000', 'preorder and inorder consist of unique values.'],
        hints: ['The first element in preorder is always the root node.', 'Find the root\'s index in inorder: everything to the left is in the left subtree, everything to the right is in the right subtree.'],
        templates: makeTemplates('buildTree', 'preorder, inorder', 'preorder, inorder', 'int[] preorder, int[] inorder', 'vector<int>& preorder, vector<int>& inorder', 'TreeNode', 'TreeNode', 'TreeNode*')
    },

    'Kth Smallest Element in a BST': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary search tree, and an integer <code>k</code>, return <em>the <code>k<sup>th</sup></code> smallest value (<strong>1-indexed</strong>) of all the values of the nodes in the tree</em>.',
        examples: [
            { input: 'root = [3,1,4,null,2], k = 1', output: '1', explanation: 'Inorder traversal [1, 2, 3, 4] gives 1 as the 1st smallest.' },
            { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3', explanation: 'Inorder traversal [1, 2, 3, 4, 5, 6] gives 3 as the 3rd smallest.' }
        ],
        constraints: ['The number of nodes in the tree is n.', '1 <= k <= n <= 10^4', '0 <= Node.val <= 10^4'],
        hints: ['An inorder traversal of a BST visits nodes in strictly ascending order.', 'Stop traversal as soon as you have visited k elements.'],
        templates: makeTemplates('kthSmallest', 'root, k', 'root, k', 'TreeNode root, int k', 'TreeNode* root, int k', 'int', 'int', 'int')
    },

    'Balanced Binary Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
        description: 'Given a binary tree, determine if it is <strong>height-balanced</strong>.<br><br>A <strong>height-balanced</strong> binary tree is defined as a binary tree in which the left and right subtrees of <em>every</em> node differ in height by no more than 1.',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: 'true', explanation: 'Max depth of left subtree is 1, max depth of right subtree is 2. Difference is 1 <= 1.' },
            { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false', explanation: 'Left branch has depth 3 while right branch has depth 1. Difference is 2 > 1.' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 5000].', '-10^4 <= Node.val <= 10^4'],
        hints: ['Compute height bottom-up. Return -1 immediately if any subtree is unbalanced.'],
        templates: makeTemplates('isBalanced', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'bool', 'boolean', 'bool')
    },

    'Same Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the roots of two binary trees <code>p</code> and <code>q</code>, write a function to check if they are the same or not.<br><br>Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.',
        examples: [
            { input: 'p = [1,2,3], q = [1,2,3]', output: 'true', explanation: 'Both trees have identical values and topology.' },
            { input: 'p = [1,2], q = [1,null,2]', output: 'false', explanation: 'Structures differ.' }
        ],
        constraints: ['The number of nodes in both trees is in the range [0, 100].', '-10^4 <= Node.val <= 10^4'],
        hints: ['If both p and q are null, return true. If one is null or values differ, return false.'],
        templates: makeTemplates('isSameTree', 'p, q', 'p, q', 'TreeNode p, TreeNode q', 'TreeNode* p, TreeNode* q', 'bool', 'boolean', 'bool')
    },

    'Subtree of Another Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'String Matching', 'Binary Tree', 'Hash Function'],
        description: 'Given the roots of two binary trees <code>root</code> and <code>subRoot</code>, return <code>true</code> if there is a subtree of <code>root</code> with the same structure and node values of <code>subRoot</code> and <code>false</code> otherwise.<br><br>A subtree of a binary tree <code>tree</code> is a tree that consists of a node in <code>tree</code> and all of this node\'s descendants.',
        examples: [
            { input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true', explanation: 'The subtree rooted at 4 matches subRoot.' },
            { input: 'root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]', output: 'false', explanation: 'Node 2 has an additional child 0 in root, so it does not match.' }
        ],
        constraints: ['The number of nodes in the root tree is in the range [1, 2000].', 'The number of nodes in the subRoot tree is in the range [1, 1000].', '-10^4 <= root.val, subRoot.val <= 10^4'],
        hints: ['For each node in root, check if isSameTree(curr, subRoot) is true.'],
        templates: makeTemplates('isSubtree', 'root, subRoot', 'root, subRoot', 'TreeNode root, TreeNode subRoot', 'TreeNode* root, TreeNode* subRoot', 'bool', 'boolean', 'bool')
    },

    'Pacific Atlantic Water Flow': {
        topic: 'Graphs & BFS',
        difficulty: 'Medium',
        tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
        description: 'There is an <code>m x n</code> rectangular island that borders both the <strong>Pacific Ocean</strong> and <strong>Atlantic Ocean</strong>. The Pacific Ocean touches the island\'s left and top edges, and the Atlantic Ocean touches the island\'s right and bottom edges.<br><br>Return a <strong>2D list</strong> of grid coordinates <code>result</code> where <code>result[i] = [r<sub>i</sub>, c<sub>i</sub>]</code> denotes that rain water can flow from cell <code>(r<sub>i</sub>, c<sub>i</sub>)</code> to <strong>both</strong> the Pacific and Atlantic oceans.',
        examples: [
            { input: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]', explanation: 'Water from these coordinates can reach both oceans.' },
            { input: 'heights = [[1]]', output: '[[0,0]]', explanation: 'Single cell connects to both oceans.' }
        ],
        constraints: ['m == heights.length', 'n == heights[r].length', '1 <= m, n <= 200', '0 <= heights[r][c] <= 10^5'],
        hints: ['Reverse the flow: search inward from the Pacific borders and Atlantic borders using BFS/DFS going uphill.', 'Find cells reachable by both searches.'],
        templates: makeTemplates('pacificAtlantic', 'heights', 'heights', 'int[][] heights', 'vector<vector<int>>& heights', 'list', 'List<List<Integer>>', 'vector<vector<int>>')
    },

    'Surrounded Regions': {
        topic: 'Graphs & BFS',
        difficulty: 'Medium',
        tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
        description: 'You are given an <code>m x n</code> matrix <code>board</code> containing <code>\'X\'</code> and <code>\'O\'</code>. Capture all regions that are <strong>surrounded by</strong> <code>\'X\'</code>.<br><br>A region is <strong>captured</strong> by flipping all <code>\'O\'</code>s into <code>\'X\'</code>s in that surrounded region. An \'O\' on the border can never be captured.',
        examples: [
            { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', explanation: 'The inner \'O\'s are captured. The border \'O\' at (3,1) cannot be captured.' },
            { input: 'board = [["X"]]', output: '[["X"]]', explanation: 'No change.' }
        ],
        constraints: ['m == board.length', 'n == board[i].length', '1 <= m, n <= 200', 'board[i][j] is \'X\' or \'O\'.'],
        hints: ['Find all \'O\'s on the border and run BFS/DFS to mark them as non-capturable (e.g., mark as \'E\').', 'Flip remaining \'O\'s to \'X\', and restore \'E\' back to \'O\'.'],
        templates: makeTemplates('solve', 'board', 'board', 'char[][] board', 'vector<vector<char>>& board', 'None', 'void', 'void')
    },

    'Walls and Gates': {
        topic: 'Graphs & BFS',
        difficulty: 'Medium',
        tags: ['Array', 'Breadth-First Search', 'Matrix'],
        description: 'You are given an <code>m x n</code> grid <code>rooms</code> initialized with these three possible values:<ul><li><code>-1</code>: A wall or an obstacle.</li><li><code>0</code>: A gate.</li><li><code>INF (2147483647)</code>: An empty room.</li></ul>Fill each empty room with the distance to its <em>nearest gate</em>. If it is impossible to reach a gate, it should be filled with <code>INF</code>.',
        examples: [
            { input: 'rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]', output: '[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]', explanation: 'Each cell contains the shortest path distance to the closest gate (0).' }
        ],
        constraints: ['m == rooms.length', 'n == rooms[i].length', '1 <= m, n <= 250', 'rooms[i][j] is -1, 0, or 2^31 - 1.'],
        hints: ['Multi-source BFS starting from all gates simultaneously.'],
        templates: makeTemplates('wallsAndGates', 'rooms', 'rooms', 'int[][] rooms', 'vector<vector<int>>& rooms', 'None', 'void', 'void')
    },

    'Design Add and Search Words Data Structure': {
        topic: 'Trie',
        difficulty: 'Medium',
        tags: ['String', 'Depth-First Search', 'Design', 'Trie'],
        description: 'Design a data structure that supports adding new words and finding if a string matches any previously added string.<br><br>Implement the <code>WordDictionary</code> class:<ul><li><code>WordDictionary()</code> Initializes the object.</li><li><code>void addWord(word)</code> Adds <code>word</code> to the data structure, it can be matched later.</li><li><code>bool search(word)</code> Returns <code>true</code> if there is any string in the data structure that matches <code>word</code> or <code>false</code> otherwise. <code>word</code> may contain dots <code>\'.\'</code> where dots can be matched with any letter.</li></ul>',
        examples: [
            { input: '["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]', output: '[null,null,null,null,false,true,true,true]', explanation: 'WordDictionary wordDictionary = new WordDictionary();\nwordDictionary.addWord("bad");\nwordDictionary.addWord("dad");\nwordDictionary.addWord("mad");\nwordDictionary.search("pad"); // return False\nwordDictionary.search("bad"); // return True\nwordDictionary.search(".ad"); // return True\nwordDictionary.search("b.."); // return True' }
        ],
        constraints: ['1 <= word.length <= 25', 'word in addWord consists of lowercase English letters.', 'word in search consist of \'.\' or lowercase English letters.', 'At most 10^4 calls will be made to addWord and search.'],
        hints: ['Use a Trie. When encountering \'.\', recursively check all 26 child branches.'],
        templates: {
            python: `class WordDictionary:\n    def __init__(self):\n        self.trie = {}\n\n    def addWord(self, word: str) -> None:\n        curr = self.trie\n        for c in word:\n            if c not in curr: curr[c] = {}\n            curr = curr[c]\n        curr['$'] = True\n\n    def search(self, word: str) -> bool:\n        def dfs(node, idx):\n            if idx == len(word): return '$' in node\n            c = word[idx]\n            if c == '.':\n                for k in node:\n                    if k != '$' and dfs(node[k], idx + 1): return True\n                return False\n            if c not in node: return False\n            return dfs(node[c], idx + 1)\n        return dfs(self.trie, 0)\n`,
            javascript: `var WordDictionary = function() {\n    this.trie = {};\n};\n\nWordDictionary.prototype.addWord = function(word) {\n    let node = this.trie;\n    for (let c of word) {\n        if (!node[c]) node[c] = {};\n        node = node[c];\n    }\n    node.isWord = true;\n};\n\nWordDictionary.prototype.search = function(word) {\n    function dfs(node, idx) {\n        if (idx === word.length) return !!node.isWord;\n        const c = word[idx];\n        if (c === '.') {\n            for (let k of Object.keys(node)) {\n                if (k !== 'isWord' && dfs(node[k], idx + 1)) return true;\n            }\n            return false;\n        }\n        if (!node[c]) return false;\n        return dfs(node[c], idx + 1);\n    }\n    return dfs(this.trie, 0);\n};\n`,
            java: `class WordDictionary {\n    private class Node {\n        Node[] children = new Node[26];\n        boolean isWord = false;\n    }\n    private Node root = new Node();\n\n    public WordDictionary() {}\n\n    public void addWord(String word) {\n        Node curr = root;\n        for (char c : word.toCharArray()) {\n            if (curr.children[c - 'a'] == null) curr.children[c - 'a'] = new Node();\n            curr = curr.children[c - 'a'];\n        }\n        curr.isWord = true;\n    }\n\n    public boolean search(String word) {\n        return dfs(word, 0, root);\n    }\n\n    private boolean dfs(String word, int idx, Node node) {\n        if (node == null) return false;\n        if (idx == word.length()) return node.isWord;\n        char c = word.charAt(idx);\n        if (c == '.') {\n            for (Node child : node.children) {\n                if (child != null && dfs(word, idx + 1, child)) return true;\n            }\n            return false;\n        }\n        return dfs(word, idx + 1, node.children[c - 'a']);\n    }\n}\n`,
            c_cpp: `class WordDictionary {\n    struct Node {\n        Node* children[26] = {};\n        bool isWord = false;\n    } *root;\npublic:\n    WordDictionary() { root = new Node(); }\n    void addWord(string word) {\n        Node* curr = root;\n        for (char c : word) {\n            if (!curr->children[c - 'a']) curr->children[c - 'a'] = new Node();\n            curr = curr->children[c - 'a'];\n        }\n        curr->isWord = true;\n    }\n    bool search(string word) { return dfs(word, 0, root); }\n    bool dfs(const string& word, int idx, Node* node) {\n        if (!node) return false;\n        if (idx == word.size()) return node->isWord;\n        char c = word[idx];\n        if (c == '.') {\n            for (int i = 0; i < 26; i++) {\n                if (node->children[i] && dfs(word, idx + 1, node->children[i])) return true;\n            }\n            return false;\n        }\n        return dfs(word, idx + 1, node->children[c - 'a']);\n    }\n};\n`
        }
    },

    'Palindromic Substrings': {
        topic: 'Strings & Dynamic Programming',
        difficulty: 'Medium',
        tags: ['String', 'Dynamic Programming'],
        description: 'Given a string <code>s</code>, return <em>the number of <strong>palindromic substrings</strong> in it</em>.<br><br>A string is a <strong>palindrome</strong> when it reads the same backward as forward. A <strong>substring</strong> is a contiguous sequence of characters within the string.',
        examples: [
            { input: 's = "abc"', output: '3', explanation: 'Three palindromic strings: "a", "b", "c".' },
            { input: 's = "aaa"', output: '6', explanation: 'Six palindromic strings: "a", "a", "a", "aa", "aa", "aaa".' }
        ],
        constraints: ['1 <= s.length <= 1000', 's consists of lowercase English letters.'],
        hints: ['Expand around center for each index i: (i, i) and (i, i + 1). Count each valid expansion.'],
        templates: makeTemplates('countSubstrings', 's', 's', 'String s', 'string s', 'int', 'int', 'int')
    },

    'Word Break II': {
        topic: 'Backtracking & Dynamic Programming',
        difficulty: 'Hard',
        tags: ['Array', 'Hash Table', 'String', 'Dynamic Programming', 'Backtracking', 'Trie', 'Memoization'],
        description: 'Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, add spaces in <code>s</code> to construct a sentence where each word is a valid dictionary word. Return all such possible sentences in <strong>any order</strong>.<br><br><strong>Note</strong> that the same word in the dictionary may be reused multiple times in the segmentation.',
        examples: [
            { input: 's = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]', output: '["cats and dog","cat sand dog"]', explanation: 'Two valid sentence segmentations exist.' },
            { input: 's = "pineapplepenapple", wordDict = ["apple","pen","applepen","pine","pineapple"]', output: '["pine apple pen apple","pineapple pen apple","pine applepen apple"]', explanation: 'Words in wordDict can be reused.' }
        ],
        constraints: ['1 <= s.length <= 20', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 10', 's and wordDict[i] consist of only lowercase English letters.'],
        hints: ['Use recursion with memoization (DFS).'],
        templates: makeTemplates('wordBreak', 's, wordDict', 's, wordDict', 'String s, List<String> wordDict', 'string s, vector<string>& wordDict', 'list', 'List<String>', 'vector<string>')
    },

    'Russian Doll Envelopes': {
        topic: 'Dynamic Programming & Binary Search',
        difficulty: 'Hard',
        tags: ['Array', 'Binary Search', 'Dynamic Programming', 'Sorting'],
        description: 'You are given a 2D array of integers <code>envelopes</code> where <code>envelopes[i] = [w<sub>i</sub>, h<sub>i</sub>]</code> represents the width and the height of an envelope.<br><br>One envelope can fit into another if and only if both the width and height of one envelope are strictly greater than the other envelope\'s width and height.<br><br>Return <em>the maximum number of envelopes you can Russian doll (i.e., put one inside the other)</em>.<br><br><strong>Note:</strong> You cannot rotate an envelope.',
        examples: [
            { input: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]', output: '3', explanation: 'The maximum number of envelopes you can Russian doll is 3 ([2,3] => [5,4] => [6,7]).' },
            { input: 'envelopes = [[1,1],[1,1],[1,1]]', output: '1', explanation: 'Identical envelopes cannot contain each other.' }
        ],
        constraints: ['1 <= envelopes.length <= 10^5', 'envelopes[i].length == 2', '1 <= w_i, h_i <= 10^5'],
        hints: ['Sort envelopes ascending by width, and descending by height for equal widths.', 'Then apply Longest Increasing Subsequence on heights using binary search in O(n log n).'],
        templates: makeTemplates('maxEnvelopes', 'envelopes', 'envelopes', 'int[][] envelopes', 'vector<vector<int>>& envelopes', 'int', 'int', 'int')
    },

    'Best Time to Buy and Sell Stock II': {
        topic: 'Greedy',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Greedy'],
        description: 'You are given an integer array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day.<br><br>On each day, you may decide to buy and/or sell the stock. You can only hold <strong>at most one</strong> share of the stock at any time. However, you can buy it then immediately sell it on the <strong>same day</strong>.<br><br>Find and return <em>the <strong>maximum profit</strong> you can achieve</em>.',
        examples: [
            { input: 'prices = [7,1,5,3,6,4]', output: '7', explanation: 'Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = 5 - 1 = 4.\nThen buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = 6 - 3 = 3.\nTotal profit is 4 + 3 = 7.' },
            { input: 'prices = [1,2,3,4,5]', output: '4', explanation: 'Buy on day 1 (price = 1) and sell on day 5 (price = 5), profit = 5 - 1 = 4.' }
        ],
        constraints: ['1 <= prices.length <= 3 * 10^4', '0 <= prices[i] <= 10^4'],
        hints: ['Greedy approach: accumulate profit whenever prices[i] > prices[i - 1].'],
        templates: makeTemplates('maxProfit', 'prices', 'prices', 'int[] prices', 'vector<int>& prices', 'int', 'int', 'int')
    },

    'Coin Change II': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming'],
        description: 'You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money.<br><br>Return <em>the number of combinations that make up that amount</em>. If that amount of money cannot be made up by any combination of the coins, return <code>0</code>.<br><br>You may assume that you have an infinite number of each kind of coin.',
        examples: [
            { input: 'amount = 5, coins = [1,2,5]', output: '4', explanation: 'There are four ways to make up the amount:\n5=5\n5=2+2+1\n5=2+1+1+1\n5=1+1+1+1+1' },
            { input: 'amount = 3, coins = [2]', output: '0', explanation: 'Cannot make 3.' }
        ],
        constraints: ['1 <= coins.length <= 300', '1 <= coins[i] <= 5000', '0 <= amount <= 5000'],
        hints: ['dp[i] represents number of ways to make amount i.', 'Outer loop over coins, inner loop over amounts from coin to amount.'],
        templates: makeTemplates('change', 'amount, coins', 'amount, coins', 'int amount, int[] coins', 'int amount, vector<int>& coins', 'int', 'int', 'int')
    },

    'Majority Element II': {
        topic: 'Arrays & Counting',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'Sorting', 'Counting'],
        description: 'Given an integer array of size <code>n</code>, find all elements that appear more than <code>⌊ n/3 ⌋</code> times.<br><br>Could you solve the problem in linear time and in <code>O(1)</code> space?',
        examples: [
            { input: 'nums = [3,2,3]', output: '[3]', explanation: '3 appears 2 times, which is > 3/3.' },
            { input: 'nums = [1]', output: '[1]', explanation: '1 appears 1 time, > 1/3.' },
            { input: 'nums = [1,2]', output: '[1,2]', explanation: 'Both appear 1 time, > 2/3.' }
        ],
        constraints: ['1 <= nums.length <= 5 * 10^4', '-10^9 <= nums[i] <= 10^9'],
        hints: ['There can be at most two elements with frequency > n/3.', 'Use generalized Boyer-Moore voting with two candidate variables and two counters.'],
        templates: makeTemplates('majorityElement', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'list', 'List<Integer>', 'vector<int>')
    },

    'Contains Duplicate III': {
        topic: 'Sliding Window & Bucket',
        difficulty: 'Hard',
        tags: ['Array', 'Sliding Window', 'Sorting', 'Bucket Sort', 'Ordered Set'],
        description: 'You are given an integer array <code>nums</code> and two integers <code>indexDiff</code> and <code>valueDiff</code>.<br><br>Find a pair of indices <code>(i, j)</code> such that:<ul><li><code>i != j</code>,</li><li><code>abs(i - j) <= indexDiff</code>.</li><li><code>abs(nums[i] - nums[j]) <= valueDiff</code>, and</li></ul>Return <code>true</code> <em>if such a pair exists or <code>false</code> otherwise</em>.',
        examples: [
            { input: 'nums = [1,2,3,1], indexDiff = 3, valueDiff = 0', output: 'true', explanation: 'Indices 0 and 3 satisfy both conditions.' },
            { input: 'nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3', output: 'false', explanation: 'No pair satisfies both conditions.' }
        ],
        constraints: ['2 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9', '1 <= indexDiff <= nums.length', '0 <= valueDiff <= 10^9'],
        hints: ['Bucket sort with bucket width = valueDiff + 1 allows checking neighbors in O(1) time.'],
        templates: makeTemplates('containsNearbyAlmostDuplicate', 'nums, indexDiff, valueDiff', 'nums, indexDiff, valueDiff', 'int[] nums, int indexDiff, int valueDiff', 'vector<int>& nums, int indexDiff, int valueDiff', 'bool', 'boolean', 'bool')
    },

    'Next Greater Element II': {
        topic: 'Monotonic Stack',
        difficulty: 'Medium',
        tags: ['Array', 'Stack', 'Monotonic Stack'],
        description: 'Given a circular integer array <code>nums</code> (i.e., the next element of <code>nums[nums.length - 1]</code> is <code>nums[0]</code>), return <em>the <strong>next greater number</strong> for every element in <code>nums</code></em>.<br><br>The <strong>next greater number</strong> of a number <code>x</code> is the first greater number to its traversing-order next in the array, which means you could search circularly to find its next greater number. If it doesn\'t exist, return <code>-1</code> for this number.',
        examples: [
            { input: 'nums = [1,2,1]', output: '[2,-1,2]', explanation: 'The first 1\'s next greater is 2; 2 has no greater element (-1); second 1\'s next greater circularly is 2.' },
            { input: 'nums = [1,2,3,4,3]', output: '[2,3,4,-1,4]', explanation: 'Next greater elements with circular wrap.' }
        ],
        constraints: ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
        hints: ['Simulate array concatenation by iterating through 2 * n elements and using modulo i % n.'],
        templates: makeTemplates('nextGreaterElements', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'list', 'int[]', 'vector<int>')
    }
};
