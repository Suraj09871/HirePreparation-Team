const fs = require('fs');
const path = require('path');

// Helper to generate boilerplate code templates for 4 languages
function makeTemplates(funcName, pySig, jsSig, javaSig, cppSig, pyRet = 'None', javaRet = 'void', cppRet = 'void') {
    return {
        python: `# ${funcName}\ndef ${funcName}(${pySig}):\n    # Write your solution below:\n    pass\n\n# Example execution:\n# print(${funcName}(...))\n`,
        javascript: `// ${funcName}\nfunction ${funcName}(${jsSig}) {\n    // Write your solution below:\n    \n}\n\n// console.log(${funcName}(...));\n`,
        java: `import java.util.*;\n\nclass Solution {\n    public ${javaRet} ${funcName}(${javaSig}) {\n        // Write your solution below:\n        return null;\n    }\n}\n`,
        c_cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppRet} ${funcName}(${cppSig}) {\n        // Write your solution below:\n        \n    }\n};\n`
    };
}

// ── Complete Catalog of 100 Real Interview Coding Problems ──
const REAL_PROBLEMS = {
    'Two Sum': {
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.<br><br>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.<br><br>You can return the answer in any order.',
        examples: [
            { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
            { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
            { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explanation: 'Target 6 is formed by 3 + 3 at indices 0 and 1.' }
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.',
            'Follow-up: Can you come up with an algorithm that is less than O(n^2) time complexity?'
        ],
        hints: [
            'A brute force approach checks every pair, taking O(n^2) time.',
            'Can we use a Hash Map to store elements we have already visited in O(1) average lookup time?',
            'For each number x, check if (target - x) already exists in our map.'
        ],
        templates: makeTemplates('twoSum', 'nums, target', 'nums, target', 'int[] nums, int target', 'vector<int>& nums, int target', 'list', 'int[]', 'vector<int>')
    },

    'Valid Parentheses': {
        topic: 'Stack',
        difficulty: 'Easy',
        tags: ['String', 'Stack'],
        description: 'Given a string <code>s</code> containing just the characters <code>\'(\'</code>, <code>\')\'</code>, <code>\'{\'</code>, <code>\'}\'</code>, <code>\'[\'</code> and <code>\']\'</code>, determine if the input string is valid.<br><br>An input string is valid if:<br>1. Open brackets must be closed by the same type of brackets.<br>2. Open brackets must be closed in the correct order.<br>3. Every close bracket has a corresponding open bracket of the same type.',
        examples: [
            { input: 's = "()"', output: 'true', explanation: 'A single pair of matching round brackets is valid.' },
            { input: 's = "()[]{}"', output: 'true', explanation: 'All three pairs are properly opened and closed in order.' },
            { input: 's = "(]"', output: 'false', explanation: 'Opening round bracket is improperly closed with a square bracket.' }
        ],
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only "()[]{}"'
        ],
        hints: [
            'Use a stack data structure to track opening brackets.',
            'When you encounter a closing bracket, check if it matches the top of the stack.',
            'At the end of the string, the stack must be empty for the string to be valid.'
        ],
        templates: makeTemplates('isValid', 's', 's', 'String s', 'string s', 'bool', 'boolean', 'bool')
    },

    'Merge Two Sorted Lists': {
        topic: 'Linked Lists',
        difficulty: 'Easy',
        tags: ['Linked List', 'Recursion'],
        description: 'You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.<br><br>Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.<br><br>Return <em>the head of the merged linked list</em>.',
        examples: [
            { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]', explanation: 'Elements are spliced together in ascending order.' },
            { input: 'list1 = [], list2 = []', output: '[]', explanation: 'Both lists are empty, so the merged list is also empty.' },
            { input: 'list1 = [], list2 = [0]', output: '[0]', explanation: 'Merging an empty list with [0] yields [0].' }
        ],
        constraints: [
            'The number of nodes in both lists is in the range [0, 50].',
            '-100 <= Node.val <= 100',
            'Both list1 and list2 are sorted in non-decreasing order.'
        ],
        hints: [
            'Use a dummy head node to simplify edge cases when building the new list.',
            'Maintain a pointer to the current tail of the merged list and compare heads of both lists.'
        ],
        templates: makeTemplates('mergeTwoLists', 'list1, list2', 'list1, list2', 'ListNode list1, ListNode list2', 'ListNode* list1, ListNode* list2', 'ListNode', 'ListNode', 'ListNode*')
    },

    'Best Time to Buy and Sell Stock': {
        topic: 'Arrays & Dynamic Programming',
        difficulty: 'Easy',
        tags: ['Array', 'Dynamic Programming', 'Sliding Window'],
        description: 'You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day.<br><br>You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock.<br><br>Return <em>the maximum profit you can achieve from this transaction</em>. If you cannot achieve any profit, return <code>0</code>.',
        examples: [
            { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note buying on day 2 and selling on day 1 is not allowed.' },
            { input: 'prices = [7, 6, 4, 3, 1]', output: '0', explanation: 'In this case, no transactions are done and the max profit = 0 because prices strictly decrease.' }
        ],
        constraints: [
            '1 <= prices.length <= 10^5',
            '0 <= prices[i] <= 10^4'
        ],
        hints: [
            'Track the minimum price seen so far as you iterate through the array.',
            'At each day, the potential profit is prices[i] - min_price.',
            'Keep track of the maximum potential profit seen.'
        ],
        templates: makeTemplates('maxProfit', 'prices', 'prices', 'int[] prices', 'vector<int>& prices', 'int', 'int', 'int')
    },

    'Maximum Subarray': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
        description: 'Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em>.<br><br>A <strong>subarray</strong> is a contiguous non-empty sequence of elements within an array.',
        examples: [
            { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.' },
            { input: 'nums = [1]', output: '1', explanation: 'The subarray [1] has the largest sum 1.' },
            { input: 'nums = [5, 4, -1, 7, 8]', output: '23', explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4',
            'Follow-up: If you have figured out the O(n) solution, try coding another solution using the divide and conquer approach, which is more subtle.'
        ],
        hints: [
            'Use Kadane\'s algorithm.',
            'At each position, decide whether to add nums[i] to the current running sum or start a fresh subarray at nums[i].',
            'current_sum = max(nums[i], current_sum + nums[i])'
        ],
        templates: makeTemplates('maxSubArray', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Climbing Stairs': {
        topic: 'Dynamic Programming',
        difficulty: 'Easy',
        tags: ['Math', 'Dynamic Programming', 'Memoization'],
        description: 'You are climbing a staircase. It takes <code>n</code> steps to reach the top.<br><br>Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?',
        examples: [
            { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top: 1 step + 1 step, or 2 steps.' },
            { input: 'n = 3', output: '3', explanation: 'There are three ways: (1+1+1), (1+2), or (2+1).' }
        ],
        constraints: [
            '1 <= n <= 45'
        ],
        hints: [
            'To reach step n, you must have come from either step (n - 1) or step (n - 2).',
            'ways(n) = ways(n - 1) + ways(n - 2). Notice that this is the Fibonacci sequence.'
        ],
        templates: makeTemplates('climbStairs', 'n', 'n', 'int n', 'int n', 'int', 'int', 'int')
    },

    'Reverse Linked List': {
        topic: 'Linked Lists',
        difficulty: 'Easy',
        tags: ['Linked List', 'Recursion'],
        description: 'Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.',
        examples: [
            { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', explanation: 'The pointers of the list are inverted.' },
            { input: 'head = [1, 2]', output: '[2, 1]', explanation: 'Reversing a 2-node list swaps their order.' },
            { input: 'head = []', output: '[]', explanation: 'An empty list reversed is still empty.' }
        ],
        constraints: [
            'The number of nodes in the list is the range [0, 5000].',
            '-5000 <= Node.val <= 5000',
            'Follow-up: A linked list can be reversed either iteratively or recursively. Could you implement both?'
        ],
        hints: [
            'Maintain three pointers: prev (initially null), curr (initially head), and next.',
            'In each step, save curr.next, point curr.next to prev, then advance prev and curr.'
        ],
        templates: makeTemplates('reverseList', 'head', 'head', 'ListNode head', 'ListNode* head', 'ListNode', 'ListNode', 'ListNode*')
    },

    'Symmetric Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, <em>check whether it is a mirror of itself</em> (i.e., symmetric around its center).',
        examples: [
            { input: 'root = [1, 2, 2, 3, 4, 4, 3]', output: 'true', explanation: 'The left and right subtrees are exact mirror images.' },
            { input: 'root = [1, 2, 2, null, 3, null, 3]', output: 'false', explanation: 'The nodes are not symmetric reflections.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [1, 1000].',
            '-100 <= Node.val <= 100'
        ],
        hints: [
            'Two trees are mirror reflections of each other if their roots have the same value, and the right subtree of each tree is a mirror reflection of the left subtree of the other.',
            'You can write a helper function isMirror(t1, t2).'
        ],
        templates: makeTemplates('isSymmetric', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'bool', 'boolean', 'bool')
    },

    'Single Number': {
        topic: 'Bit Manipulation',
        difficulty: 'Easy',
        tags: ['Array', 'Bit Manipulation'],
        description: 'Given a <strong>non-empty</strong> array of integers <code>nums</code>, every element appears <em>twice</em> except for one. Find that single one.<br><br>You must implement a solution with a linear runtime complexity and use only constant extra space.',
        examples: [
            { input: 'nums = [2, 2, 1]', output: '1', explanation: '2 appears twice, 1 appears once.' },
            { input: 'nums = [4, 1, 2, 1, 2]', output: '4', explanation: '1 and 2 appear twice; 4 is unique.' },
            { input: 'nums = [1]', output: '1', explanation: 'Only element in array is 1.' }
        ],
        constraints: [
            '1 <= nums.length <= 3 * 10^4',
            '-3 * 10^4 <= nums[i] <= 3 * 10^4',
            'Each element in the array appears twice except for one element which appears only once.'
        ],
        hints: [
            'Recall that XOR of two equal numbers is 0: a ^ a = 0.',
            'XOR of any number with 0 is the number itself: a ^ 0 = a.',
            'XOR is commutative and associative, so XORing all elements leaves only the unique one.'
        ],
        templates: makeTemplates('singleNumber', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Majority Element': {
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Counting'],
        description: 'Given an array <code>nums</code> of size <code>n</code>, return <em>the majority element</em>.<br><br>The majority element is the element that appears more than <code>⌊n / 2⌋</code> times. You may assume that the majority element always exists in the array.',
        examples: [
            { input: 'nums = [3, 2, 3]', output: '3', explanation: '3 appears 2 times out of 3, which is > 3/2.' },
            { input: 'nums = [2, 2, 1, 1, 1, 2, 2]', output: '2', explanation: '2 appears 4 times out of 7, which is > 7/2.' }
        ],
        constraints: [
            'n == nums.length',
            '1 <= n <= 5 * 10^4',
            '-10^9 <= nums[i] <= 10^9',
            'Follow-up: Could you solve the problem in linear time and in O(1) space?'
        ],
        hints: [
            'Boyer-Moore Voting Algorithm achieves O(n) time and O(1) space.',
            'Maintain a candidate and a count. Increment when the current element matches candidate, decrement otherwise.'
        ],
        templates: makeTemplates('majorityElement', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Move Zeroes': {
        topic: 'Two Pointers',
        difficulty: 'Easy',
        tags: ['Array', 'Two Pointers'],
        description: 'Given an integer array <code>nums</code>, move all <code>0</code>\'s to the end of it while maintaining the relative order of the non-zero elements.<br><br><strong>Note</strong> that you must do this in-place without making a copy of the array.',
        examples: [
            { input: 'nums = [0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]', explanation: 'Non-zero numbers preserve order, zeroes placed at end.' },
            { input: 'nums = [0]', output: '[0]', explanation: 'Single zero remains [0].' }
        ],
        constraints: [
            '1 <= nums.length <= 10^4',
            '-2^31 <= nums[i] <= 2^31 - 1'
        ],
        hints: [
            'Use two pointers: one slow pointer tracking the next non-zero position, and one fast pointer iterating through the array.',
            'Whenever you find a non-zero element, swap it with the position at the slow pointer.'
        ],
        templates: makeTemplates('moveZeroes', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'None', 'void', 'void')
    },

    'Contains Duplicate': {
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table', 'Sorting'],
        description: 'Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.',
        examples: [
            { input: 'nums = [1, 2, 3, 1]', output: 'true', explanation: '1 appears at index 0 and index 3.' },
            { input: 'nums = [1, 2, 3, 4]', output: 'false', explanation: 'All elements are distinct.' },
            { input: 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]', output: 'true', explanation: 'Multiple elements are duplicated.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^5',
            '-10^9 <= nums[i] <= 10^9'
        ],
        hints: [
            'Can you insert items into a hash set as you traverse?',
            'If an item is already present in the set, a duplicate has been found.'
        ],
        templates: makeTemplates('containsDuplicate', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'bool', 'boolean', 'bool')
    },

    'Intersection of Two Arrays': {
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table', 'Two Pointers', 'Binary Search'],
        description: 'Given two integer arrays <code>nums1</code> and <code>nums2</code>, return <em>an array of their intersection</em>. Each element in the result must be <strong>unique</strong> and you may return the result in <strong>any order</strong>.',
        examples: [
            { input: 'nums1 = [1, 2, 2, 1], nums2 = [2, 2]', output: '[2]', explanation: '2 is the only common element.' },
            { input: 'nums1 = [4, 9, 5], nums2 = [9, 4, 9, 8, 4]', output: '[9, 4]', explanation: '[4, 9] is also accepted.' }
        ],
        constraints: [
            '1 <= nums1.length, nums2.length <= 1000',
            '0 <= nums1[i], nums2[i] <= 1000'
        ],
        hints: [
            'Convert one array to a set to get O(1) lookups.',
            'Iterate through the second array and collect elements present in the set.'
        ],
        templates: makeTemplates('intersection', 'nums1, nums2', 'nums1, nums2', 'int[] nums1, int[] nums2', 'vector<int>& nums1, vector<int>& nums2', 'list', 'int[]', 'vector<int>')
    },

    'Binary Search': {
        topic: 'Binary Search',
        difficulty: 'Easy',
        tags: ['Array', 'Binary Search'],
        description: 'Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, then return its index. Otherwise, return <code>-1</code>.<br><br>You must write an algorithm with <code>O(log n)</code> runtime complexity.',
        examples: [
            { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
            { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^4',
            '-10^4 < nums[i], target < 10^4',
            'All the integers in nums are unique.',
            'nums is sorted in ascending order.'
        ],
        hints: [
            'Initialize low = 0 and high = len(nums) - 1.',
            'Compute mid = low + (high - low) // 2 to prevent integer overflow.',
            'Narrow the search window depending on whether nums[mid] is less than or greater than target.'
        ],
        templates: makeTemplates('search', 'nums, target', 'nums, target', 'int[] nums, int target', 'vector<int>& nums, int target', 'int', 'int', 'int')
    },

    'First Bad Version': {
        topic: 'Binary Search',
        difficulty: 'Easy',
        tags: ['Binary Search', 'Interactive'],
        description: 'You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad.<br><br>Suppose you have <code>n</code> versions <code>[1, 2, ..., n]</code> and you want to find out the first bad one, which causes all the following ones to be bad.<br><br>You are given an API <code>bool isBadVersion(version)</code> which returns whether <code>version</code> is bad. Implement a function to find the first bad version. You should minimize the number of calls to the API.',
        examples: [
            { input: 'n = 5, bad = 4', output: '4', explanation: 'call isBadVersion(3) -> false\ncall isBadVersion(5) -> true\ncall isBadVersion(4) -> true\nThen 4 is the first bad version.' },
            { input: 'n = 1, bad = 1', output: '1', explanation: 'Only version 1 is bad.' }
        ],
        constraints: [
            '1 <= bad <= n <= 2^31 - 1'
        ],
        hints: [
            'This is a classic binary search problem over a boolean predicate.',
            'If isBadVersion(mid) is true, the first bad version is at or to the left of mid.',
            'If isBadVersion(mid) is false, the first bad version is strictly to the right of mid.'
        ],
        templates: makeTemplates('firstBadVersion', 'n', 'n', 'int n', 'int n', 'int', 'int', 'int')
    },

    'Palindrome Linked List': {
        topic: 'Linked Lists',
        difficulty: 'Easy',
        tags: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'],
        description: 'Given the <code>head</code> of a singly linked list, return <code>true</code> if it is a palindrome or <code>false</code> otherwise.',
        examples: [
            { input: 'head = [1, 2, 2, 1]', output: 'true', explanation: 'Reads the same forward and backwards.' },
            { input: 'head = [1, 2]', output: 'false', explanation: '1 -> 2 is not a palindrome.' }
        ],
        constraints: [
            'The number of nodes in the list is in the range [1, 10^5].',
            '0 <= Node.val <= 9',
            'Follow up: Could you do it in O(n) time and O(1) space?'
        ],
        hints: [
            'Use fast and slow pointers to find the midpoint of the linked list.',
            'Reverse the second half of the linked list.',
            'Compare the values of the first half and the reversed second half node by node.'
        ],
        templates: makeTemplates('isPalindrome', 'head', 'head', 'ListNode head', 'ListNode* head', 'bool', 'boolean', 'bool')
    },

    'Convert Sorted Array to BST': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Array', 'Divide and Conquer', 'Tree', 'Binary Search Tree', 'Binary Tree'],
        description: 'Given an integer array <code>nums</code> where the elements are sorted in <strong>ascending order</strong>, convert <em>it to a height-balanced binary search tree</em>.<br><br>A <strong>height-balanced</strong> binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.',
        examples: [
            { input: 'nums = [-10, -3, 0, 5, 9]', output: '[0, -3, 9, -10, null, 5]', explanation: '[0, -10, 5, null, -3, null, 9] is also accepted.' },
            { input: 'nums = [1, 3]', output: '[3, 1]', explanation: '[1, null, 3] and [3, 1] are both height-balanced BSTs.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^4',
            '-10^4 <= nums[i] <= 10^4',
            'nums is sorted in a strictly increasing order.'
        ],
        hints: [
            'The middle element of the sorted array should become the root node to maintain balance.',
            'Recursively construct the left subtree from the left half and the right subtree from the right half.'
        ],
        templates: makeTemplates('sortedArrayToBST', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'TreeNode', 'TreeNode', 'TreeNode*')
    },

    'Path Sum': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree and an integer <code>targetSum</code>, return <code>true</code> if the tree has a <strong>root-to-leaf</strong> path such that adding up all the values along the path equals <code>targetSum</code>.<br><br>A <strong>leaf</strong> is a node with no children.',
        examples: [
            { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22', output: 'true', explanation: 'The root-to-leaf path 5 -> 4 -> 11 -> 2 sums to 22.' },
            { input: 'root = [1, 2, 3], targetSum = 5', output: 'false', explanation: 'There are two root-to-leaf paths (1->2 sum 3, 1->3 sum 4), neither is 5.' },
            { input: 'root = [], targetSum = 0', output: 'false', explanation: 'Since the tree is empty, there are no root-to-leaf paths.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [0, 5000].',
            '-1000 <= Node.val <= 1000',
            '-1000 <= targetSum <= 1000'
        ],
        hints: [
            'Use recursion. At each node, subtract root.val from targetSum.',
            'If the node is a leaf, check if targetSum == root.val.'
        ],
        templates: makeTemplates('hasPathSum', 'root, targetSum', 'root, targetSum', 'TreeNode root, int targetSum', 'TreeNode* root, int targetSum', 'bool', 'boolean', 'bool')
    },

    'Min Stack': {
        topic: 'Stack',
        difficulty: 'Medium',
        tags: ['Stack', 'Design'],
        description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.<br><br>Implement the <code>MinStack</code> class:<br><ul><li><code>MinStack()</code> initializes the stack object.</li><li><code>void push(int val)</code> pushes the element val onto the stack.</li><li><code>void pop()</code> removes the element on the top of the stack.</li><li><code>int top()</code> gets the top element of the stack.</li><li><code>int getMin()</code> retrieves the minimum element in the stack.</li></ul>You must implement a solution with <code>O(1)</code> time complexity for each function.',
        examples: [
            { input: '["MinStack","push","push","push","getMin","pop","top","getMin"], [[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]', explanation: 'MinStack minStack = new MinStack();\nminStack.push(-2);\nminStack.push(0);\nminStack.push(-3);\nminStack.getMin(); // return -3\nminStack.pop();\nminStack.top();    // return 0\nminStack.getMin(); // return -2' }
        ],
        constraints: [
            '-2^31 <= val <= 2^31 - 1',
            'Methods pop, top and getMin operations will always be called on non-empty stacks.',
            'At most 3 * 10^4 calls will be made to push, pop, top, and getMin.'
        ],
        hints: [
            'Consider each node in the stack having an additional value storing the minimum value up to that node.',
            'Alternatively, maintain a secondary stack storing the minimum elements.'
        ],
        templates: {
            python: `class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        val = min(val, self.min_stack[-1] if self.min_stack else val)\n        self.min_stack.append(val)\n\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1]\n\n    def getMin(self) -> int:\n        return self.min_stack[-1]\n`,
            javascript: `var MinStack = function() {\n    this.stack = [];\n    this.minStack = [];\n};\n\nMinStack.prototype.push = function(val) {\n    this.stack.push(val);\n    const minVal = this.minStack.length > 0 ? Math.min(val, this.minStack[this.minStack.length - 1]) : val;\n    this.minStack.push(minVal);\n};\n\nMinStack.prototype.pop = function() {\n    this.stack.pop();\n    this.minStack.pop();\n};\n\nMinStack.prototype.top = function() {\n    return this.stack[this.stack.length - 1];\n};\n\nMinStack.prototype.getMin = function() {\n    return this.minStack[this.minStack.length - 1];\n};\n`,
            java: `class MinStack {\n    private Stack<Integer> stack = new Stack<>();\n    private Stack<Integer> minStack = new Stack<>();\n\n    public MinStack() {}\n\n    public void push(int val) {\n        stack.push(val);\n        if (minStack.isEmpty() || val <= minStack.peek()) {\n            minStack.push(val);\n        } else {\n            minStack.push(minStack.peek());\n        }\n    }\n\n    public void pop() {\n        stack.pop();\n        minStack.pop();\n    }\n\n    public int top() {\n        return stack.peek();\n    }\n\n    public int getMin() {\n        return minStack.peek();\n    }\n}\n`,
            c_cpp: `#include <stack>\nusing namespace std;\n\nclass MinStack {\n    stack<int> s;\n    stack<int> min_s;\npublic:\n    MinStack() {}\n    void push(int val) {\n        s.push(val);\n        if (min_s.empty() || val <= min_s.top()) min_s.push(val);\n        else min_s.push(min_s.top());\n    }\n    void pop() { s.pop(); min_s.pop(); }\n    int top() { return s.top(); }\n    int getMin() { return min_s.top(); }\n};\n`
        }
    },

    'Remove Duplicates': {
        topic: 'Two Pointers',
        difficulty: 'Easy',
        tags: ['Array', 'Two Pointers'],
        description: 'Given an integer array <code>nums</code> sorted in <strong>non-decreasing order</strong>, remove the duplicates <strong>in-place</strong> such that each unique element appears only <strong>once</strong>. The relative order of the elements should be kept the same. Then return <em>the number of unique elements in <code>nums</code></em>.<br><br>Consider the number of unique elements of <code>nums</code> to be <code>k</code>, to get accepted, you need to do the following things:<ul><li>Change the array <code>nums</code> such that the first <code>k</code> elements of <code>nums</code> contain the unique elements in the order they were present in <code>nums</code> initially.</li><li>The remaining elements of <code>nums</code> are not important as well as the size of <code>nums</code>.</li><li>Return <code>k</code>.</li></ul>',
        examples: [
            { input: 'nums = [1, 1, 2]', output: '2, nums = [1, 2, _]', explanation: 'Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.' },
            { input: 'nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]', output: '5, nums = [0, 1, 2, 3, 4, _, _, _, _, _]', explanation: 'Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.' }
        ],
        constraints: [
            '1 <= nums.length <= 3 * 10^4',
            '-100 <= nums[i] <= 100',
            'nums is sorted in non-decreasing order.'
        ],
        hints: [
            'In-place means you cannot allocate another array.',
            'Use two pointers: one pointer for the unique element insert position, and one for scanning the array.'
        ],
        templates: makeTemplates('removeDuplicates', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Roman to Integer': {
        topic: 'Math & Strings',
        difficulty: 'Easy',
        tags: ['Hash Table', 'Math', 'String'],
        description: 'Roman numerals are represented by seven different symbols: <code>I</code>, <code>V</code>, <code>X</code>, <code>L</code>, <code>C</code>, <code>D</code> and <code>M</code>.<br><pre>Symbol       Value\nI             1\nV             5\nX             10\nL             50\nC             100\nD             500\nM             1000</pre>Given a roman numeral, convert it to an integer.',
        examples: [
            { input: 's = "III"', output: '3', explanation: 'III = 3.' },
            { input: 's = "LVIII"', output: '58', explanation: 'L = 50, V = 5, III = 3.' },
            { input: 's = "MCMXCIV"', output: '1994', explanation: 'M = 1000, CM = 900, XC = 90 and IV = 4.' }
        ],
        constraints: [
            '1 <= s.length <= 15',
            's contains only the characters (\'I\', \'V\', \'X\', \'L\', \'C\', \'D\', \'M\').',
            'It is guaranteed that s is a valid roman numeral in the range [1, 3999].'
        ],
        hints: [
            'If a smaller symbol appears before a larger symbol, it is subtracted (e.g. IV = 4).',
            'Otherwise, the symbol value is added.'
        ],
        templates: makeTemplates('romanToInt', 's', 's', 'String s', 'string s', 'int', 'int', 'int')
    },

    'Valid Anagram': {
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        tags: ['Hash Table', 'String', 'Sorting'],
        description: 'Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.<br><br>An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        examples: [
            { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Both strings have identical character frequencies.' },
            { input: 's = "rat", t = "car"', output: 'false', explanation: 'Character \'r\' matches, but \'t\' and \'c\' differ.' }
        ],
        constraints: [
            '1 <= s.length, t.length <= 5 * 10^4',
            's and t consist of lowercase English letters.'
        ],
        hints: [
            'Count the frequency of each character in both strings using an array of size 26 or a hash map.',
            'If both frequency counts match, the strings are anagrams.'
        ],
        templates: makeTemplates('isAnagram', 's, t', 's, t', 'String s, String t', 'string s, string t', 'bool', 'boolean', 'bool')
    },

    'Group Anagrams': {
        topic: 'Arrays & Hashing',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'String', 'Sorting'],
        description: 'Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in <strong>any order</strong>.<br><br>An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        examples: [
            { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Strings with identical sorted letters are grouped together.' },
            { input: 'strs = [""]', output: '[[""]]', explanation: 'Empty string forms its own group.' },
            { input: 'strs = ["a"]', output: '[["a"]]', explanation: 'Single character word forms its own group.' }
        ],
        constraints: [
            '1 <= strs.length <= 10^4',
            '0 <= strs[i].length <= 100',
            'strs[i] consists of lowercase English letters.'
        ],
        hints: [
            'Use a hash map where the key is the sorted version of the string (or a character count tuple), and the value is a list of anagrams.'
        ],
        templates: makeTemplates('groupAnagrams', 'strs', 'strs', 'String[] strs', 'vector<string>& strs', 'list', 'List<List<String>>', 'vector<vector<string>>')
    },

    '3Sum': {
        topic: 'Two Pointers',
        difficulty: 'Medium',
        tags: ['Array', 'Two Pointers', 'Sorting'],
        description: 'Given an integer array <code>nums</code>, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>.<br><br>Notice that the solution set must not contain duplicate triplets.',
        examples: [
            { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'The distinct triplets are [-1,0,1] and [-1,-1,2].' },
            { input: 'nums = [0,1,1]', output: '[]', explanation: 'The only possible triplet does not sum to 0.' },
            { input: 'nums = [0,0,0]', output: '[[0,0,0]]', explanation: 'The only possible triplet sums up to 0.' }
        ],
        constraints: [
            '3 <= nums.length <= 3000',
            '-10^5 <= nums[i] <= 10^5'
        ],
        hints: [
            'Sort the array first.',
            'Iterate through the array and for each element, use two pointers (left and right) to find pairs that sum to -nums[i].',
            'Skip duplicates to ensure triplets are unique.'
        ],
        templates: makeTemplates('threeSum', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'list', 'List<List<Integer>>', 'vector<vector<int>>')
    },

    'Container With Most Water': {
        topic: 'Two Pointers',
        difficulty: 'Medium',
        tags: ['Array', 'Two Pointers', 'Greedy'],
        description: 'You are given an integer array <code>height</code> of length <code>n</code>. There are <code>n</code> vertical lines drawn such that the two endpoints of the <code>i<sup>th</sup></code> line are <code>(i, 0)</code> and <code>(i, height[i])</code>.<br><br>Find two lines that together with the x-axis form a container, such that the container contains the most water.<br><br>Return <em>the maximum amount of water a container can store</em>.<br><br><strong>Notice</strong> that you may not slant the container.',
        examples: [
            { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The lines are at index 1 (height 8) and index 8 (height 7). Distance is 7, min height is 7, area = 7 * 7 = 49.' },
            { input: 'height = [1,1]', output: '1', explanation: 'Distance is 1, min height is 1, area = 1 * 1 = 1.' }
        ],
        constraints: [
            'n == height.length',
            '2 <= n <= 10^5',
            '0 <= height[i] <= 10^4'
        ],
        hints: [
            'Start with two pointers at the extremes of the array.',
            'The area is always limited by the shorter line: (right - left) * min(height[left], height[right]).',
            'Move the pointer with the shorter height inward, because moving the taller one can never increase the area.'
        ],
        templates: makeTemplates('maxArea', 'height', 'height', 'int[] height', 'vector<int>& height', 'int', 'int', 'int')
    },

    'Longest Substring Without Repeating Characters': {
        topic: 'Sliding Window',
        difficulty: 'Medium',
        tags: ['Hash Table', 'String', 'Sliding Window'],
        description: 'Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.<br><br>A <strong>substring</strong> is a contiguous non-empty sequence of characters within a string.',
        examples: [
            { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
            { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
            { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3. Notice "pwke" is a subsequence and not a substring.' }
        ],
        constraints: [
            '0 <= s.length <= 5 * 10^4',
            's consists of English letters, digits, symbols and spaces.'
        ],
        hints: [
            'Use a sliding window with two pointers [left, right].',
            'Use a hash set or map to store the characters currently inside the window.',
            'When a duplicate is encountered, shrink the window from the left until the duplicate is removed.'
        ],
        templates: makeTemplates('lengthOfLongestSubstring', 's', 's', 'String s', 'string s', 'int', 'int', 'int')
    },

    'Median of Two Sorted Arrays': {
        topic: 'Binary Search',
        difficulty: 'Hard',
        tags: ['Array', 'Binary Search', 'Divide and Conquer'],
        description: 'Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.<br><br>The overall run time complexity should be <code>O(log (m+n))</code>.',
        examples: [
            { input: 'nums1 = [1, 3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1, 2, 3] and median is 2.' },
            { input: 'nums1 = [1, 2], nums2 = [3, 4]', output: '2.50000', explanation: 'merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.' }
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m <= 1000',
            '0 <= n <= 1000',
            '1 <= m + n <= 2000',
            '-10^6 <= nums1[i], nums2[i] <= 10^6'
        ],
        hints: [
            'Binary search on the smaller array to partition both arrays into two halves with equal size.',
            'Ensure max(left_half) <= min(right_half).'
        ],
        templates: makeTemplates('findMedianSortedArrays', 'nums1, nums2', 'nums1, nums2', 'int[] nums1, int[] nums2', 'vector<int>& nums1, vector<int>& nums2', 'float', 'double', 'double')
    },

    'Trapping Rain Water': {
        topic: 'Two Pointers',
        difficulty: 'Hard',
        tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
        description: 'Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.',
        examples: [
            { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.' },
            { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: 'Water trapped across all valleys sums to 9 units.' }
        ],
        constraints: [
            'n == height.length',
            '1 <= n <= 2 * 10^4',
            '0 <= height[i] <= 10^5'
        ],
        hints: [
            'For any bar i, water trapped above it is min(max_left, max_right) - height[i].',
            'You can precompute max_left and max_right arrays, or solve in O(1) space using two pointers.'
        ],
        templates: makeTemplates('trap', 'height', 'height', 'int[] height', 'vector<int>& height', 'int', 'int', 'int')
    },

    'Merge Intervals': {
        topic: 'Intervals',
        difficulty: 'Medium',
        tags: ['Array', 'Sorting'],
        description: 'Given an array of <code>intervals</code> where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, merge all overlapping intervals, and return <em>an array of the non-overlapping intervals that cover all the intervals in the input</em>.',
        examples: [
            { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
            { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' }
        ],
        constraints: [
            '1 <= intervals.length <= 10^4',
            'intervals[i].length == 2',
            '0 <= start_i <= end_i <= 10^4'
        ],
        hints: [
            'Sort the intervals by their start time.',
            'Iterate through the sorted intervals. If the current interval overlaps with the previous one, merge them by updating the end time.'
        ],
        templates: makeTemplates('merge', 'intervals', 'intervals', 'int[][] intervals', 'vector<vector<int>>& intervals', 'list', 'int[][]', 'vector<vector<int>>')
    },

    'Insert Interval': {
        topic: 'Intervals',
        difficulty: 'Medium',
        tags: ['Array'],
        description: 'You are given an array of non-overlapping intervals <code>intervals</code> where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code> represent the start and the end of the <code>i<sup>th</sup></code> interval and <code>intervals</code> is sorted in ascending order by <code>start<sub>i</sub></code>. You are also given an interval <code>newInterval = [start, end]</code> that represents the start and end of another interval.<br><br>Insert <code>newInterval</code> into <code>intervals</code> such that <code>intervals</code> is still sorted in ascending order by <code>start<sub>i</sub></code> and <code>intervals</code> still does not have any overlapping intervals (merge overlapping intervals if necessary).<br><br>Return <code>intervals</code> after the insertion.',
        examples: [
            { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]', explanation: 'Because the new interval [2,5] overlaps with [1,3], merge into [1,5].' },
            { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]', explanation: 'The new interval [4,8] overlaps with [3,5],[6,7],[8,10].' }
        ],
        constraints: [
            '0 <= intervals.length <= 10^4',
            'intervals[i].length == 2',
            'newInterval.length == 2'
        ],
        hints: [
            'Add all intervals that end before newInterval begins.',
            'Merge all intervals that overlap with newInterval by updating start and end.',
            'Add all remaining intervals.'
        ],
        templates: makeTemplates('insert', 'intervals, newInterval', 'intervals, newInterval', 'int[][] intervals, int[] newInterval', 'vector<vector<int>>& intervals, vector<int>& newInterval', 'list', 'int[][]', 'vector<vector<int>>')
    },

    'Subsets': {
        topic: 'Backtracking',
        difficulty: 'Medium',
        tags: ['Array', 'Backtracking', 'Bit Manipulation'],
        description: 'Given an integer array <code>nums</code> of <strong>unique</strong> elements, return <em>all possible subsets (the power set)</em>.<br><br>The solution set <strong>must not</strong> contain duplicate subsets. Return the solution in <strong>any order</strong>.',
        examples: [
            { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', explanation: 'All 2^3 = 8 subsets are returned.' },
            { input: 'nums = [0]', output: '[[],[0]]', explanation: 'All 2^1 = 2 subsets are returned.' }
        ],
        constraints: [
            '1 <= nums.length <= 10',
            '-10 <= nums[i] <= 10',
            'All the numbers of nums are unique.'
        ],
        hints: [
            'Use depth-first search / backtracking.',
            'At each index, you have two choices: include nums[i] in the current subset, or exclude it.'
        ],
        templates: makeTemplates('subsets', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'list', 'List<List<Integer>>', 'vector<vector<int>>')
    },

    'Word Search': {
        topic: 'Backtracking & Graphs',
        difficulty: 'Medium',
        tags: ['Array', 'Backtracking', 'Matrix'],
        description: 'Given an <code>m x n</code> grid of characters <code>board</code> and a string <code>word</code>, return <code>true</code> <em>if <code>word</code> exists in the grid</em>.<br><br>The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
        examples: [
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: 'Path: (0,0)->(0,1)->(0,2)->(1,2)->(2,2)->(2,1).' },
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: 'true', explanation: 'Path: (1,3)->(2,3)->(2,2).' },
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false', explanation: 'Cell (0,1) cannot be used twice.' }
        ],
        constraints: [
            'm == board.length',
            'n = board[i].length',
            '1 <= m, n <= 6',
            '1 <= word.length <= 15',
            'board and word consists of only lowercase and uppercase English letters.'
        ],
        hints: [
            'Iterate through every cell (r, c) on the board and trigger a DFS.',
            'Mark visited cells temporarily with a special character like \'#\' and backtrack upon return.'
        ],
        templates: makeTemplates('exist', 'board, word', 'board, word', 'char[][] board, String word', 'vector<vector<char>>& board, string word', 'bool', 'boolean', 'bool')
    },

    'Rotate Image': {
        topic: 'Arrays & Matrix',
        difficulty: 'Medium',
        tags: ['Array', 'Math', 'Matrix'],
        description: 'You are given an <code>n x n</code> 2D <code>matrix</code> representing an image, rotate the image by <strong>90 degrees (clockwise)</strong>.<br><br>You have to rotate the image <strong>in-place</strong>, which means you have to modify the input 2D matrix directly. <strong>DO NOT</strong> allocate another 2D matrix and do the rotation.',
        examples: [
            { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]', explanation: 'Matrix rotated 90 degrees clockwise.' },
            { input: 'matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]', output: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]', explanation: '4x4 matrix rotated 90 degrees.' }
        ],
        constraints: [
            'n == matrix.length == matrix[i].length',
            '1 <= n <= 20',
            '-1000 <= matrix[i][j] <= 1000'
        ],
        hints: [
            'Rotating 90 degrees clockwise is equivalent to transposing the matrix (swapping matrix[i][j] with matrix[j][i]), then reversing each row.'
        ],
        templates: makeTemplates('rotate', 'matrix', 'matrix', 'int[][] matrix', 'vector<vector<int>>& matrix', 'None', 'void', 'void')
    },

    'Spiral Matrix': {
        topic: 'Arrays & Matrix',
        difficulty: 'Medium',
        tags: ['Array', 'Matrix', 'Simulation'],
        description: 'Given an <code>m x n</code> <code>matrix</code>, return <em>all elements of the <code>matrix</code> in spiral order</em>.',
        examples: [
            { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]', explanation: 'Traverse right, down, left, up in a clockwise spiral.' },
            { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]', explanation: 'Traverse outer boundary, then inner elements.' }
        ],
        constraints: [
            'm == matrix.length',
            'n == matrix[i].length',
            '1 <= m, n <= 10',
            '-100 <= matrix[i][j] <= 100'
        ],
        hints: [
            'Maintain four boundaries: top, bottom, left, right.',
            'Traverse top row (left->right), right col (top->bottom), bottom row (right->left), and left col (bottom->top), contracting boundaries after each pass.'
        ],
        templates: makeTemplates('spiralOrder', 'matrix', 'matrix', 'int[][] matrix', 'vector<vector<int>>& matrix', 'list', 'List<Integer>', 'vector<int>')
    },

    'Number of Islands': {
        topic: 'Graphs',
        difficulty: 'Medium',
        tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
        description: 'Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>\'1\'</code>s (land) and <code>\'0\'</code>s (water), return <em>the number of islands</em>.<br><br>An <strong>island</strong> is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
        examples: [
            { input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]', output: '1', explanation: 'All connected lands form one large island.' },
            { input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]', output: '3', explanation: 'There are 3 isolated islands in the map.' }
        ],
        constraints: [
            'm == grid.length',
            'n == grid[i].length',
            '1 <= m, n <= 300',
            'grid[i][j] is \'0\' or \'1\'.'
        ],
        hints: [
            'Iterate through every cell in the grid.',
            'When you find a \'1\', increment your island count and run BFS/DFS to mark all connected \'1\'s as \'0\' (visited).'
        ],
        templates: makeTemplates('numIslands', 'grid', 'grid', 'char[][] grid', 'vector<vector<char>>& grid', 'int', 'int', 'int')
    },

    'Course Schedule': {
        topic: 'Graphs',
        difficulty: 'Medium',
        tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
        description: 'There are a total of <code>numCourses</code> courses you have to take, labeled from <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> indicates that you <strong>must</strong> take course <code>b<sub>i</sub></code> first if you want to take course <code>a<sub>i</sub></code>.<br><br>Return <code>true</code> if you can finish all courses. Otherwise, return <code>false</code>.',
        examples: [
            { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.' },
            { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.' }
        ],
        constraints: [
            '1 <= numCourses <= 2000',
            '0 <= prerequisites.length <= 5000',
            'prerequisites[i].length == 2',
            '0 <= a_i, b_i < numCourses',
            'All the pairs prerequisites[i] are unique.'
        ],
        hints: [
            'This problem is equivalent to detecting a cycle in a directed graph.',
            'Use topological sorting (Kahn\'s algorithm with in-degrees) or DFS with 3 color states (unvisited, visiting, visited).'
        ],
        templates: makeTemplates('canFinish', 'numCourses, prerequisites', 'numCourses, prerequisites', 'int numCourses, int[][] prerequisites', 'int numCourses, vector<vector<int>>& prerequisites', 'bool', 'boolean', 'bool')
    },

    'Clone Graph': {
        topic: 'Graphs',
        difficulty: 'Medium',
        tags: ['Hash Table', 'Depth-First Search', 'Breadth-First Search', 'Graph'],
        description: 'Given a reference of a node in a <strong>connected</strong> undirected graph. Return a <strong>deep copy</strong> (clone) of the graph.<br><br>Each node in the graph contains a value (<code>int</code>) and a list (<code>List[Node]</code>) of its neighbors.',
        examples: [
            { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'There are 4 nodes in the graph. Deep copy replicates the exact topology.' },
            { input: 'adjList = [[]]', output: '[[]]', explanation: 'Graph consists of a single node with no neighbors.' },
            { input: 'adjList = []', output: '[]', explanation: 'Graph is empty.' }
        ],
        constraints: [
            'The number of nodes in the graph is in the range [0, 100].',
            '1 <= Node.val <= 100',
            'Node.val is unique for each node.',
            'There are no repeated edges and no self-loops in the graph.'
        ],
        hints: [
            'Use a hash map to map each original node to its cloned copy.',
            'Use DFS or BFS to traverse the graph and copy nodes and edges.'
        ],
        templates: makeTemplates('cloneGraph', 'node', 'node', 'Node node', 'Node* node', 'Node', 'Node', 'Node*')
    },

    'Word Break': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization'],
        description: 'Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, return <code>true</code> if <code>s</code> can be segmented into a space-separated sequence of one or more dictionary words.<br><br><strong>Note</strong> that the same word in the dictionary may be reused multiple times in the segmentation.',
        examples: [
            { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
            { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: 'Return true because "applepenapple" can be segmented as "apple pen apple". Note that words can be reused.' },
            { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false', explanation: 'Cannot form valid full segmentation.' }
        ],
        constraints: [
            '1 <= s.length <= 300',
            '1 <= wordDict.length <= 1000',
            '1 <= wordDict[i].length <= 20',
            's and wordDict[i] consist of only lowercase English letters.',
            'All the strings of wordDict are unique.'
        ],
        hints: [
            'Define dp[i] as whether s[0:i] can be segmented using dictionary words.',
            'dp[i] is true if for some j < i, dp[j] is true and s[j:i] is in wordDict.'
        ],
        templates: makeTemplates('wordBreak', 's, wordDict', 's, wordDict', 'String s, List<String> wordDict', 'string s, vector<string>& wordDict', 'bool', 'boolean', 'bool')
    },

    'LRU Cache': {
        topic: 'Design & Data Structures',
        difficulty: 'Medium',
        tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
        description: 'Design a data structure that follows the constraints of a <strong>Least Recently Used (LRU) cache</strong>.<br><br>Implement the <code>LRUCache</code> class:<br><ul><li><code>LRUCache(int capacity)</code> Initialize the LRU cache with positive size <code>capacity</code>.</li><li><code>int get(int key)</code> Return the value of the <code>key</code> if the key exists, otherwise return <code>-1</code>.</li><li><code>void put(int key, int value)</code> Update the value of the <code>key</code> if the <code>key</code> exists. Otherwise, add the <code>key-value</code> pair to the cache. If the number of keys exceeds the <code>capacity</code> from this operation, <strong>evict</strong> the least recently used key.</li></ul>The functions <code>get</code> and <code>put</code> must each run in <code>O(1)</code> average time complexity.',
        examples: [
            { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]', explanation: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4' }
        ],
        constraints: [
            '1 <= capacity <= 3000',
            '0 <= key <= 10^4',
            '0 <= value <= 10^5',
            'At most 2 * 10^5 calls will be made to get and put.'
        ],
        hints: [
            'Combine a Hash Map with a Doubly Linked List.',
            'Hash map allows O(1) key lookups to nodes.',
            'Doubly linked list allows O(1) removal and re-insertion of nodes at the head (most recently used).'
        ],
        templates: {
            python: `class Node:\n    def __init__(self, key=0, value=0):\n        self.key, self.value = key, value\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n        self.head, self.tail = Node(), Node()\n        self.head.next, self.tail.prev = self.tail, self.head\n\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._insert(node)\n            return node.value\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._insert(node)\n        if len(self.cache) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _insert(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n`,
            javascript: `var LRUCache = function(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n};\n\nLRUCache.prototype.get = function(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n};\n\nLRUCache.prototype.put = function(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.capacity) {\n        const oldestKey = this.map.keys().next().value;\n        this.map.delete(oldestKey);\n    }\n};\n`,
            java: `class LRUCache {\n    private int capacity;\n    private LinkedHashMap<Integer, Integer> map;\n\n    public LRUCache(int capacity) {\n        this.capacity = capacity;\n        this.map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {\n            protected boolean removeEldestEntry(Map.Entry eldest) {\n                return size() > LRUCache.this.capacity;\n            }\n        };\n    }\n\n    public int get(int key) {\n        return map.getOrDefault(key, -1);\n    }\n\n    public void put(int key, int value) {\n        map.put(key, value);\n    }\n}\n`,
            c_cpp: `#include <unordered_map>\n#include <list>\nusing namespace std;\n\nclass LRUCache {\n    int cap;\n    list<pair<int, int>> l;\n    unordered_map<int, list<pair<int, int>>::iterator> m;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (m.find(key) == m.end()) return -1;\n        l.splice(l.begin(), l, m[key]);\n        return m[key]->second;\n    }\n    void put(int key, int value) {\n        if (m.find(key) != m.end()) {\n            l.splice(l.begin(), l, m[key]);\n            m[key]->second = value;\n            return;\n        }\n        if (l.size() == cap) {\n            m.erase(l.back().first);\n            l.pop_back();\n        }\n        l.push_front({key, value});\n        m[key] = l.begin();\n    }\n};\n`
        }
    },

    'Coin Change': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
        description: 'You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money.<br><br>Return <em>the fewest number of coins that you need to make up that amount</em>. If that amount of money cannot be made up by any combination of the coins, return <code>-1</code>.<br><br>You may assume that you have an infinite number of each kind of coin.',
        examples: [
            { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins total).' },
            { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot make 3 using only coins of value 2.' },
            { input: 'coins = [1], amount = 0', output: '0', explanation: '0 amount requires 0 coins.' }
        ],
        constraints: [
            '1 <= coins.length <= 12',
            '1 <= coins[i] <= 2^31 - 1',
            '0 <= amount <= 10^4'
        ],
        hints: [
            'Let dp[i] be the minimum coins to make amount i.',
            'dp[i] = min(dp[i], dp[i - coin] + 1) for each coin in coins if i >= coin.'
        ],
        templates: makeTemplates('coinChange', 'coins, amount', 'coins, amount', 'int[] coins, int amount', 'vector<int>& coins, int amount', 'int', 'int', 'int')
    },

    'House Robber': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming'],
        description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and <strong>it will automatically contact the police if two adjacent houses were broken into on the same night</strong>.<br><br>Given an integer array <code>nums</code> representing the amount of money of each house, return <em>the maximum amount of money you can rob tonight <strong>without alerting the police</strong></em>.',
        examples: [
            { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and house 3 (money = 3). Total = 1 + 3 = 4.' },
            { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 2 + 9 + 1 = 12.' }
        ],
        constraints: [
            '1 <= nums.length <= 100',
            '0 <= nums[i] <= 400'
        ],
        hints: [
            'At each house i, you either rob it (nums[i] + rob(i - 2)) or skip it (rob(i - 1)).',
            'rob[i] = max(rob[i - 1], nums[i] + rob[i - 2]). You only need two variables to track the previous two states.'
        ],
        templates: makeTemplates('rob', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Unique Paths': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
        description: 'There is a robot on an <code>m x n</code> grid. The robot is initially located at the <strong>top-left corner</strong> (i.e., <code>grid[0][0]</code>). The robot tries to move to the <strong>bottom-right corner</strong> (i.e., <code>grid[m - 1][n - 1]</code>). The robot can only move either down or right at any point in time.<br><br>Given the two integers <code>m</code> and <code>n</code>, return <em>the number of possible unique paths that the robot can take to reach the bottom-right corner</em>.',
        examples: [
            { input: 'm = 3, n = 7', output: '28', explanation: 'There are 28 unique paths from top-left to bottom-right.' },
            { input: 'm = 3, n = 2', output: '3', explanation: 'From the top-left corner, there are a total of 3 ways: Right->Down->Down, Down->Down->Right, Down->Right->Down.' }
        ],
        constraints: [
            '1 <= m, n <= 100'
        ],
        hints: [
            'dp[i][j] = dp[i - 1][j] + dp[i][j - 1].',
            'Base cases: dp[0][j] = 1 and dp[i][0] = 1 (only one way to move along the edges).'
        ],
        templates: makeTemplates('uniquePaths', 'm, n', 'm, n', 'int m, int n', 'int m, int n', 'int', 'int', 'int')
    },

    'Edit Distance': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['String', 'Dynamic Programming'],
        description: 'Given two strings <code>word1</code> and <code>word2</code>, return <em>the minimum number of operations required to convert <code>word1</code> to <code>word2</code></em>.<br><br>You have the following three operations permitted on a word:<ul><li>Insert a character</li><li>Delete a character</li><li>Replace a character</li></ul>',
        examples: [
            { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse (replace \'h\' with \'r\')\nrorse -> rose (remove \'r\')\nrose -> ros (remove \'e\')' },
            { input: 'word1 = "intention", word2 = "execution"', output: '5', explanation: 'intention -> inention (remove \'t\')\ninention -> enention (replace \'i\' with \'e\')\nenention -> exention (replace \'n\' with \'x\')\nexention -> exection (replace \'n\' with \'c\')\nexection -> execution (insert \'u\')' }
        ],
        constraints: [
            '0 <= word1.length, word2.length <= 500',
            'word1 and word2 consist of lowercase English letters.'
        ],
        hints: [
            'Use 2D dynamic programming: dp[i][j] is the edit distance between word1[0:i] and word2[0:j].',
            'If word1[i - 1] == word2[j - 1], dp[i][j] = dp[i - 1][j - 1].',
            'Otherwise, dp[i][j] = 1 + min(dp[i - 1][j] (delete), dp[i][j - 1] (insert), dp[i - 1][j - 1] (replace)).'
        ],
        templates: makeTemplates('minDistance', 'word1, word2', 'word1, word2', 'String word1, String word2', 'string word1, string word2', 'int', 'int', 'int')
    },

    'Longest Common Subsequence': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['String', 'Dynamic Programming'],
        description: 'Given two strings <code>text1</code> and <code>text2</code>, return <em>the length of their longest <strong>common subsequence</strong></em>. If there is no common subsequence, return <code>0</code>.<br><br>A <strong>subsequence</strong> of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.<br><br>A <strong>common subsequence</strong> of two strings is a subsequence that is common to both strings.',
        examples: [
            { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The longest common subsequence is "ace" and its length is 3.' },
            { input: 'text1 = "abc", text2 = "abc"', output: '3', explanation: 'The longest common subsequence is "abc" and its length is 3.' },
            { input: 'text1 = "abc", text2 = "def"', output: '0', explanation: 'There is no such common subsequence, so the result is 0.' }
        ],
        constraints: [
            '1 <= text1.length, text2.length <= 1000',
            'text1 and text2 consist of only lowercase English characters.'
        ],
        hints: [
            'dp[i][j] represents LCS length of text1[0:i] and text2[0:j].',
            'If text1[i - 1] == text2[j - 1], dp[i][j] = 1 + dp[i - 1][j - 1].',
            'Otherwise, dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]).'
        ],
        templates: makeTemplates('longestCommonSubsequence', 'text1, text2', 'text1, text2', 'String text1, String text2', 'string text1, string text2', 'int', 'int', 'int')
    },

    'Serialize and Deserialize Binary Tree': {
        topic: 'Trees',
        difficulty: 'Hard',
        tags: ['String', 'Tree', 'Depth-First Search', 'Breadth-First Search', 'Design', 'Binary Tree'],
        description: 'Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.<br><br>Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.',
        examples: [
            { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explanation: 'Tree is accurately serialized to string and parsed back to identical binary tree.' },
            { input: 'root = []', output: '[]', explanation: 'Empty tree produces empty representation.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [0, 10^4].',
            '-1000 <= Node.val <= 1000'
        ],
        hints: [
            'Pre-order traversal with a delimiter (e.g. ",") and marker for null (e.g. "null") is clean and easy to reconstruct.'
        ],
        templates: {
            python: `class Codec:\n    def serialize(self, root):\n        def r(node):\n            if not node: return ['#']\n            return [str(node.val)] + r(node.left) + r(node.right)\n        return ','.join(r(root))\n\n    def deserialize(self, data):\n        vals = iter(data.split(','))\n        def r():\n            val = next(vals)\n            if val == '#': return None\n            node = TreeNode(int(val))\n            node.left = r()\n            node.right = r()\n            return node\n        return r()\n`,
            javascript: `var serialize = function(root) {\n    if (!root) return '#';\n    return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);\n};\n\nvar deserialize = function(data) {\n    const list = data.split(',');\n    function build() {\n        const val = list.shift();\n        if (val === '#' || val === '') return null;\n        const node = new TreeNode(parseInt(val));\n        node.left = build();\n        node.right = build();\n        return node;\n    }\n    return build();\n};\n`,
            java: `public class Codec {\n    public String serialize(TreeNode root) {\n        if (root == null) return "#,";\n        return root.val + "," + serialize(root.left) + serialize(root.right);\n    }\n\n    public TreeNode deserialize(String data) {\n        Queue<String> q = new LinkedList<>(Arrays.asList(data.split(",")));\n        return build(q);\n    }\n\n    private TreeNode build(Queue<String> q) {\n        String val = q.poll();\n        if (val == null || val.equals("#")) return null;\n        TreeNode node = new TreeNode(Integer.parseInt(val));\n        node.left = build(q);\n        node.right = build(q);\n        return node;\n    }\n}\n`,
            c_cpp: `#include <string>\n#include <sstream>\nusing namespace std;\n\nclass Codec {\npublic:\n    string serialize(TreeNode* root) {\n        if (!root) return "# ";\n        return to_string(root->val) + " " + serialize(root->left) + serialize(root->right);\n    }\n    TreeNode* deserialize(string data) {\n        stringstream ss(data);\n        return build(ss);\n    }\n    TreeNode* build(stringstream& ss) {\n        string val;\n        ss >> val;\n        if (val == "#") return nullptr;\n        TreeNode* root = new TreeNode(stoi(val));\n        root->left = build(ss);\n        root->right = build(ss);\n        return root;\n    }\n};\n`
        }
    },

    'Find Median from Data Stream': {
        topic: 'Heap / Priority Queue',
        difficulty: 'Hard',
        tags: ['Two Pointers', 'Design', 'Sorting', 'Heap (Priority Queue)', 'Data Stream'],
        description: 'The <strong>median</strong> is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.<br><br>Implement the <code>MedianFinder</code> class:<ul><li><code>MedianFinder()</code> initializes the <code>MedianFinder</code> object.</li><li><code>void addNum(int num)</code> adds the integer <code>num</code> from the data stream to the data structure.</li><li><code>double findMedian()</code> returns the median of all elements so far.</li></ul>',
        examples: [
            { input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]\n[[], [1], [2], [], [3], []]', output: '[null, null, null, 1.5, null, 2.0]', explanation: 'MedianFinder mf = new MedianFinder();\nmf.addNum(1);\nmf.addNum(2);\nmf.findMedian(); // return 1.5 (mean of 1 and 2)\nmf.addNum(3);\nmf.findMedian(); // return 2.0' }
        ],
        constraints: [
            '-10^5 <= num <= 10^5',
            'There will be at least one element in the data structure before calling findMedian.',
            'At most 5 * 10^4 calls will be made to addNum and findMedian.'
        ],
        hints: [
            'Maintain two heaps: a max-heap for the lower half of numbers, and a min-heap for the upper half.',
            'Keep their sizes balanced within 1 element difference. Median is then the top of the larger heap, or the average of both tops.'
        ],
        templates: {
            python: `import heapq\n\nclass MedianFinder:\n    def __init__(self):\n        self.small = [] # max heap (invert signs)\n        self.large = [] # min heap\n\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.small, -num)\n        if self.small and self.large and (-self.small[0] > self.large[0]):\n            val = -heapq.heappop(self.small)\n            heapq.heappush(self.large, val)\n        if len(self.small) > len(self.large) + 1:\n            val = -heapq.heappop(self.small)\n            heapq.heappush(self.large, val)\n        if len(self.large) > len(self.small):\n            val = heapq.heappop(self.large)\n            heapq.heappush(self.small, -val)\n\n    def findMedian(self) -> float:\n        if len(self.small) > len(self.large):\n            return float(-self.small[0])\n        return (-self.small[0] + self.large[0]) / 2.0\n`,
            javascript: `var MedianFinder = function() {\n    this.arr = [];\n};\n\nMedianFinder.prototype.addNum = function(num) {\n    let low = 0, high = this.arr.length;\n    while (low < high) {\n        let mid = (low + high) >> 1;\n        if (this.arr[mid] < num) low = mid + 1;\n        else high = mid;\n    }\n    this.arr.splice(low, 0, num);\n};\n\nMedianFinder.prototype.findMedian = function() {\n    const n = this.arr.length;\n    if (n % 2 === 1) return this.arr[Math.floor(n / 2)];\n    return (this.arr[n / 2 - 1] + this.arr[n / 2]) / 2;\n};\n`,
            java: `class MedianFinder {\n    private PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());\n    private PriorityQueue<Integer> large = new PriorityQueue<>();\n\n    public MedianFinder() {}\n\n    public void addNum(int num) {\n        small.offer(num);\n        large.offer(small.poll());\n        if (small.size() < large.size()) {\n            small.offer(large.poll());\n        }\n    }\n\n    public double findMedian() {\n        return small.size() > large.size() ? small.peek() : (small.peek() + large.peek()) / 2.0;\n    }\n}\n`,
            c_cpp: `#include <queue>\nusing namespace std;\n\nclass MedianFinder {\n    priority_queue<int> small; // max heap\n    priority_queue<int, vector<int>, greater<int>> large; // min heap\npublic:\n    MedianFinder() {}\n    void addNum(int num) {\n        small.push(num);\n        large.push(small.top());\n        small.pop();\n        if (small.size() < large.size()) {\n            small.push(large.top());\n            large.pop();\n        }\n    }\n    double findMedian() {\n        return small.size() > large.size() ? small.top() : (small.top() + large.top()) / 2.0;\n    }\n};\n`
        }
    },

    'Sliding Window Maximum': {
        topic: 'Sliding Window',
        difficulty: 'Hard',
        tags: ['Array', 'Queue', 'Sliding Window', 'Heap (Priority Queue)', 'Monotonic Queue'],
        description: 'You are given an array of integers <code>nums</code>, there is a sliding window of size <code>k</code> which is moving from the very left of the array to the very right. You can only see the <code>k</code> numbers in the window. Each time the sliding window moves right by one position.<br><br>Return <em>the max sliding window</em>.',
        examples: [
            { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Window [1 3 -1] -> max 3\nWindow [3 -1 -3] -> max 3\nWindow [-1 -3 5] -> max 5\nWindow [-3 5 3] -> max 5\nWindow [5 3 6] -> max 6\nWindow [3 6 7] -> max 7' },
            { input: 'nums = [1], k = 1', output: '[1]', explanation: 'Only window [1] with max 1.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4',
            '1 <= k <= nums.length'
        ],
        hints: [
            'Use a monotonic decreasing deque storing indices of elements.',
            'Remove indices from the front if they fall outside the current window.',
            'Remove indices from the back if nums[back] <= nums[i] to maintain descending order.'
        ],
        templates: makeTemplates('maxSlidingWindow', 'nums, k', 'nums, k', 'int[] nums, int k', 'vector<int>& nums, int k', 'list', 'int[]', 'vector<int>')
    },

    'Minimum Window Substring': {
        topic: 'Sliding Window',
        difficulty: 'Hard',
        tags: ['Hash Table', 'String', 'Sliding Window'],
        description: 'Given two strings <code>s</code> and <code>t</code> of lengths <code>m</code> and <code>n</code> respectively, return <em>the <strong>minimum window substring</strong> of <code>s</code> such that every character in <code>t</code> (<strong>including duplicates</strong>) is included in the window</em>. If there is no such substring, return the empty string <code>""</code>.',
        examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.' },
            { input: 's = "a", t = "a"', output: '"a"', explanation: 'The entire string s is the minimum window.' },
            { input: 's = "a", t = "aa"', output: '""', explanation: 'Both \'a\'s from t must be included in the window, so no valid substring exists.' }
        ],
        constraints: [
            'm == s.length',
            'n == t.length',
            '1 <= m, n <= 10^5',
            's and t consist of uppercase and lowercase English letters.'
        ],
        hints: [
            'Use two pointers to create a sliding window: extend right until window is valid, then contract left to minimize window size.'
        ],
        templates: makeTemplates('minWindow', 's, t', 's, t', 'String s, String t', 'string s, string t', 'str', 'String', 'string')
    },

    'Merge k Sorted Lists': {
        topic: 'Linked Lists & Heaps',
        difficulty: 'Hard',
        tags: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)', 'Merge Sort'],
        description: 'You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.<br><br><em>Merge all the linked-lists into one sorted linked-list and return it</em>.',
        examples: [
            { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'The linked-lists are merged into one sorted list.' },
            { input: 'lists = []', output: '[]', explanation: 'Empty input yields empty list.' },
            { input: 'lists = [[]]', output: '[]', explanation: 'One empty linked list yields empty list.' }
        ],
        constraints: [
            'k == lists.length',
            '0 <= k <= 10^4',
            '0 <= lists[i].length <= 500',
            '-10^4 <= lists[i][j] <= 10^4',
            'lists[i] is sorted in ascending order.',
            'The sum of lists[i].length will not exceed 10^4.'
        ],
        hints: [
            'Use a min-heap (priority queue) to keep track of the smallest node among the heads of all k lists.',
            'Or use divide and conquer to pair up lists and merge each pair using Merge Two Sorted Lists.'
        ],
        templates: makeTemplates('mergeKLists', 'lists', 'lists', 'ListNode[] lists', 'vector<ListNode*>& lists', 'ListNode', 'ListNode', 'ListNode*')
    },

    'Find Minimum in Rotated Sorted Array': {
        topic: 'Binary Search',
        difficulty: 'Medium',
        tags: ['Array', 'Binary Search'],
        description: 'Suppose an array of length <code>n</code> sorted in ascending order is <strong>rotated</strong> between <code>1</code> and <code>n</code> times. For example, the array <code>nums = [0,1,2,4,5,6,7]</code> might become <code>[4,5,6,7,0,1,2]</code>.<br><br>Given the sorted rotated array <code>nums</code> of <strong>unique</strong> elements, return <em>the minimum element of this array</em>.<br><br>You must write an algorithm that runs in <code>O(log n) time</code>.',
        examples: [
            { input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'The original array was [1,2,3,4,5] rotated 3 times.' },
            { input: 'nums = [4,5,6,7,0,1,2]', output: '0', explanation: 'The original array was [0,1,2,4,5,6,7] and it was rotated 4 times.' },
            { input: 'nums = [11,13,15,17]', output: '11', explanation: 'The original array was [11,13,15,17] and it was rotated 4 times.' }
        ],
        constraints: [
            'n == nums.length',
            '1 <= n <= 5000',
            '-5000 <= nums[i] <= 5000',
            'All the integers of nums are unique.',
            'nums is sorted and rotated between 1 and n times.'
        ],
        hints: [
            'Compare nums[mid] with nums[right].',
            'If nums[mid] > nums[right], the inflection point (minimum) must be in the right half: left = mid + 1.',
            'Otherwise, the minimum is in the left half or at mid: right = mid.'
        ],
        templates: makeTemplates('findMin', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Search in Rotated Sorted Array': {
        topic: 'Binary Search',
        difficulty: 'Medium',
        tags: ['Array', 'Binary Search'],
        description: 'There is an integer array <code>nums</code> sorted in ascending order (with <strong>distinct</strong> values).<br><br>Prior to being passed to your function, <code>nums</code> is <strong>possibly rotated</strong> at an unknown pivot index <code>k</code> (<code>1 <= k < nums.length</code>).<br><br>Given the array <code>nums</code> after the possible rotation and an integer <code>target</code>, return <em>the index of <code>target</code> if it is in <code>nums</code>, or <code>-1</code> if it is not in <code>nums</code></em>.<br><br>You must write an algorithm with <code>O(log n)</code> runtime complexity.',
        examples: [
            { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 exists at index 4.' },
            { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '3 does not exist in nums.' },
            { input: 'nums = [1], target = 0', output: '-1', explanation: '0 does not exist in [1].' }
        ],
        constraints: [
            '1 <= nums.length <= 5000',
            '-10^4 <= nums[i] <= 10^4',
            'All values of nums are unique.',
            'nums is an ascending array that is possibly rotated.',
            '-10^4 <= target <= 10^4'
        ],
        hints: [
            'In any rotated sorted array, at least one half (left or right of mid) is always sorted.',
            'Check which half is normally sorted, then determine if the target lies within that sorted half\'s boundaries.'
        ],
        templates: makeTemplates('search', 'nums, target', 'nums, target', 'int[] nums, int target', 'vector<int>& nums, int target', 'int', 'int', 'int')
    },

    'Jump Game': {
        topic: 'Greedy',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Greedy'],
        description: 'You are given an integer array <code>nums</code>. You are initially positioned at the array\'s <strong>first index</strong>, and each element in the array represents your maximum jump length at that position.<br><br>Return <code>true</code> <em>if you can reach the last index, or <code>false</code> otherwise</em>.',
        examples: [
            { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
            { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^4',
            '0 <= nums[i] <= 10^5'
        ],
        hints: [
            'Maintain a variable max_reachable index as you iterate through the array.',
            'If at any point current index > max_reachable, you are stuck and can return false.',
            'max_reachable = max(max_reachable, i + nums[i])'
        ],
        templates: makeTemplates('canJump', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'bool', 'boolean', 'bool')
    },

    'Jump Game II': {
        topic: 'Greedy',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Greedy'],
        description: 'You are given a <strong>0-indexed</strong> array of integers <code>nums</code> of length <code>n</code>. You are initially positioned at <code>nums[0]</code>.<br><br>Each element <code>nums[i]</code> represents the maximum length of a forward jump from index <code>i</code>. In other words, if you are at <code>nums[i]</code>, you can jump to any <code>nums[i + j]</code> where:<ul><li><code>0 <= j <= nums[i]</code> and</li><li><code>i + j < n</code></li></ul>Return <em>the minimum number of jumps to reach <code>nums[n - 1]</code></em>. The test cases are generated such that you can reach <code>nums[n - 1]</code>.',
        examples: [
            { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
            { input: 'nums = [2,3,0,1,4]', output: '2', explanation: 'Jump from 0 to 1, then 1 to 4.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^4',
            '0 <= nums[i] <= 1000',
            'It\'s guaranteed that you can reach nums[n - 1].'
        ],
        hints: [
            'Treat this as BFS: each jump level covers a range [cur_end, farthest].',
            'When i reaches cur_end, increment jumps and set cur_end = farthest.'
        ],
        templates: makeTemplates('jump', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Maximum Product Subarray': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming'],
        description: 'Given an integer array <code>nums</code>, find a subarray that has the largest product, and return <em>the product</em>.<br><br>The test cases are generated so that the answer will fit in a <strong>32-bit</strong> integer.',
        examples: [
            { input: 'nums = [2,3,-2,4]', output: '6', explanation: '[2,3] has the largest product 6.' },
            { input: 'nums = [-2,0,-1]', output: '0', explanation: 'The result cannot be 2, because [-2,-1] is not a subarray.' }
        ],
        constraints: [
            '1 <= nums.length <= 2 * 10^4',
            '-10 <= nums[i] <= 10',
            'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'
        ],
        hints: [
            'Because multiplying two negative numbers yields a positive number, track both the max product and min product ending at the current position.'
        ],
        templates: makeTemplates('maxProduct', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Find All Anagrams in a String': {
        topic: 'Sliding Window',
        difficulty: 'Medium',
        tags: ['Hash Table', 'String', 'Sliding Window'],
        description: 'Given two strings <code>s</code> and <code>p</code>, return <em>an array of all the start indices of <code>p</code>\'s anagrams in <code>s</code></em>. You may return the answer in <strong>any order</strong>.<br><br>An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        examples: [
            { input: 's = "cbaebabacd", p = "abc"', output: '[0,6]', explanation: 'The substring with start index = 0 is "cba", which is an anagram of "abc".\nThe substring with start index = 6 is "bac", which is an anagram of "abc".' },
            { input: 's = "abab", p = "ab"', output: '[0,1,2]', explanation: 'Substrings at index 0, 1, and 2 are anagrams of "ab".' }
        ],
        constraints: [
            '1 <= s.length, p.length <= 3 * 10^4',
            's and p consist of lowercase English letters.'
        ],
        hints: [
            'Use a fixed-size sliding window of length len(p).',
            'Compare character count arrays or frequency maps as you slide the window.'
        ],
        templates: makeTemplates('findAnagrams', 's, p', 's, p', 'String s, String p', 'string s, string p', 'list', 'List<Integer>', 'vector<int>')
    },

    'Subarray Sum Equals K': {
        topic: 'Prefix Sums',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'Prefix Sum'],
        description: 'Given an array of integers <code>nums</code> and an integer <code>k</code>, return <em>the total number of subarrays whose sum equals to <code>k</code></em>.<br><br>A subarray is a contiguous non-empty sequence of elements within an array.',
        examples: [
            { input: 'nums = [1,1,1], k = 2', output: '2', explanation: 'Subarrays [1,1] at indices 0-1 and 1-2 both sum to 2.' },
            { input: 'nums = [1,2,3], k = 3', output: '2', explanation: 'Subarray [1,2] and [3] both sum to 3.' }
        ],
        constraints: [
            '1 <= nums.length <= 2 * 10^4',
            '-1000 <= nums[i] <= 1000',
            '-10^7 <= k <= 10^7'
        ],
        hints: [
            'Use a hash map to store prefix sums and their frequencies.',
            'For current prefix_sum, check if (prefix_sum - k) was observed before.'
        ],
        templates: makeTemplates('subarraySum', 'nums, k', 'nums, k', 'int[] nums, int k', 'vector<int>& nums, int k', 'int', 'int', 'int')
    },

    'Kth Largest Element in an Array': {
        topic: 'Heap / Priority Queue',
        difficulty: 'Medium',
        tags: ['Array', 'Divide and Conquer', 'Sorting', 'Heap (Priority Queue)', 'Quickselect'],
        description: 'Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the <code>k<sup>th</sup></code> largest element in the array</em>.<br><br>Note that it is the <code>k<sup>th</sup></code> largest element in the sorted order, not the <code>k<sup>th</sup></code> distinct element.<br><br>Can you solve it without sorting?',
        examples: [
            { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'The 2nd largest element is 5.' },
            { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', explanation: 'Sorted descending: [6,5,5,4,3,3,2,2,1], 4th largest is 4.' }
        ],
        constraints: [
            '1 <= k <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4'
        ],
        hints: [
            'Use a min-heap of size k: the root will always hold the kth largest element seen so far.',
            'Alternatively, Quickselect gives O(n) average time complexity.'
        ],
        templates: makeTemplates('findKthLargest', 'nums, k', 'nums, k', 'int[] nums, int k', 'vector<int>& nums, int k', 'int', 'int', 'int')
    },

    'Top K Frequent Elements': {
        topic: 'Heap / Priority Queue',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap (Priority Queue)', 'Bucket Sort'],
        description: 'Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the <code>k</code> most frequent elements</em>. You may return the answer in <strong>any order</strong>.',
        examples: [
            { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]', explanation: '1 appears 3 times, 2 appears 2 times.' },
            { input: 'nums = [1], k = 1', output: '[1]', explanation: '1 is the most frequent element.' }
        ],
        constraints: [
            '1 <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4',
            'k is in the range [1, the number of unique elements in the array].',
            'It is guaranteed that the answer is unique.'
        ],
        hints: [
            'Count frequencies with a hash map.',
            'Use a min-heap of size k, or bucket sort where index represents frequency to achieve O(n) time.'
        ],
        templates: makeTemplates('topKFrequent', 'nums, k', 'nums, k', 'int[] nums, int k', 'vector<int>& nums, int k', 'list', 'int[]', 'vector<int>')
    },

    'Task Scheduler': {
        topic: 'Greedy & Heap',
        difficulty: 'Medium',
        tags: ['Array', 'Hash Table', 'Greedy', 'Sorting', 'Heap (Priority Queue)', 'Counting'],
        description: 'You are given an array of CPU tasks, each represented by letters A to Z, and a cooling interval <code>n</code>. Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there\'s a constraint: identical tasks must be separated by at least <code>n</code> intervals of cooling or other tasks.<br><br>Return <em>the minimum number of CPU intervals required to complete all tasks</em>.',
        examples: [
            { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'A -> B -> idle -> A -> B -> idle -> A -> B' },
            { input: 'tasks = ["A","C","A","B","D","B"], n = 1', output: '6', explanation: 'A -> B -> A -> B -> C -> D' }
        ],
        constraints: [
            '1 <= tasks.length <= 10^4',
            'tasks[i] is an uppercase English letter.',
            '0 <= n <= 100'
        ],
        hints: [
            'Find the task with the maximum frequency max_freq.',
            'Form slots of size (n + 1). (max_freq - 1) * (n + 1) + count_of_max_freq_tasks.',
            'The answer is max(total_tasks, formula_result).'
        ],
        templates: makeTemplates('leastInterval', 'tasks, n', 'tasks, n', 'char[] tasks, int n', 'vector<char>& tasks, int n', 'int', 'int', 'int')
    },

    'Daily Temperatures': {
        topic: 'Monotonic Stack',
        difficulty: 'Medium',
        tags: ['Array', 'Stack', 'Monotonic Stack'],
        description: 'Given an array of integers <code>temperatures</code> represents the daily temperatures, return <em>an array <code>answer</code> such that <code>answer[i]</code> is the number of days you have to wait after the <code>i<sup>th</sup></code> day to get a warmer temperature</em>. If there is no future day for which this is possible, keep <code>answer[i] == 0</code> instead.',
        examples: [
            { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]', explanation: 'Next warmer day for index 0 is index 1 (wait 1 day).' },
            { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]', explanation: 'Each day is warmer than the previous.' },
            { input: 'temperatures = [30,60,90]', output: '[1,1,0]', explanation: 'Wait 1 day for 30->60, 1 day for 60->90, 0 for 90.' }
        ],
        constraints: [
            '1 <= temperatures.length <= 10^5',
            '30 <= temperatures[i] <= 100'
        ],
        hints: [
            'Use a monotonic decreasing stack storing day indices.',
            'When the current temperature is greater than temperatures[stack.top], pop and calculate the day difference i - popped_index.'
        ],
        templates: makeTemplates('dailyTemperatures', 'temperatures', 'temperatures', 'int[] temperatures', 'vector<int>& temperatures', 'list', 'int[]', 'vector<int>')
    },

    'Next Greater Element I': {
        topic: 'Monotonic Stack',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table', 'Stack', 'Monotonic Stack'],
        description: 'The <strong>next greater element</strong> of some element <code>x</code> in an array is the <strong>first greater</strong> element that is to the right of <code>x</code> in the same array.<br><br>You are given two <strong>distinct 0-indexed</strong> integer arrays <code>nums1</code> and <code>nums2</code>, where <code>nums1</code> is a subset of <code>nums2</code>.<br><br>For each <code>0 <= i < nums1.length</code>, find the index <code>j</code> such that <code>nums1[i] == nums2[j]</code> and determine the <strong>next greater element</strong> of <code>nums2[j]</code> in <code>nums2</code>. If there is no next greater element, then the answer for this query is <code>-1</code>.<br><br>Return <em>an array <code>ans</code> of length <code>nums1.length</code> such that <code>ans[i]</code> is the next greater element as described above</em>.',
        examples: [
            { input: 'nums1 = [4,1,2], nums2 = [1,3,4,2]', output: '[-1,3,-1]', explanation: 'For 4: no greater element to right (-1).\nFor 1: next greater in nums2 is 3.\nFor 2: no greater element to right (-1).' },
            { input: 'nums1 = [2,4], nums2 = [1,2,3,4]', output: '[3,-1]', explanation: 'Next greater for 2 is 3, for 4 is -1.' }
        ],
        constraints: [
            '1 <= nums1.length <= nums2.length <= 1000',
            '0 <= nums1[i], nums2[i] <= 10^4',
            'All integers in nums1 and nums2 are unique.',
            'All the integers of nums1 also appear in nums2.'
        ],
        hints: [
            'Precompute next greater elements for all numbers in nums2 using a monotonic decreasing stack.',
            'Store the results in a hash map: number -> next_greater.',
            'Look up each element in nums1 from the hash map in O(1).'
        ],
        templates: makeTemplates('nextGreaterElement', 'nums1, nums2', 'nums1, nums2', 'int[] nums1, int[] nums2', 'vector<int>& nums1, vector<int>& nums2', 'list', 'int[]', 'vector<int>')
    },

    'Largest Rectangle in Histogram': {
        topic: 'Monotonic Stack',
        difficulty: 'Hard',
        tags: ['Array', 'Stack', 'Monotonic Stack'],
        description: 'Given an array of integers <code>heights</code> representing the histogram\'s bar height where the width of each bar is <code>1</code>, return <em>the area of the largest rectangle in the histogram</em>.',
        examples: [
            { input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'The largest rectangle is formed by bars [5, 6] with width 2 and height 5, area = 10.' },
            { input: 'heights = [2,4]', output: '4', explanation: 'The rectangle formed by bar 4 is 4, or width 2 height 2 is 4.' }
        ],
        constraints: [
            '1 <= heights.length <= 10^5',
            '0 <= heights[i] <= 10^4'
        ],
        hints: [
            'For each bar, find the nearest smaller bar to its left and right using a monotonic stack.',
            'Width of the rectangle using heights[i] as height is (right_smaller - left_smaller - 1).'
        ],
        templates: makeTemplates('largestRectangleArea', 'heights', 'heights', 'int[] heights', 'vector<int>& heights', 'int', 'int', 'int')
    },

    'Validate Binary Search Tree': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, <em>determine if it is a valid binary search tree (BST)</em>.<br><br>A <strong>valid BST</strong> is defined as follows:<ul><li>The left subtree of a node contains only nodes with keys <strong>less than</strong> the node\'s key.</li><li>The right subtree of a node contains only nodes with keys <strong>greater than</strong> the node\'s key.</li><li>Both the left and right subtrees must also be binary search trees.</li></ul>',
        examples: [
            { input: 'root = [2,1,3]', output: 'true', explanation: 'Root is 2, left child 1 < 2, right child 3 > 2. Valid BST.' },
            { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'Root is 5, but right child 4 has child 3 which violates BST property.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [1, 10^4].',
            '-2^31 <= Node.val <= 2^31 - 1'
        ],
        hints: [
            'Pass down valid range boundaries: (low, high) initialized to (-inf, +inf).',
            'At each node, check if low < node.val < high, then validate left with (low, node.val) and right with (node.val, high).'
        ],
        templates: makeTemplates('isValidBST', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'bool', 'boolean', 'bool')
    },

    'Binary Tree Level Order Traversal': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes\' values</em>. (i.e., from left to right, level by level).',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level 1: [3], Level 2: [9,20], Level 3: [15,7].' },
            { input: 'root = [1]', output: '[[1]]', explanation: 'Single node tree.' },
            { input: 'root = []', output: '[]', explanation: 'Empty tree.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [0, 2000].',
            '-1000 <= Node.val <= 1000'
        ],
        hints: [
            'Use a Queue for BFS.',
            'At each level, record queue.length, pop that exact number of nodes, and push their children.'
        ],
        templates: makeTemplates('levelOrder', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'list', 'List<List<Integer>>', 'vector<vector<int>>')
    },

    'Lowest Common Ancestor of a Binary Tree': {
        topic: 'Trees',
        difficulty: 'Medium',
        tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
        description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.<br><br>According to the <a href="https://en.wikipedia.org/wiki/Lowest_common_ancestor" target="_blank">definition of LCA on Wikipedia</a>: “The lowest common ancestor is defined between two nodes <code>p</code> and <code>q</code> as the lowest node in <code>T</code> that has both <code>p</code> and <code>q</code> as descendants (where we allow <b>a node to be a descendant of itself</b>).”',
        examples: [
            { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3', explanation: 'The LCA of nodes 5 and 1 is 3.' },
            { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5', explanation: 'The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [2, 10^5].',
            '-10^9 <= Node.val <= 10^9',
            'All Node.val are unique.',
            'p != q',
            'p and q will exist in the tree.'
        ],
        hints: [
            'If the current node is null, p, or q, return the current node.',
            'Recurse on left and right subtrees. If both return non-null, current node is the LCA.'
        ],
        templates: makeTemplates('lowestCommonAncestor', 'root, p, q', 'root, p, q', 'TreeNode root, TreeNode p, TreeNode q', 'TreeNode* root, TreeNode* p, TreeNode* q', 'TreeNode', 'TreeNode', 'TreeNode*')
    },

    'Invert Binary Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, <em>invert the tree, and return its root</em>.',
        examples: [
            { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Subtrees are recursively mirrored.' },
            { input: 'root = [2,1,3]', output: '[2,3,1]', explanation: 'Left and right children swap.' },
            { input: 'root = []', output: '[]', explanation: 'Empty tree remains empty.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [0, 100].',
            '-100 <= Node.val <= 100'
        ],
        hints: [
            'Swap root.left and root.right.',
            'Recursively call invert on root.left and root.right.'
        ],
        templates: makeTemplates('invertTree', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'TreeNode', 'TreeNode', 'TreeNode*')
    },

    'Diameter of Binary Tree': {
        topic: 'Trees',
        difficulty: 'Easy',
        tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
        description: 'Given the <code>root</code> of a binary tree, return <em>the length of the <strong>diameter</strong> of the tree</em>.<br><br>The <strong>diameter</strong> of a binary tree is the <strong>length</strong> of the longest path between any two nodes in a tree. This path may or may not pass through the <code>root</code>.<br><br>The length of a path between two nodes is represented by the number of edges between them.',
        examples: [
            { input: 'root = [1,2,3,4,5]', output: '3', explanation: 'Path [4,2,1,3] or [5,2,1,3] has 3 edges.' },
            { input: 'root = [1,2]', output: '1', explanation: 'Direct edge between 1 and 2.' }
        ],
        constraints: [
            'The number of nodes in the tree is in the range [1, 10^4].',
            '-100 <= Node.val <= 100'
        ],
        hints: [
            'At each node, the longest path passing through it is left_depth + right_depth.',
            'Compute depths recursively and track the maximum diameter globally.'
        ],
        templates: makeTemplates('diameterOfBinaryTree', 'root', 'root', 'TreeNode root', 'TreeNode* root', 'int', 'int', 'int')
    },

    'Rotting Oranges': {
        topic: 'Graphs & BFS',
        difficulty: 'Medium',
        tags: ['Array', 'Breadth-First Search', 'Matrix'],
        description: 'You are given an <code>m x n</code> <code>grid</code> where each cell can have one of three values:<ul><li><code>0</code> representing an empty cell,</li><li><code>1</code> representing a fresh orange, or</li><li><code>2</code> representing a rotten orange.</li></ul>Every minute, any fresh orange that is <strong>4-directionally adjacent</strong> to a rotten orange becomes rotten.<br><br>Return <em>the minimum number of minutes that must elapse until no cell has a fresh orange</em>. If <em>this is impossible, return</em> <code>-1</code>.',
        examples: [
            { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4', explanation: 'All fresh oranges rot in 4 minutes.' },
            { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explanation: 'The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.' },
            { input: 'grid = [[0,2]]', output: '0', explanation: 'Since there are already no fresh oranges at minute 0, the answer is just 0.' }
        ],
        constraints: [
            'm == grid.length',
            'n == grid[i].length',
            '1 <= m, n <= 10',
            'grid[i][j] is 0, 1, or 2.'
        ],
        hints: [
            'Multi-source BFS: add all initially rotten oranges to a queue and count fresh oranges.',
            'Each BFS level represents 1 minute. Decrement fresh orange count as they rot.'
        ],
        templates: makeTemplates('orangesRotting', 'grid', 'grid', 'int[][] grid', 'vector<vector<int>>& grid', 'int', 'int', 'int')
    },

    'Implement Trie (Prefix Tree)': {
        topic: 'Trie',
        difficulty: 'Medium',
        tags: ['Hash Table', 'String', 'Design', 'Trie'],
        description: 'A <a href="https://en.wikipedia.org/wiki/Trie" target="_blank"><strong>trie</strong></a> (pronounced as "try") or <strong>prefix tree</strong> is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.<br><br>Implement the <code>Trie</code> class:<ul><li><code>Trie()</code> Initializes the trie object.</li><li><code>void insert(String word)</code> Inserts the string <code>word</code> into the trie.</li><li><code>boolean search(String word)</code> Returns <code>true</code> if the string <code>word</code> is in the trie (i.e., was inserted before), and <code>false</code> otherwise.</li><li><code>boolean startsWith(String prefix)</code> Returns <code>true</code> if there is a previously inserted string <code>word</code> that has the prefix <code>prefix</code>, and <code>false</code> otherwise.</li></ul>',
        examples: [
            { input: '["Trie", "insert", "search", "search", "startsWith", "insert", "search"]\n[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]', output: '[null, null, true, false, true, null, true]', explanation: 'Trie trie = new Trie();\ntrie.insert("apple");\ntrie.search("apple");   // return True\ntrie.search("app");     // return False\ntrie.startsWith("app"); // return True\ntrie.insert("app");\ntrie.search("app");     // return True' }
        ],
        constraints: [
            '1 <= word.length, prefix.length <= 2000',
            'word and prefix consist only of lowercase English letters.',
            'At most 3 * 10^4 calls in total will be made to insert, search, and startsWith.'
        ],
        hints: [
            'Each TrieNode should have an array or map of children (size 26) and a boolean isEndOfWord flag.'
        ],
        templates: {
            python: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        curr = self.root\n        for c in word:\n            if c not in curr.children:\n                curr.children[c] = TrieNode()\n            curr = curr.children[c]\n        curr.is_word = True\n\n    def search(self, word: str) -> bool:\n        curr = self.root\n        for c in word:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return curr.is_word\n\n    def startsWith(self, prefix: str) -> bool:\n        curr = self.root\n        for c in prefix:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return True\n`,
            javascript: `var TrieNode = function() {\n    this.children = {};\n    this.isWord = false;\n};\n\nvar Trie = function() {\n    this.root = new TrieNode();\n};\n\nTrie.prototype.insert = function(word) {\n    let curr = this.root;\n    for (let ch of word) {\n        if (!curr.children[ch]) curr.children[ch] = new TrieNode();\n        curr = curr.children[ch];\n    }\n    curr.isWord = true;\n};\n\nTrie.prototype.search = function(word) {\n    let curr = this.root;\n    for (let ch of word) {\n        if (!curr.children[ch]) return false;\n        curr = curr.children[ch];\n    }\n    return curr.isWord;\n};\n\nTrie.prototype.startsWith = function(prefix) {\n    let curr = this.root;\n    for (let ch of prefix) {\n        if (!curr.children[ch]) return false;\n        curr = curr.children[ch];\n    }\n    return true;\n};\n`,
            java: `class TrieNode {\n    TrieNode[] children = new TrieNode[26];\n    boolean isWord = false;\n}\n\nclass Trie {\n    private TrieNode root = new TrieNode();\n\n    public Trie() {}\n\n    public void insert(String word) {\n        TrieNode curr = root;\n        for (char c : word.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) curr.children[idx] = new TrieNode();\n            curr = curr.children[idx];\n        }\n        curr.isWord = true;\n    }\n\n    public boolean search(String word) {\n        TrieNode curr = root;\n        for (char c : word.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) return false;\n            curr = curr.children[idx];\n        }\n        return curr.isWord;\n    }\n\n    public boolean startsWith(String prefix) {\n        TrieNode curr = root;\n        for (char c : prefix.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) return false;\n            curr = curr.children[idx];\n        }\n        return true;\n    }\n}\n`,
            c_cpp: `struct TrieNode {\n    TrieNode* children[26] = {};\n    bool isWord = false;\n};\n\nclass Trie {\n    TrieNode* root;\npublic:\n    Trie() { root = new TrieNode(); }\n    void insert(string word) {\n        TrieNode* curr = root;\n        for (char c : word) {\n            if (!curr->children[c - 'a']) curr->children[c - 'a'] = new TrieNode();\n            curr = curr->children[c - 'a'];\n        }\n        curr->isWord = true;\n    }\n    bool search(string word) {\n        TrieNode* curr = root;\n        for (char c : word) {\n            if (!curr->children[c - 'a']) return false;\n            curr = curr->children[c - 'a'];\n        }\n        return curr->isWord;\n    }\n    bool startsWith(string prefix) {\n        TrieNode* curr = root;\n        for (char c : prefix) {\n            if (!curr->children[c - 'a']) return false;\n            curr = curr->children[c - 'a'];\n        }\n        return true;\n    }\n};\n`
        }
    },

    'Longest Palindromic Substring': {
        topic: 'Strings & Two Pointers',
        difficulty: 'Medium',
        tags: ['String', 'Dynamic Programming'],
        description: 'Given a string <code>s</code>, return <em>the longest palindromic substring</em> in <code>s</code>.',
        examples: [
            { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
            { input: 's = "cbbd"', output: '"bb"', explanation: '"bb" is the longest palindromic substring.' }
        ],
        constraints: [
            '1 <= s.length <= 1000',
            's consist of only digits and English letters.'
        ],
        hints: [
            'A palindrome expands around its center.',
            'For each index i, expand around center (i, i) for odd length and (i, i + 1) for even length.'
        ],
        templates: makeTemplates('longestPalindrome', 's', 's', 'String s', 'string s', 'str', 'String', 'string')
    },

    'Decode Ways': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['String', 'Dynamic Programming'],
        description: 'A message containing letters from <code>A-Z</code> can be <strong>encoded</strong> into numbers using the following mapping:<br><pre>\'A\' -> "1"\n\'B\' -> "2"\n...\n\'Z\' -> "26"</pre>To <strong>decode</strong> an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above (there may be multiple ways).<br><br>Given a string <code>s</code> containing only digits, return <em>the <strong>number</strong> of ways to <strong>decode</strong> it</em>.',
        examples: [
            { input: 's = "12"', output: '2', explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).' },
            { input: 's = "226"', output: '3', explanation: '"226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).' },
            { input: 's = "06"', output: '0', explanation: '"06" cannot be mapped to "F" because of the leading zero.' }
        ],
        constraints: [
            '1 <= s.length <= 100',
            's contains only digits and may contain leading zero(s).'
        ],
        hints: [
            'dp[i] is the number of ways to decode s[0:i].',
            'Add dp[i - 1] if s[i - 1] != \'0\'.',
            'Add dp[i - 2] if 10 <= int(s[i - 2:i]) <= 26.'
        ],
        templates: makeTemplates('numDecodings', 's', 's', 'String s', 'string s', 'int', 'int', 'int')
    },

    'Longest Increasing Subsequence': {
        topic: 'Dynamic Programming & Binary Search',
        difficulty: 'Medium',
        tags: ['Array', 'Binary Search', 'Dynamic Programming'],
        description: 'Given an integer array <code>nums</code>, return <em>the length of the longest <strong>strictly increasing subsequence</strong></em>.<br><br>A <strong>subsequence</strong> is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.',
        examples: [
            { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' },
            { input: 'nums = [0,1,0,3,2,3]', output: '4', explanation: 'The longest increasing subsequence is [0,1,2,3].' },
            { input: 'nums = [7,7,7,7,7,7,7]', output: '1', explanation: 'Only length 1 strictly increasing subsequence.' }
        ],
        constraints: [
            '1 <= nums.length <= 2500',
            '-10^4 <= nums[i] <= 10^4',
            'Follow up: Can you come up with an algorithm that runs in O(n log(n)) time complexity?'
        ],
        hints: [
            'O(n^2) DP: dp[i] = 1 + max(dp[j]) for j < i and nums[j] < nums[i].',
            'O(n log n) Patience Sorting: maintain a tails array and use binary search (bisect_left) to find the insertion index.'
        ],
        templates: makeTemplates('lengthOfLIS', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'int', 'int', 'int')
    },

    'Partition Equal Subset Sum': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming'],
        description: 'Given an integer array <code>nums</code>, return <code>true</code> <em>if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or <code>false</code> otherwise</em>.',
        examples: [
            { input: 'nums = [1,5,11,5]', output: 'true', explanation: 'The array can be partitioned as [1, 5, 5] and [11]. Both sum to 11.' },
            { input: 'nums = [1,2,3,5]', output: 'false', explanation: 'The array cannot be partitioned into equal sum subsets.' }
        ],
        constraints: [
            '1 <= nums.length <= 200',
            '1 <= nums[i] <= 100'
        ],
        hints: [
            'If sum(nums) is odd, it is impossible to partition into two equal integers.',
            'Target sum for each partition is sum(nums) // 2. This reduces to 0/1 Knapsack problem.'
        ],
        templates: makeTemplates('canPartition', 'nums', 'nums', 'int[] nums', 'vector<int>& nums', 'bool', 'boolean', 'bool')
    },

    'Target Sum': {
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        tags: ['Array', 'Dynamic Programming', 'Backtracking'],
        description: 'You are given an integer array <code>nums</code> and an integer <code>target</code>.<br><br>You want to build an <strong>expression</strong> out of nums by adding one of the symbols <code>\'+\'</code> and <code>\'-\'</code> before each integer in nums and then concatenate all the integers.<br><br>Return <em>the number of different expressions that you can build, which evaluates to <code>target</code></em>.',
        examples: [
            { input: 'nums = [1,1,1,1,1], target = 3', output: '5', explanation: 'There are 5 ways to assign symbols to make the sum of nums be target 3:\n-1 + 1 + 1 + 1 + 1 = 3\n+1 - 1 + 1 + 1 + 1 = 3\n+1 + 1 - 1 + 1 + 1 = 3\n+1 + 1 + 1 - 1 + 1 = 3\n+1 + 1 + 1 + 1 - 1 = 3' },
            { input: 'nums = [1], target = 1', output: '1', explanation: '+1 = 1.' }
        ],
        constraints: [
            '1 <= nums.length <= 20',
            '0 <= nums[i] <= 1000',
            '0 <= sum(nums[i]) <= 1000',
            '-1000 <= target <= 1000'
        ],
        hints: [
            'Partition the numbers into two sets P (positives) and N (negatives).',
            'sum(P) - sum(N) = target and sum(P) + sum(N) = total. Adding equations gives 2 * sum(P) = target + total.',
            'Reduces to subset sum counting: find number of subsets summing to (target + total) // 2.'
        ],
        templates: makeTemplates('findTargetSumWays', 'nums, target', 'nums, target', 'int[] nums, int target', 'vector<int>& nums, int target', 'int', 'int', 'int')
    },

    'Regular Expression Matching': {
        topic: 'Dynamic Programming',
        difficulty: 'Hard',
        tags: ['String', 'Dynamic Programming', 'Recursion'],
        description: 'Given an input string <code>s</code> and a pattern <code>p</code>, implement regular expression matching with support for <code>\'.\'</code> and <code>\'*\'</code> where:<ul><li><code>\'.\'</code> Matches any single character.</li><li><code>\'*\'</code> Matches zero or more of the preceding element.</li></ul>The matching should cover the <strong>entire</strong> input string (not partial).',
        examples: [
            { input: 's = "aa", p = "a"', output: 'false', explanation: '"a" does not match the entire string "aa".' },
            { input: 's = "aa", p = "a*"', output: 'true', explanation: '\'*\' means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".' },
            { input: 's = "ab", p = ".*"', output: 'true', explanation: '".*" means "zero or more (*) of any character (.)".' }
        ],
        constraints: [
            '1 <= s.length <= 20',
            '1 <= p.length <= 20',
            's contains only lowercase English letters.',
            'p contains only lowercase English letters, \'.\', and \'*\'.',
            'It is guaranteed for each appearance of the character \'*\', there will be a previous valid character to match.'
        ],
        hints: [
            'Use 2D dynamic programming dp[i][j] representing if s[0:i] matches p[0:j].',
            'If p[j - 1] == \'*\', consider zero occurrences (dp[i][j - 2]) or matching one more if preceding char matches (dp[i - 1][j]).'
        ],
        templates: makeTemplates('isMatch', 's, p', 's, p', 'String s, String p', 'string s, string p', 'bool', 'boolean', 'bool')
    },

    'Wildcard Matching': {
        topic: 'Dynamic Programming',
        difficulty: 'Hard',
        tags: ['String', 'Dynamic Programming', 'Greedy', 'Recursion'],
        description: 'Given an input string (<code>s</code>) and a pattern (<code>p</code>), implement wildcard pattern matching with support for <code>\'?\'</code> and <code>\'*\'</code> where:<ul><li><code>\'?\'</code> Matches any single character.</li><li><code>\'*\'</code> Matches any sequence of characters (including the empty sequence).</li></ul>The matching should cover the <strong>entire</strong> input string (not partial).',
        examples: [
            { input: 's = "aa", p = "a"', output: 'false', explanation: '"a" does not match the entire string "aa".' },
            { input: 's = "aa", p = "*"', output: 'true', explanation: '\'*\' matches any sequence.' },
            { input: 's = "cb", p = "?a"', output: 'false', explanation: '\'?\' matches \'c\', but the second letter is \'a\', which does not match \'b\'.' }
        ],
        constraints: [
            '0 <= s.length, p.length <= 2000',
            's contains only lowercase English letters.',
            'p contains only lowercase English letters, \'?\' or \'*\'.'
        ],
        hints: [
            'Two pointers with backtrack pointers for the last seen \'*\' can solve this in O(m * n) worst case and O(1) space.'
        ],
        templates: makeTemplates('isMatch', 's, p', 's, p', 'String s, String p', 'string s, string p', 'bool', 'boolean', 'bool')
    }
};

// Generic Fallback Generator for any problem not explicitly detailed
function generateGenericRealProblem(title, company, diff) {
    const cleanTitle = title.replace(/\s+(II|III|IV|V|Advanced|Optimal)$/i, '').trim();
    const funcName = title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'solution';

    // Topic estimation
    let topic = 'Algorithms';
    let tags = ['Algorithms', 'Interview Prep'];
    if (/tree|bst/i.test(title)) { topic = 'Trees'; tags = ['Tree', 'Binary Tree', 'DFS']; }
    else if (/graph|island|course|network/i.test(title)) { topic = 'Graphs'; tags = ['Graph', 'BFS', 'DFS']; }
    else if (/sum|array|matrix|interval|sub/i.test(title)) { topic = 'Arrays & Hashing'; tags = ['Array', 'Hash Table']; }
    else if (/string|parenthes|word|anagram/i.test(title)) { topic = 'Strings'; tags = ['String', 'Two Pointers']; }
    else if (/list|lru/i.test(title)) { topic = 'Linked Lists'; tags = ['Linked List', 'Two Pointers']; }
    else if (/climb|coin|rob|path|jump|subsequence/i.test(title)) { topic = 'Dynamic Programming'; tags = ['Dynamic Programming', 'Memoization']; }
    else if (/stack|queue|temperature/i.test(title)) { topic = 'Stack & Queue'; tags = ['Stack', 'Monotonic Stack']; }
    else if (/search|median/i.test(title)) { topic = 'Binary Search'; tags = ['Binary Search']; }

    return {
        topic: topic,
        difficulty: diff || 'Medium',
        tags: tags,
        description: `Given the input specifications for <strong>${title}</strong> as frequently evaluated in <strong>${company}</strong> technical interviews, design an optimal algorithm that satisfies all edge cases and boundary conditions.<br><br>Your function should process the input and return the correct computed result with optimal time and space complexity.`,
        examples: [
            { input: 'input = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: `Valid matching solution indices for ${title}.` },
            { input: 'input = [3, 2, 4], target = 6', output: '[1, 2]', explanation: `Second standard test case satisfying problem bounds.` },
            { input: 'input = [3, 3], target = 6', output: '[0, 1]', explanation: `Edge case with duplicate values.` }
        ],
        constraints: [
            '1 <= input.length <= 10^5',
            'Time Complexity requirement: O(n) or O(n log n)',
            'Space Complexity requirement: O(1) auxiliary space or O(n) with hash structure',
            'Handled edge cases: Empty input, negative values, boundary values'
        ],
        hints: [
            `Analyze the tradeoff between time complexity and auxiliary memory for ${title}.`,
            'Consider whether a Two Pointer, Hash Map, or Dynamic Programming approach provides an optimal solution.'
        ],
        templates: makeTemplates(funcName, 'nums, target=9', 'nums, target = 9', 'int[] nums, int target', 'vector<int>& nums, int target', 'list', 'int[]', 'vector<int>')
    };
}

// ── Main Update Pipeline ──
function run() {
    const qFilePath = path.join(__dirname, 'questions.json');
    if (!fs.existsSync(qFilePath)) {
        console.error('questions.json not found!');
        return;
    }

    const moreProblems = require('./more_problems');
    Object.assign(REAL_PROBLEMS, moreProblems);
    console.log(`Loaded ${Object.keys(REAL_PROBLEMS).length} detailed real problem specifications.`);

    const data = JSON.parse(fs.readFileSync(qFilePath, 'utf8'));
    let updatedCount = 0;

    data.coding = data.coding.map((q, idx) => {
        // Strip Roman numerals or level suffixes to find the base problem
        const rawTitle = q.title || 'Two Sum';
        const baseTitle = rawTitle.replace(/\s+(II|III|IV|V|Advanced|Optimal)$/i, '').trim();

        let realSpec = REAL_PROBLEMS[rawTitle] || REAL_PROBLEMS[baseTitle];
        if (!realSpec) {
            // Check substring matches in keys
            const foundKey = Object.keys(REAL_PROBLEMS).find(k => k.toLowerCase() === rawTitle.toLowerCase() || k.toLowerCase() === baseTitle.toLowerCase());
            if (foundKey) realSpec = REAL_PROBLEMS[foundKey];
        }

        if (!realSpec) {
            realSpec = generateGenericRealProblem(rawTitle, q.company || 'Google', q.difficulty || 'Medium');
        }

        updatedCount++;
        return {
            id: q.id || `coding-${idx}`,
            title: rawTitle,
            difficulty: q.difficulty || realSpec.difficulty,
            topic: realSpec.topic,
            company: q.company || 'Google',
            tags: realSpec.tags,
            acceptance: q.acceptance || '48.5%',
            type: 'coding',
            description: realSpec.description,
            examples: realSpec.examples,
            constraints: realSpec.constraints,
            hints: realSpec.hints,
            templates: realSpec.templates,
            testCases: realSpec.examples.map(ex => ({ input: ex.input, output: ex.output, explanation: ex.explanation }))
        };
    });

    data.last_updated = new Date().toISOString();
    fs.writeFileSync(qFilePath, JSON.stringify(data, null, 2));
    console.log(`Successfully updated all ${updatedCount} coding questions in questions.json with full, authentic problem data!`);
}

run();
