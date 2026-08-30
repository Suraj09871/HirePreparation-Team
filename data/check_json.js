const fs = require('fs');
const data = JSON.parse(fs.readFileSync('f:/hiresmart final/data/questions.json', 'utf8'));
console.log(Object.keys(data));
if (data.coding_mcq) {
  console.log("coding_mcq length:", data.coding_mcq.length);
} else {
  console.log("coding_mcq not found");
}
