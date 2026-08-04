import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We will fetch questions from the top 4 companies to get a mix of ~200 questions.
const companies = ['Amazon', 'Google', 'Facebook', 'Bloomberg'];
const githubBaseUrl = 'https://raw.githubusercontent.com/hxu296/leetcode-company-wise-problems-2022/main/companies/';

const outputDir = path.join(__dirname, '../data');
const outputFile = path.join(outputDir, 'questions.json');

// Ensure data directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const allCodingQuestions = [];

function fetchCsv(company) {
    return new Promise((resolve, reject) => {
        const url = `${githubBaseUrl}${company}.csv`;
        console.log(`Fetching coding questions for ${company}...`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const lines = data.split('\n').filter(line => line.trim() !== '');
                // Skip header: "problem_link","problem_name","num_occur"
                const questions = [];
                for (let i = 1; i < lines.length; i++) {
                    if (questions.length >= 50) break;
                    
                    // Split by comma but handle potential quotes (though leetcode names usually don't have commas)
                    const parts = lines[i].split(',');
                    if (parts.length >= 2) {
                        const link = parts[0];
                        const name = parts.slice(1, parts.length - 1).join(',').replace(/"/g, ''); // Handle commas in names
                        const occurrences = parts[parts.length - 1];

                        questions.push({
                            id: link.split('/').filter(Boolean).pop(),
                            title: name,
                            acceptance: "N/A", // Not provided in this CSV
                            difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)], // Mocked since missing
                            company: company,
                            type: 'Coding'
                        });
                    }
                }
                resolve(questions);
            });
        }).on('error', reject);
    });
}

// For aptitude questions, we simulate scraping Learntheta as a direct fetch 
// might hit CORS/Cloudflare blocks on standard HTTP clients.
// We generate a set of representative aptitude questions based on the source structure.
function getAptitudeQuestions() {
    console.log("Generating Aptitude questions based on Learntheta patterns...");
    return [
        { id: "A1", title: "Time and Work", company: "TCS", difficulty: "Medium", type: "Aptitude" },
        { id: "A2", title: "Data Interpretation", company: "Infosys", difficulty: "Hard", type: "Aptitude" },
        { id: "A3", title: "Logical Reasoning", company: "Wipro", difficulty: "Easy", type: "Aptitude" },
        { id: "A4", title: "Quantitative Aptitude", company: "Cognizant", difficulty: "Medium", type: "Aptitude" },
        { id: "A5", title: "Verbal Ability", company: "Amazon", difficulty: "Medium", type: "Aptitude" }
    ];
}

async function buildDatabase() {
    try {
        for (const company of companies) {
            const qs = await fetchCsv(company);
            allCodingQuestions.push(...qs);
        }

        const aptitudeQuestions = getAptitudeQuestions();
        const finalDataset = {
            coding: allCodingQuestions,
            aptitude: aptitudeQuestions,
            total_coding: allCodingQuestions.length,
            total_aptitude: aptitudeQuestions.length,
            last_updated: new Date().toISOString()
        };

        fs.writeFileSync(outputFile, JSON.stringify(finalDataset, null, 2));
        console.log(`\nSuccess! Wrote ${allCodingQuestions.length} coding questions and ${aptitudeQuestions.length} aptitude questions to ${outputFile}`);
        console.log(`You can now fetch this JSON in your practice.html file to dynamically render the problem set.`);
    } catch (err) {
        console.error("Error building question database:", err);
    }
}

buildDatabase();
