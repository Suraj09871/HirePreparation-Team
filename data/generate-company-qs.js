const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'questions.json');
let existing = { coding: [], aptitude: [], coding_mcq: [], company_prep: [] };

if (fs.existsSync(targetFile)) {
    existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
}

const companies = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Infosys', 'Razorpay'];
const topics = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'System Design', 'Behavioral'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const templates = [
    { title: "Two Sum Variants", topic: "Array" },
    { title: "Longest Substring Without Repeating", topic: "String" },
    { title: "Median of Two Sorted Arrays", topic: "Array" },
    { title: "Design a Rate Limiter", topic: "System Design" },
    { title: "Merge K Sorted Lists", topic: "Tree" },
    { title: "Trapping Rain Water", topic: "Array" },
    { title: "Word Ladder", topic: "Graph" },
    { title: "Alien Dictionary", topic: "Graph" },
    { title: "Serialize and Deserialize Binary Tree", topic: "Tree" },
    { title: "LRU Cache Implementation", topic: "System Design" },
    { title: "Maximum Subarray Sum", topic: "Array" },
    { title: "Climbing Stairs", topic: "Dynamic Programming" },
    { title: "Coin Change Problem", topic: "Dynamic Programming" },
    { title: "Valid Parentheses", topic: "String" },
    { title: "Number of Islands", topic: "Graph" },
    { title: "Design URL Shortener", topic: "System Design" },
    { title: "Conflict Resolution Scenario", topic: "Behavioral" },
    { title: "Biggest Challenge Faced", topic: "Behavioral" },
    { title: "Binary Tree Level Order", topic: "Tree" },
    { title: "Implement Trie", topic: "Tree" },
    { title: "Spiral Matrix", topic: "Array" },
    { title: "Task Scheduler", topic: "Array" },
    { title: "Product of Array Except Self", topic: "Array" },
    { title: "Clone Graph", topic: "Graph" },
    { title: "Debounce Function", topic: "System Design" }
];

let generatedQuestions = [];
let qId = 1;

companies.forEach(company => {
    // Generate 55 questions per company
    for (let i = 0; i < 55; i++) {
        let template = templates[Math.floor(Math.random() * templates.length)];
        let diff = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        generatedQuestions.push({
            id: `CQ-${company.substring(0,3).toUpperCase()}-${qId++}`,
            title: `${template.title} (${company} Spec)`,
            difficulty: diff,
            topic: template.topic,
            company: company,
            explanation: `This is a frequently asked ${diff.toLowerCase()} level question in ${company} interviews focusing on ${template.topic}. The optimal approach requires careful attention to time and space complexity tradeoffs.`,
            type: "Coding"
        });
    }
});

existing.company_prep = generatedQuestions;
existing.last_updated = new Date().toISOString();

fs.writeFileSync(targetFile, JSON.stringify(existing, null, 2));
console.log(`Generated ${generatedQuestions.length} company-specific questions!`);
