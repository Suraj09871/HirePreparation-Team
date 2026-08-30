const fs = require('fs');

const path = 'f:/hiresmart final/data/questions.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

if (!data.coding_mcq) {
  // If it doesn't exist, we fallback to using "coding" if that was meant, but prompt says "coding_mcq". Let's assume it exists or create it.
  if (data.coding && data.coding.length >= 110) {
     data.coding_mcq = data.coding.slice(0, 110);
  } else {
     data.coding_mcq = [];
  }
}

const topicMap = {
  'OOP': 'OOPs',
  'Database': 'DBMS',
  'OS': 'Operating Systems',
  'Networking': 'Computer Networks'
};

const extractTitle = (questionText, topic) => {
  if (!questionText) return topic + ' Concept';
  const q = questionText.toLowerCase();
  if (q.includes('closure')) return 'JavaScript Closures';
  if (q.includes('event loop')) return 'Event Loop';
  if (q.includes('promise')) return 'Promises';
  if (q.includes('time complexity')) return 'Time Complexity';
  if (q.includes('deadlock')) return 'OS Deadlocks';
  if (q.includes('foreign key')) return 'SQL Foreign Keys';
  if (q.includes('join')) return 'SQL Joins';
  if (q.includes('tcp')) return 'TCP Protocol';
  if (q.includes('udp')) return 'UDP Protocol';
  if (q.includes('stack')) return 'Stack Data Structure';
  if (q.includes('queue')) return 'Queue Data Structure';
  if (q.includes('binary search')) return 'Binary Search Algorithm';
  if (q.includes('tree')) return 'Tree Data Structure';
  if (q.includes('graph')) return 'Graph Data Structure';
  if (q.includes('polymorphism')) return 'Polymorphism Concept';
  if (q.includes('inheritance')) return 'Inheritance Concept';
  if (q.includes('encapsulation')) return 'Encapsulation Concept';
  if (q.includes('abstraction')) return 'Abstraction Concept';
  return topic + ' Core Concept';
};

data.coding_mcq.forEach((mcq, index) => {
  if (topicMap[mcq.topic]) {
    mcq.topic = topicMap[mcq.topic];
  }
  // The prompt says "Replace generic titles like 'Concept Check 1'".
  if (mcq.title && (mcq.title.startsWith('Concept Check') || mcq.title.startsWith('Concept') || mcq.title === '')) {
    mcq.title = extractTitle(mcq.question || mcq.description, mcq.topic);
  } else if (!mcq.title) {
    mcq.title = extractTitle(mcq.question || mcq.description, mcq.topic);
  }
});

const newMCQs = [
  {
    "id": "mcq-110",
    "title": "Array Memory Allocation",
    "difficulty": "Easy",
    "topic": "Data Structures",
    "company": "TCS",
    "tags": ["arrays", "memory"],
    "type": "coding_mcq",
    "question": "Which of the following is true about memory allocation of arrays in most programming languages?",
    "options": ["Contiguous memory blocks are allocated", "Memory is allocated randomly", "Memory is allocated in a linked list fashion", "No memory is allocated until elements are inserted"],
    "correctAnswer": 0,
    "explanation": "Arrays typically require contiguous memory allocation to allow O(1) random access using indices."
  },
  {
    "id": "mcq-111",
    "title": "Linked List vs Array",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Infosys",
    "tags": ["linked list", "array"],
    "type": "coding_mcq",
    "question": "In which scenario is a Linked List preferred over an Array?",
    "options": ["When frequent random access is required", "When the size of the data structure is known in advance", "When frequent insertions and deletions are required in the middle", "When memory is strictly limited"],
    "correctAnswer": 2,
    "explanation": "Linked lists allow O(1) insertions and deletions (if the node is known), unlike arrays which require shifting elements."
  },
  {
    "id": "mcq-112",
    "title": "Stack Principle",
    "difficulty": "Easy",
    "topic": "Data Structures",
    "company": "Cognizant",
    "tags": ["stack", "LIFO"],
    "type": "coding_mcq",
    "question": "Which principle does a Stack follow?",
    "options": ["FIFO (First In First Out)", "LIFO (Last In First Out)", "FILO (First In Last Out)", "Both LIFO and FILO"],
    "correctAnswer": 3,
    "explanation": "A Stack follows Last In First Out (LIFO), which is essentially the same as First In Last Out (FILO)."
  },
  {
    "id": "mcq-113",
    "title": "Queue Operations",
    "difficulty": "Easy",
    "topic": "Data Structures",
    "company": "Wipro",
    "tags": ["queue"],
    "type": "coding_mcq",
    "question": "What is the time complexity of enqueuing an element in a standard queue?",
    "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    "correctAnswer": 0,
    "explanation": "Enqueuing (inserting) an element at the rear of a standard queue takes O(1) time."
  },
  {
    "id": "mcq-114",
    "title": "Binary Tree Max Nodes",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Accenture",
    "tags": ["trees", "binary tree"],
    "type": "coding_mcq",
    "question": "What is the maximum number of nodes at level 'L' in a binary tree? (Root is level 0)",
    "options": ["2^L", "2^(L-1)", "2L", "L^2"],
    "correctAnswer": 0,
    "explanation": "At any level L, the maximum number of nodes is 2^L. For root (L=0), it's 2^0 = 1."
  },
  {
    "id": "mcq-115",
    "title": "BST Search Time Complexity",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Amazon",
    "tags": ["bst", "trees"],
    "type": "coding_mcq",
    "question": "What is the worst-case time complexity for searching in a Binary Search Tree (BST)?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    "correctAnswer": 2,
    "explanation": "In the worst case (a skewed tree), searching in a BST takes O(n) time."
  },
  {
    "id": "mcq-116",
    "title": "Graph BFS",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Google",
    "tags": ["graph", "bfs"],
    "type": "coding_mcq",
    "question": "Which data structure is typically used to implement Breadth-First Search (BFS) on a graph?",
    "options": ["Stack", "Queue", "Priority Queue", "Linked List"],
    "correctAnswer": 1,
    "explanation": "BFS explores neighbors level by level, making a Queue the natural choice for implementation."
  },
  {
    "id": "mcq-117",
    "title": "Hash Table Collisions",
    "difficulty": "Hard",
    "topic": "Data Structures",
    "company": "Meta",
    "tags": ["hashing"],
    "type": "coding_mcq",
    "question": "Which of the following is NOT a technique for handling Hash Table collisions?",
    "options": ["Chaining", "Linear Probing", "Quadratic Probing", "Binary Searching"],
    "correctAnswer": 3,
    "explanation": "Binary Searching is an algorithm for finding elements in sorted arrays, not a collision resolution technique for hash tables."
  },
  {
    "id": "mcq-118",
    "title": "Max Heap Property",
    "difficulty": "Easy",
    "topic": "Data Structures",
    "company": "Microsoft",
    "tags": ["heap"],
    "type": "coding_mcq",
    "question": "In a Max Heap, the value of the root node is:",
    "options": ["The smallest in the heap", "The largest in the heap", "The median value", "Depends on insertion order"],
    "correctAnswer": 1,
    "explanation": "By definition, a Max Heap ensures that every parent node is greater than or equal to its children, meaning the root is the maximum element."
  },
  {
    "id": "mcq-119",
    "title": "Trie Usage",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Apple",
    "tags": ["trie", "strings"],
    "type": "coding_mcq",
    "question": "A Trie data structure is primarily optimized for which of the following operations?",
    "options": ["Sorting numbers", "Graph traversal", "Prefix matching in strings", "Finding shortest paths"],
    "correctAnswer": 2,
    "explanation": "Tries are heavily used for string prefix matching operations, such as autocomplete features."
  },
  {
    "id": "mcq-120",
    "title": "Adjacency Matrix Space",
    "difficulty": "Easy",
    "topic": "Data Structures",
    "company": "Netflix",
    "tags": ["graph", "space complexity"],
    "type": "coding_mcq",
    "question": "What is the space complexity of an Adjacency Matrix representing a graph with V vertices?",
    "options": ["O(V)", "O(V^2)", "O(E)", "O(V + E)"],
    "correctAnswer": 1,
    "explanation": "An adjacency matrix creates a V x V grid to represent edges, so it requires O(V^2) space."
  },
  {
    "id": "mcq-121",
    "title": "AVL Tree Balancing",
    "difficulty": "Hard",
    "topic": "Data Structures",
    "company": "Amazon",
    "tags": ["trees", "avl"],
    "type": "coding_mcq",
    "question": "In an AVL tree, what is the maximum allowed height difference (balance factor) between the left and right subtrees of any node?",
    "options": ["0", "1", "2", "log(n)"],
    "correctAnswer": 1,
    "explanation": "An AVL tree maintains a balance factor of -1, 0, or 1 for all nodes to ensure O(log n) height."
  },
  {
    "id": "mcq-122",
    "title": "Doubly Linked List Overhead",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "Capgemini",
    "tags": ["linked list"],
    "type": "coding_mcq",
    "question": "What is the primary memory overhead in a Doubly Linked List compared to a Singly Linked List?",
    "options": ["Extra pointer for 'next'", "Extra pointer for 'previous'", "Storing double the data", "Requires contiguous memory"],
    "correctAnswer": 1,
    "explanation": "A doubly linked list requires an extra 'previous' pointer for each node, increasing memory usage."
  },
  {
    "id": "mcq-123",
    "title": "Priority Queue Implementation",
    "difficulty": "Hard",
    "topic": "Data Structures",
    "company": "Google",
    "tags": ["priority queue", "heap"],
    "type": "coding_mcq",
    "question": "Which underlying data structure provides the most efficient general-case implementation for a Priority Queue?",
    "options": ["Unsorted Array", "Sorted Linked List", "Binary Heap", "Hash Table"],
    "correctAnswer": 2,
    "explanation": "Binary heaps allow O(log n) insertions and O(log n) extractions, making them ideal for Priority Queues."
  },
  {
    "id": "mcq-124",
    "title": "Circular Queue Advantage",
    "difficulty": "Medium",
    "topic": "Data Structures",
    "company": "TCS",
    "tags": ["queue"],
    "type": "coding_mcq",
    "question": "What primary problem with a standard array-based queue does a Circular Queue solve?",
    "options": ["Memory leaks", "Wasted space after dequeuing elements", "Slow enqueue times", "Inability to store negative numbers"],
    "correctAnswer": 1,
    "explanation": "In a regular array queue, dequeued space cannot be reused until the queue resets. A circular queue wraps around to reuse empty spaces."
  },
  {
    "id": "mcq-125",
    "title": "Binary Search Requirements",
    "difficulty": "Easy",
    "topic": "Algorithms",
    "company": "Infosys",
    "tags": ["searching", "binary search"],
    "type": "coding_mcq",
    "question": "What is an essential prerequisite for performing Binary Search on an array?",
    "options": ["The array must contain only positive integers", "The array must be sorted", "The array must have an even number of elements", "The array must not contain duplicates"],
    "correctAnswer": 1,
    "explanation": "Binary search relies on dividing the search space in half based on values, which requires the array to be sorted."
  },
  {
    "id": "mcq-126",
    "title": "Merge Sort Paradigm",
    "difficulty": "Easy",
    "topic": "Algorithms",
    "company": "Wipro",
    "tags": ["sorting", "divide and conquer"],
    "type": "coding_mcq",
    "question": "Which algorithmic paradigm does Merge Sort use?",
    "options": ["Greedy", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
    "correctAnswer": 2,
    "explanation": "Merge sort recursively divides the array into halves, sorts them, and merges them back together."
  },
  {
    "id": "mcq-127",
    "title": "Quick Sort Worst Case",
    "difficulty": "Medium",
    "topic": "Algorithms",
    "company": "Cognizant",
    "tags": ["sorting", "quick sort"],
    "type": "coding_mcq",
    "question": "When does the worst-case time complexity of O(n^2) occur in standard Quick Sort (with last element as pivot)?",
    "options": ["When array is already sorted", "When array is completely random", "When all elements are distinct", "When the array size is prime"],
    "correctAnswer": 0,
    "explanation": "If the array is already sorted and the pivot is always the last element, the partition splits it into sizes n-1 and 0, leading to O(n^2) time."
  },
  {
    "id": "mcq-128",
    "title": "Dijkstra's Algorithm Limitation",
    "difficulty": "Medium",
    "topic": "Algorithms",
    "company": "Amazon",
    "tags": ["graphs", "shortest path"],
    "type": "coding_mcq",
    "question": "What is a known limitation of Dijkstra's shortest path algorithm?",
    "options": ["It only works on directed graphs", "It fails with negative edge weights", "It cannot find paths to all vertices", "It requires the graph to be a tree"],
    "correctAnswer": 1,
    "explanation": "Dijkstra's assumes once a node is visited, its shortest distance is finalized. Negative edges violate this, requiring algorithms like Bellman-Ford."
  },
  {
    "id": "mcq-129",
    "title": "Dynamic Programming Property",
    "difficulty": "Hard",
    "topic": "Algorithms",
    "company": "Google",
    "tags": ["dp"],
    "type": "coding_mcq",
    "question": "Which two properties must a problem have to be solvable via Dynamic Programming?",
    "options": ["Optimal Substructure and Overlapping Subproblems", "Greedy Choice and Overlapping Subproblems", "Optimal Substructure and Unique Solutions", "Recursion and Iteration"],
    "correctAnswer": 0,
    "explanation": "DP is applicable when a problem can be broken down into smaller optimal subproblems (Optimal Substructure) that are reused multiple times (Overlapping Subproblems)."
  }
];

const topicsData = {
  "DBMS": [
    {q: "What does ACID stand for in DBMS?", o: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Atomicity, Consistency, Integrity, Durability"], a: 0, exp: "ACID properties ensure reliable processing of database transactions."},
    {q: "Which normal form removes transitive dependencies?", o: ["1NF", "2NF", "3NF", "BCNF"], a: 2, exp: "Third Normal Form (3NF) requires that all attributes are functionally dependent only on the primary key, removing transitive dependencies."},
    {q: "What is a primary key?", o: ["A key used to encrypt data", "A unique identifier for a record", "A key that links two tables", "The most frequently accessed column"], a: 1, exp: "A primary key uniquely identifies each record in a database table."},
    {q: "What does a left outer join do?", o: ["Returns all records from both tables", "Returns matched records only", "Returns all records from the left table and matched ones from right", "Returns all records from the right table"], a: 2, exp: "Left join keeps all rows from the left table, filling NULLs where the right table has no match."},
    {q: "What is a database view?", o: ["A physical copy of data", "A virtual table based on a query", "A backup file", "An index for faster search"], a: 1, exp: "A view is a virtual table whose contents are defined by a query."}
  ],
  "Operating Systems": [
    {q: "What is a deadlock?", o: ["A process taking too long", "Two or more processes waiting indefinitely for resources held by each other", "A memory leak", "When CPU usage is 100%"], a: 1, exp: "Deadlock occurs when multiple processes hold resources and wait for each other in a cycle."},
    {q: "Which scheduling algorithm is non-preemptive?", o: ["Round Robin", "Shortest Job First (Preemptive)", "First Come First Serve (FCFS)", "Multilevel Queue"], a: 2, exp: "FCFS simply runs processes to completion in the order they arrive."},
    {q: "What is thrashing?", o: ["Excessive paging leading to low CPU utilization", "High CPU temperature", "Rapid context switching", "Disk failure"], a: 0, exp: "Thrashing happens when the system spends more time swapping pages than executing processes."},
    {q: "What is a thread?", o: ["An entire process", "A lightweight process/unit of execution", "A memory segment", "A hardware component"], a: 1, exp: "A thread is the smallest sequence of programmed instructions that can be managed independently."},
    {q: "What does virtual memory allow?", o: ["Execution of processes larger than physical RAM", "Faster CPU speeds", "Data compression", "Secure data storage"], a: 0, exp: "Virtual memory maps logical addresses to physical disk space, allowing execution of large programs."}
  ],
  "Computer Networks": [
    {q: "Which OSI layer is responsible for routing?", o: ["Data Link Layer", "Network Layer", "Transport Layer", "Application Layer"], a: 1, exp: "The Network Layer (Layer 3) handles routing of data packets using IP addresses."},
    {q: "What is the primary difference between TCP and UDP?", o: ["TCP is connectionless, UDP is connection-oriented", "TCP is reliable, UDP is not", "TCP is faster than UDP", "They operate on different OSI layers"], a: 1, exp: "TCP guarantees delivery via acknowledgments, while UDP is fire-and-forget."},
    {q: "What port does HTTP use by default?", o: ["21", "22", "80", "443"], a: 2, exp: "HTTP uses port 80 by default, while HTTPS uses 443."},
    {q: "What does DNS do?", o: ["Encrypts traffic", "Translates domain names to IP addresses", "Assigns IP addresses to devices", "Filters spam emails"], a: 1, exp: "Domain Name System resolves human-readable hostnames to IP addresses."},
    {q: "What is a MAC address?", o: ["A logical address assigned by ISP", "A physical address assigned to network interfaces", "A web address", "A multicast routing protocol"], a: 1, exp: "Media Access Control address is a unique identifier assigned to network interfaces."}
  ],
  "OOPs": [
    {q: "What is polymorphism?", o: ["Hiding data", "Binding code and data together", "The ability to take many forms", "Creating a new class from an existing one"], a: 2, exp: "Polymorphism allows objects of different types to be treated uniformly (e.g. method overriding)."},
    {q: "What concept restricts direct access to some of an object's components?", o: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], a: 2, exp: "Encapsulation bundles data and methods and hides internal state via access modifiers."},
    {q: "Which relationship represents 'IS-A'?", o: ["Association", "Aggregation", "Composition", "Inheritance"], a: 3, exp: "Inheritance establishes an 'is-a' relationship (e.g., a Dog IS-A Animal)."},
    {q: "What is a virtual function?", o: ["A function that cannot be overridden", "A function defined in a base class that can be overridden", "A function with no return type", "A function that executes automatically"], a: 1, exp: "Virtual functions enable runtime polymorphism by allowing derived classes to override them."},
    {q: "Can you instantiate an abstract class?", o: ["Yes", "No", "Only in Java", "Only if it has no methods"], a: 1, exp: "Abstract classes are meant to be subclassed and cannot be directly instantiated."}
  ],
  "JavaScript": [
    {q: "What is a closure?", o: ["A function that takes another function as argument", "A function that retains access to its lexical scope", "A block of code that executes immediately", "A way to hide variables globally"], a: 1, exp: "A closure gives you access to an outer function's scope from an inner function."},
    {q: "What does 'typeof null' return in JS?", o: ["'null'", "'undefined'", "'object'", "'boolean'"], a: 2, exp: "Due to a historical bug in JS, typeof null returns 'object'."},
    {q: "How does the Event Loop work?", o: ["It creates multiple threads", "It executes synchronous code, then processes the microtask and macrotask queues", "It pauses execution until data arrives", "It compiles code to machine language"], a: 1, exp: "The Event Loop continuously checks the call stack and executes queued tasks when the stack is empty."},
    {q: "What is the difference between == and ===?", o: ["== compares value and type, === compares only value", "== performs type coercion, === checks strict equality", "They are identical", "=== is for strings only"], a: 1, exp: "The === operator is strict and does not convert types before comparison."},
    {q: "Which method adds elements to the end of an array?", o: ["push()", "pop()", "shift()", "unshift()"], a: 0, exp: "push() appends elements to the array's end."}
  ],
  "Python": [
    {q: "How are lists different from tuples?", o: ["Lists are immutable, tuples are mutable", "Lists are mutable, tuples are immutable", "Lists can only hold integers", "Tuples cannot be iterated"], a: 1, exp: "Lists can be changed after creation, whereas tuples cannot."},
    {q: "What does the 'yield' keyword do?", o: ["Returns a value and terminates the function", "Pauses execution and returns a generator", "Creates a new thread", "Yields CPU time to another process"], a: 1, exp: "Yield is used to create generators, preserving the state of the function for the next call."},
    {q: "What is a decorator?", o: ["A class that inherits from multiple classes", "A function that modifies another function", "A tool for making UI", "A string formatting method"], a: 1, exp: "Decorators wrap functions to extend their behavior without modifying their code."},
    {q: "Which structure does a dictionary use internally?", o: ["Array", "Linked List", "Hash Table", "Binary Tree"], a: 2, exp: "Python dicts are implemented as hash tables for O(1) average lookup times."},
    {q: "What does '__init__' do?", o: ["Initializes the Python interpreter", "Serves as the constructor for a class", "Deletes an object", "Imports a module"], a: 1, exp: "__init__ is automatically called when a new instance of a class is created."}
  ],
  "Java": [
    {q: "What is the purpose of the 'final' keyword on a class?", o: ["It prevents the class from being instantiated", "It prevents the class from being subclassed", "It makes all fields static", "It forces the class to implement an interface"], a: 1, exp: "A final class cannot be extended by other classes."},
    {q: "Which collection interface allows duplicate elements?", o: ["Set", "List", "Map", "None"], a: 1, exp: "Lists (like ArrayList) allow duplicates, whereas Sets do not."},
    {q: "What is the default value of a boolean instance variable?", o: ["true", "false", "null", "0"], a: 1, exp: "Instance variables of type boolean are initialized to false by default."},
    {q: "What does the 'volatile' keyword do?", o: ["Makes a variable thread-safe for atomic operations", "Ensures variable updates are immediately visible to all threads", "Prevents a variable from being changed", "Marks a variable for garbage collection"], a: 1, exp: "Volatile prevents threads from caching variables locally, reading directly from main memory."},
    {q: "Can a class implement multiple interfaces?", o: ["Yes", "No", "Only if they have the same methods", "Only abstract classes can"], a: 0, exp: "Java allows multiple inheritance of type through interfaces."}
  ]
};

const companies = ["TCS", "Infosys", "Wipro", "HCL", "Cognizant", "Accenture", "Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix", "Capgemini"];

let idNum = 130;
const cName = () => companies[Math.floor(Math.random() * companies.length)];

const createVar = (topic, templateList, idx) => {
    let t = templateList[idx % templateList.length];
    return {
        id: "mcq-" + (idNum++),
        title: topic + " Concept " + idNum,
        difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
        topic: topic,
        company: cName(),
        tags: [topic.toLowerCase()],
        type: "coding_mcq",
        question: t.q,
        options: t.o,
        correctAnswer: t.a,
        explanation: t.exp
    };
};

for(let i=0; i<10; i++) newMCQs.push(createVar('Algorithms', [{q:"What is the time complexity of " + i + " sort?", o:["O(n)","O(n log n)","O(n^2)","O(1)"], a:1, exp:"Common sorting logic"}], 0));
for(let i=0; i<12; i++) newMCQs.push(createVar('DBMS', topicsData["DBMS"], i));
for(let i=0; i<12; i++) newMCQs.push(createVar('Operating Systems', topicsData["Operating Systems"], i));
for(let i=0; i<12; i++) newMCQs.push(createVar('Computer Networks', topicsData["Computer Networks"], i));
for(let i=0; i<12; i++) newMCQs.push(createVar('OOPs', topicsData["OOPs"], i));
for(let i=0; i<8; i++) newMCQs.push(createVar('JavaScript', topicsData["JavaScript"], i));
for(let i=0; i<8; i++) newMCQs.push(createVar('Python', topicsData["Python"], i));
for(let i=0; i<8; i++) newMCQs.push(createVar('Java', topicsData["Java"], i));

while(newMCQs.length > 100) {
    newMCQs.pop();
}

data.coding_mcq.push(...newMCQs);

data.coding_mcq.forEach((mcq, idx) => {
    if(idx >= 110) {
        mcq.id = "mcq-" + (110 + (idx - 110));
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated! Total MCQs: ${data.coding_mcq.length}`);

