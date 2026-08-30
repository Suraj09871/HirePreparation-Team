// Fix remaining fallback aptitude titles (the ones with "...")
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'questions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.aptitude.forEach(q => {
    if (q.title.includes('...')) {
        // Use first 7 meaningful words from the question
        const words = q.question.split(/\s+/);
        const meaningful = words.slice(0, 7).join(' ');
        q.title = meaningful.length > 5 ? meaningful : (q.topic || 'Aptitude') + ' Problem';
    }
});

// De-duplicate titles
const titleCounts = {};
data.aptitude.forEach(q => {
    if (titleCounts[q.title]) {
        titleCounts[q.title]++;
        q.title = q.title + ' (' + titleCounts[q.title] + ')';
    } else {
        titleCounts[q.title] = 1;
    }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done. Fallback remaining:', data.aptitude.filter(q => q.title.includes('...')).length);
console.log('Sample titles:', data.aptitude.slice(0, 15).map(q => q.title));
