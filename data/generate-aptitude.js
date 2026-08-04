// Script to generate company-wise aptitude questions and merge into questions.json
const fs = require('fs');
const path = require('path');

const topics = {
  "Number Series": [
    { q: "Find the missing number: 2, 6, 12, 20, 30, ?", options: ["40", "42", "38", "44"], a: 1 },
    { q: "What comes next: 1, 4, 9, 16, 25, ?", options: ["36", "30", "49", "35"], a: 0 },
    { q: "Find the pattern: 3, 9, 27, 81, ?", options: ["162", "243", "120", "200"], a: 1 },
    { q: "Complete: 5, 11, 23, 47, ?", options: ["95", "96", "89", "94"], a: 0 },
    { q: "Next in series: 2, 3, 5, 7, 11, ?", options: ["13", "15", "14", "17"], a: 0 }
  ],
  "Percentage": [
    { q: "If 20% of X is 40, find X", options: ["100", "150", "200", "250"], a: 2 },
    { q: "A number increased by 25% gives 75. Find the number", options: ["50", "60", "65", "70"], a: 1 },
    { q: "What is 15% of 300?", options: ["45", "30", "60", "50"], a: 0 },
    { q: "Find the percentage change from 40 to 50", options: ["20%", "25%", "30%", "15%"], a: 1 },
    { q: "30% of 600 minus 20% of 400 equals?", options: ["100", "120", "80", "90"], a: 0 }
  ],
  "Probability": [
    { q: "Drawing a red ball from 5 red and 3 blue", options: ["5/8", "3/8", "1/2", "5/3"], a: 0 },
    { q: "Probability of getting head in 2 coin tosses", options: ["1/4", "1/2", "3/4", "1"], a: 2 },
    { q: "A die is thrown twice. P(sum=7)?", options: ["1/6", "1/12", "1/3", "1/4"], a: 0 },
    { q: "Cards drawn from 52. P(King or Queen)?", options: ["2/13", "1/13", "4/13", "1/4"], a: 0 },
    { q: "Three coins tossed. P(at least 2 heads)?", options: ["3/8", "1/2", "1/4", "5/8"], a: 1 }
  ]
};

const companies = [
  "TCS", "Infosys", "Wipro", "Accenture", "Cognizant",
  "Amazon", "Capgemini", "HCL", "Google", "Microsoft"
];

const difficulties = ["Easy", "Medium", "Hard"];
const topicNames = Object.keys(topics);
const aptitude = [];
let id = 1;

companies.forEach(company => {
  for (let i = 0; i < 5; i++) {
    const topicIdx = i % topicNames.length;
    const topic = topicNames[topicIdx];
    const qObj = topics[topic][i % topics[topic].length];
    const diff = difficulties[i % 3];
    aptitude.push({
      id: `APT-${id++}`,
      title: qObj.q,
      topic: topic,
      company: company,
      difficulty: diff,
      type: "Aptitude",
      options: qObj.options,
      correctAnswer: qObj.a
    });
  }
});

const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf-8'));
existing.aptitude = aptitude;
existing.total_aptitude = aptitude.length;
existing.last_updated = new Date().toISOString();

fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(existing, null, 2));
console.log(`Done! Aptitude: ${aptitude.length}, MCQ: ${mcq.length}`);
