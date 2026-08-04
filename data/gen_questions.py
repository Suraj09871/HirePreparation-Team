import json
import random
import os
import math

companies = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL", "Capgemini"]
topics = ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Strings", "Stack", "Queue", "Sorting", "Binary Search", "Greedy", "Backtracking", "Bit Manipulation", "Math", "Recursion"]

coding_base = [
    "Two Sum", "Valid Parentheses", "Merge Two Sorted Lists", "Best Time to Buy and Sell Stock", 
    "Maximum Subarray", "Climbing Stairs", "Reverse Linked List", "Symmetric Tree", 
    "Single Number", "Majority Element", "Move Zeroes", "Intersection of Two Arrays", 
    "Contains Duplicate", "Binary Search", "First Bad Version", "Palindrome Linked List", 
    "Convert Sorted Array to BST", "Path Sum", "Min Stack", "Remove Duplicates", 
    "Roman to Integer", "Valid Anagram", "Group Anagrams", "3Sum", "Container With Most Water", 
    "Longest Substring Without Repeating Characters", "Median of Two Sorted Arrays", 
    "Trapping Rain Water", "Merge Intervals", "Subsets", "Word Search", "Rotate Image", 
    "Spiral Matrix", "Number of Islands", "Course Schedule", "Clone Graph", "Word Break", 
    "LRU Cache", "Coin Change", "House Robber", "Unique Paths", "Edit Distance", 
    "Longest Common Subsequence", "Serialize and Deserialize Binary Tree", "Find Median from Data Stream",
    "Sliding Window Maximum", "Minimum Window Substring", "Merge k Sorted Lists", 
    "Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array",
    "Jump Game", "Jump Game II", "Insert Interval", "Maximum Product Subarray",
    "Find All Anagrams in a String", "Subarray Sum Equals K", "Kth Largest Element in an Array",
    "Top K Frequent Elements", "Task Scheduler", "Daily Temperatures",
    "Next Greater Element I", "Next Greater Element II", "Next Greater Element III",
    "Largest Rectangle in Histogram", "Maximal Rectangle", "Count Good Nodes in Binary Tree",
    "Lowest Common Ancestor of a Binary Tree", "Lowest Common Ancestor of a Binary Search Tree",
    "Validate Binary Search Tree", "Binary Tree Level Order Traversal",
    "Binary Tree Right Side View", "Construct Binary Tree from Preorder and Inorder Traversal",
    "Kth Smallest Element in a BST", "Invert Binary Tree", "Diameter of Binary Tree",
    "Balanced Binary Tree", "Same Tree", "Subtree of Another Tree",
    "Pacific Atlantic Water Flow", "Surrounded Regions", "Rotting Oranges",
    "Walls and Gates", "Design Add and Search Words Data Structure", "Word Dictionary",
    "Implement Trie (Prefix Tree)", "Design In-Memory File System",
    "Design Search Autocomplete System", "Design Tic-Tac-Toe",
    "Longest Palindromic Substring", "Palindromic Substrings",
    "Decode Ways", "Word Break II", "Partition Equal Subset Sum",
    "Target Sum", "Longest Increasing Subsequence",
    "Maximum Alternating Subsequence Sum", "Russian Doll Envelopes",
    "Regular Expression Matching", "Wildcard Matching"
]

mcq_topics = ["JavaScript", "Python", "Java", "C++", "Data Structures", "OOP", "Database", "OS", "Networking"]
mcq_base_qs = [
    ("What is a closure in JavaScript?", ["A function with its lexical environment", "A type of loop", "A design pattern", "A block of code"], 0),
    ("Which of the following is not a pillar of OOP?", ["Polymorphism", "Inheritance", "Compilation", "Encapsulation"], 2),
    ("What is the time complexity of binary search?", ["O(1)", "O(n)", "O(log n)", "O(n^2)"], 2),
    ("Which of the following is an OS concept?", ["Virtual Memory", "DOM Manipulation", "Generators", "Promises"], 0),
    ("What does SQL stand for?", ["Structured Query Language", "Strong Question Language", "Structured Quality Language", "Sequential Query Language"], 0),
    ("What is the purpose of the event loop in JavaScript?", ["To handle asynchronous operations", "To compile code", "To style the webpage", "To query databases"], 0),
    ("Which keyword is used to create a generator in Python?", ["yield", "return", "generate", "async"], 0),
    ("What is a Promise in JavaScript?", ["An object representing eventual completion or failure of an async operation", "A guarantee to return a value immediately", "A mathematical function", "A database query"], 0),
    ("Which design pattern ensures only one instance of a class exists?", ["Factory", "Observer", "Singleton", "Decorator"], 2),
    ("What is the main advantage of a Linked List over an Array?", ["O(1) access time", "Dynamic size", "Less memory usage", "Better cache locality"], 1),
    ("What is the difference between a process and a thread?", ["Threads are independent, processes share memory", "Processes are independent, threads share memory", "They are exactly the same", "Threads are hardware, processes are software"], 1),
    ("Which layer of OSI model does IP protocol work on?", ["Application", "Transport", "Network", "Data Link"], 2),
    ("What is a Foreign Key in SQL?", ["A key that uniquely identifies a record", "A key that references a Primary Key in another table", "An encrypted key", "A key used for indexing"], 1)
]

aptitude_topics = ["Quantitative", "Logical Reasoning", "Verbal Ability", "Data Interpretation", "Probability", "Permutation & Combination", "Time & Work", "Profit & Loss", "Percentage", "Number Series", "Blood Relations", "Coding-Decoding", "Syllogisms", "Analogies"]
aptitude_base_qs = [
    ("A train 120m long passes a platform 80m long in 20 seconds. Find the speed of the train.", ["10 m/s", "15 m/s", "20 m/s", "25 m/s"], 0),
    ("If 15 men can do a work in 20 days, in how many days can 10 men do it?", ["25", "30", "35", "40"], 1),
    ("A shopkeeper sold an article for Rs.450 at a profit of 20%. Find the cost price.", ["Rs.350", "Rs.375", "Rs.400", "Rs.425"], 1),
    ("What comes next in the series: 2, 6, 12, 20, 30, ?", ["36", "40", "42", "46"], 2),
    ("Find the odd one out: 3, 5, 11, 14, 17, 21", ["11", "14", "17", "21"], 1),
    ("A can do a piece of work in 12 days and B in 15 days. They work together for 5 days and then B leaves. How many days will A take to finish the remaining work?", ["2 days", "3 days", "4 days", "5 days"], 1),
    ("Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. The smaller number is:", ["27", "33", "49", "55"], 1),
    ("In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?", ["QDFHS", "SDFHS", "SHFDQ", "UJHFS"], 0),
    ("Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", ["His own", "His son's", "His father's", "His nephew's"], 1),
    ("If the day before yesterday was Thursday, when will Sunday be?", ["Today", "Tomorrow", "Day after tomorrow", "Two days after tomorrow"], 1),
    ("In a class of 40 students, 25 speak Hindi and 20 speak English. How many speak both?", ["5", "10", "15", "20"], 0),
    ("A man walks 5 km toward south and then turns to the right. After walking 3 km he turns to the left and walks 4 km. And then he goes back 10 km straight. Now in which direction is he from the starting place?", ["South-West", "North-West", "North-East", "South-East"], 1)
]


def generate_coding(num_questions):
    questions = []
    for i in range(num_questions):
        title_base = coding_base[i % len(coding_base)]
        if i >= len(coding_base):
            title = f"{title_base} {random.choice(['II', 'III', 'IV', 'V', 'Advanced', 'Optimal'])}"
        else:
            title = title_base
        
        id_slug = title.lower().replace(" ", "-").replace("'", "")
        
        # Difficulty logic based on company
        comp = random.choice(companies)
        if comp in ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL", "Capgemini"]:
            diff = random.choices(["Easy", "Medium", "Hard"], weights=[60, 30, 10])[0]
        else:
            diff = random.choices(["Easy", "Medium", "Hard"], weights=[20, 50, 30])[0]

        q = {
            "id": f"{id_slug}-{i}",
            "title": title,
            "difficulty": diff,
            "topic": random.choice(topics),
            "company": comp,
            "tags": random.sample(topics, random.randint(1, 3)),
            "acceptance": f"{round(random.uniform(20.0, 85.0), 1)}%",
            "type": "coding",
            "description": f"This is a {diff.lower()} level coding problem commonly asked at {comp}. You need to implement an efficient solution to solve the {title} problem.",
            "examples": [
                {
                    "input": "example input 1",
                    "output": "example output 1",
                    "explanation": "This explains why the output is what it is."
                },
                {
                    "input": "example input 2",
                    "output": "example output 2",
                    "explanation": "Another explanation for the second case."
                }
            ],
            "constraints": [
                "1 <= input.length <= 10^5",
                "Time complexity should be O(n)"
            ],
            "hints": [
                "Try using a hash map to store seen values.",
                "Can you do it in one pass?",
                "Think about dynamic programming."
            ]
        }
        questions.append(q)
    return questions

def generate_mcq(num_questions):
    questions = []
    for i in range(num_questions):
        base_q, options, correct = mcq_base_qs[i % len(mcq_base_qs)]
        
        q = {
            "id": f"mcq-{i}",
            "title": f"Concept Check {i+1}",
            "difficulty": random.choices(["Easy", "Medium", "Hard"], weights=[40, 45, 15])[0],
            "topic": random.choice(mcq_topics),
            "company": random.choice(companies),
            "tags": random.sample(mcq_topics, random.randint(1, 3)),
            "type": "coding_mcq",
            "question": base_q if i < len(mcq_base_qs) else f"Variation of {base_q} (Variant {i})",
            "options": options,
            "correctAnswer": correct,
            "explanation": f"The correct answer is option {['A', 'B', 'C', 'D'][correct]}. This is an important concept in {mcq_topics[0]}."
        }
        questions.append(q)
    return questions

def generate_aptitude(num_questions):
    questions = []
    for i in range(num_questions):
        base_q, options, correct = aptitude_base_qs[i % len(aptitude_base_qs)]
        
        q = {
            "id": f"aptitude-{i}",
            "title": f"Aptitude Test {i+1}",
            "difficulty": random.choices(["Easy", "Medium", "Hard"], weights=[40, 40, 20])[0],
            "topic": random.choice(aptitude_topics),
            "company": random.choice(["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini", "HCL"]),
            "tags": random.sample(aptitude_topics, random.randint(1, 2)),
            "type": "aptitude",
            "question": base_q if i < len(aptitude_base_qs) else f"Variation of: {base_q} (Variant {i})",
            "options": options,
            "correctAnswer": correct,
            "explanation": f"Detailed step-by-step solution for the problem. The correct option is {correct+1}."
        }
        questions.append(q)
    return questions

def main():
    data = {
        "coding": generate_coding(210),
        "coding_mcq": generate_mcq(110),
        "aptitude": generate_aptitude(210)
    }

    output_path = r"f:\hiresmart final\data\questions.json"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated {len(data['coding'])} coding questions")
    print(f"Generated {len(data['coding_mcq'])} MCQ questions")
    print(f"Generated {len(data['aptitude'])} aptitude questions")
    print(f"Total size: {os.path.getsize(output_path) / 1024:.2f} KB")

if __name__ == "__main__":
    main()
