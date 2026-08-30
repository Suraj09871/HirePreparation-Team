// Fix generic "Aptitude Test N" titles to descriptive titles based on question content
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'questions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const aptitudes = data.aptitude || [];
let fixedCount = 0;

aptitudes.forEach((q, i) => {
    if (q.title && q.title.startsWith('Aptitude Test')) {
        // Generate a descriptive title from the question text
        const question = q.question || '';
        let newTitle = generateTitle(question, q.topic, i);
        q.title = newTitle;
        fixedCount++;
    }
});

function generateTitle(question, topic, index) {
    // Extract key concept from question text
    const q = question.toLowerCase();
    
    // Pattern matching for common aptitude question types
    if (q.includes('train') && (q.includes('speed') || q.includes('passes'))) return 'Train Speed Problem';
    if (q.includes('train') && q.includes('bridge')) return 'Train Crossing Bridge';
    if (q.includes('train') && q.includes('platform')) return 'Train Platform Problem';
    if (q.includes('train') && q.includes('tunnel')) return 'Train Tunnel Problem';
    if (q.includes('men') && q.includes('work') && q.includes('days')) return 'Work and Time Problem';
    if (q.includes('workers') && q.includes('days')) return 'Workers and Days';
    if (q.includes('pipe') && (q.includes('fill') || q.includes('tank'))) return 'Pipes and Cisterns';
    if (q.includes('profit') && q.includes('loss')) return 'Profit and Loss';
    if (q.includes('profit') && q.includes('cost')) return 'Profit on Cost Price';
    if (q.includes('discount')) return 'Discount Calculation';
    if (q.includes('selling price') || q.includes('sold')) return 'Selling Price Problem';
    if (q.includes('interest') && q.includes('compound')) return 'Compound Interest';
    if (q.includes('interest') && q.includes('simple')) return 'Simple Interest';
    if (q.includes('interest') && q.includes('rate')) return 'Interest Rate Problem';
    if (q.includes('average') && q.includes('age')) return 'Average Age Problem';
    if (q.includes('average')) return 'Average Calculation';
    if (q.includes('ratio') && q.includes('proportion')) return 'Ratio and Proportion';
    if (q.includes('ratio')) return 'Ratio Problem';
    if (q.includes('percentage') || q.includes('%')) return 'Percentage Calculation';
    if (q.includes('probability')) return 'Probability Problem';
    if (q.includes('permutation')) return 'Permutation Problem';
    if (q.includes('combination')) return 'Combination Problem';
    if (q.includes('series') || q.includes('next in')) return 'Number Series';
    if (q.includes('what comes next')) return 'Pattern Recognition';
    if (q.includes('sequence')) return 'Sequence Problem';
    if (q.includes('speed') && q.includes('distance')) return 'Speed Distance Time';
    if (q.includes('speed') && q.includes('time')) return 'Speed and Time';
    if (q.includes('downstream') || q.includes('upstream')) return 'Boats and Streams';
    if (q.includes('boat') && q.includes('stream')) return 'Boats and Streams';
    if (q.includes('clock') && q.includes('angle')) return 'Clock Angle Problem';
    if (q.includes('clock')) return 'Clock Problem';
    if (q.includes('calendar')) return 'Calendar Problem';
    if (q.includes('age') && q.includes('years')) return 'Age Problem';
    if (q.includes('mixture') || q.includes('alligation')) return 'Mixture and Alligation';
    if (q.includes('area') && q.includes('circle')) return 'Circle Area';
    if (q.includes('area') && q.includes('rectangle')) return 'Rectangle Area';
    if (q.includes('area') && q.includes('triangle')) return 'Triangle Area';
    if (q.includes('area') && q.includes('square')) return 'Square Area';
    if (q.includes('perimeter')) return 'Perimeter Calculation';
    if (q.includes('volume')) return 'Volume Calculation';
    if (q.includes('cylinder')) return 'Cylinder Problem';
    if (q.includes('sphere')) return 'Sphere Problem';
    if (q.includes('cone')) return 'Cone Problem';
    if (q.includes('cube')) return 'Cube Problem';
    if (q.includes('lcm') || q.includes('least common')) return 'LCM Problem';
    if (q.includes('hcf') || q.includes('gcd') || q.includes('greatest common')) return 'HCF/GCD Problem';
    if (q.includes('divisible') || q.includes('divisibility')) return 'Divisibility Problem';
    if (q.includes('remainder')) return 'Remainder Problem';
    if (q.includes('factorial')) return 'Factorial Problem';
    if (q.includes('logarithm') || q.includes('log')) return 'Logarithm Problem';
    if (q.includes('quadratic')) return 'Quadratic Equation';
    if (q.includes('equation')) return 'Equation Solving';
    if (q.includes('inequality')) return 'Inequality Problem';
    if (q.includes('coding') || q.includes('decoding') || q.includes('cipher')) return 'Coding-Decoding';
    if (q.includes('direction') && q.includes('sense')) return 'Direction Sense';
    if (q.includes('north') || q.includes('south') || q.includes('east') || q.includes('west')) return 'Direction Problem';
    if (q.includes('blood relation') || q.includes('brother') || q.includes('sister') || q.includes('father') || q.includes('mother')) return 'Blood Relations';
    if (q.includes('syllogism') || q.includes('all') && q.includes('some')) return 'Syllogism';
    if (q.includes('seating') || q.includes('arrangement') || q.includes('sitting')) return 'Seating Arrangement';
    if (q.includes('ranking') || q.includes('position') && q.includes('row')) return 'Ranking and Order';
    if (q.includes('puzzle')) return 'Logical Puzzle';
    if (q.includes('analogy') || q.includes('is to')) return 'Analogy';
    if (q.includes('odd one out') || q.includes('does not belong')) return 'Odd One Out';
    if (q.includes('venn diagram')) return 'Venn Diagram';
    if (q.includes('data interpretation') || q.includes('table') && q.includes('following')) return 'Data Interpretation';
    if (q.includes('bar graph') || q.includes('pie chart') || q.includes('line graph')) return 'Graph Interpretation';
    if (q.includes('partnership')) return 'Partnership Problem';
    if (q.includes('share') && q.includes('divided')) return 'Share Division';
    if (q.includes('number') && q.includes('find')) return 'Number Problem';
    
    // Fallback: use topic + short question hint
    if (topic) {
        const words = question.split(/\s+/).slice(0, 5).join(' ');
        return `${topic}: ${words}...`;
    }
    
    return `Aptitude Q${index + 1}: ${question.substring(0, 40)}...`;
}

// Also fix correctAnswer explanations that just say "The correct option is N"
aptitudes.forEach(q => {
    if (q.explanation && q.explanation.startsWith('Detailed step-by-step solution')) {
        // Generate a better explanation based on the question
        const correct = q.options ? q.options[q.correctAnswer || 0] : '';
        q.explanation = `The correct answer is "${correct}". ${q.question || ''}`;
    }
});

// Make titles unique by appending a suffix if duplicates exist
const titleCounts = {};
aptitudes.forEach(q => {
    if (titleCounts[q.title]) {
        titleCounts[q.title]++;
        q.title = `${q.title} (${titleCounts[q.title]})`;
    } else {
        titleCounts[q.title] = 1;
    }
});

data.aptitude = aptitudes;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Fixed ${fixedCount} aptitude titles`);
console.log('Sample titles:', aptitudes.slice(0, 10).map(q => q.title));
