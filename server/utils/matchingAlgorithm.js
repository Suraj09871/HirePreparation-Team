/**
 * Skill Matching Algorithm (Sunny's Work)
 * 
 * Formula:
 * Skill Match % = (Matched Skills / Required Skills) × 100
 * 
 * Hiring Probability (Final Score) =
 *   (Skill Match × 60%) + (Experience Score × 20%) + (Resume Completeness × 20%)
 */

function calculateSkillMatch(studentSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
    }

    const studentSkillNames = studentSkills.map(s =>
        (typeof s === 'string' ? s : s.name).toLowerCase().trim()
    );

    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(reqSkill => {
        const normalizedReq = reqSkill.toLowerCase().trim();
        const found = studentSkillNames.some(ss =>
            ss === normalizedReq ||
            ss.includes(normalizedReq) ||
            normalizedReq.includes(ss)
        );
        if (found) {
            matchedSkills.push(reqSkill);
        } else {
            missingSkills.push(reqSkill);
        }
    });

    const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

    return { matchPercentage, matchedSkills, missingSkills };
}

function calculateExperienceScore(studentExperience, requiredExperience) {
    // Parse years from student experience text
    const yearMatch = studentExperience ? studentExperience.match(/(\d+)/g) : null;
    const studentYears = yearMatch ? parseInt(yearMatch[0]) : 0;

    // Parse required experience range
    let requiredMin = 0;
    if (requiredExperience) {
        const reqMatch = requiredExperience.match(/(\d+)/g);
        if (reqMatch) requiredMin = parseInt(reqMatch[0]);
    }

    if (requiredMin === 0) return 100; // No experience required
    if (studentYears >= requiredMin) return 100;
    if (studentYears === 0) return 20;

    return Math.round((studentYears / requiredMin) * 100);
}

function calculateResumeCompleteness(profile) {
    if (!profile) return 0;

    let score = 0;
    const weights = {
        phone: 10,
        education: 15,
        experience: 20,
        location: 5,
        resumeUrl: 20,
        skills: 20,
        projects: 10
    };

    if (profile.phone) score += weights.phone;
    if (profile.education) score += weights.education;
    if (profile.experience) score += weights.experience;
    if (profile.location) score += weights.location;
    if (profile.resumeUrl) score += weights.resumeUrl;
    if (profile.skills && profile.skills.length > 0) score += weights.skills;
    if (profile.projects && profile.projects.length > 0) score += weights.projects;

    return score;
}

function calculateHiringProbability(skillMatch, experienceScore, resumeCompleteness) {
    // Final Score = (Skill Match × 60%) + (Experience × 20%) + (Resume Completeness × 20%)
    const finalScore = Math.round(
        (skillMatch * 0.6) +
        (experienceScore * 0.2) +
        (resumeCompleteness * 0.2)
    );

    return Math.min(finalScore, 100);
}

function getRecommendationLabel(hiringProbability) {
    if (hiringProbability >= 85) return 'High';
    if (hiringProbability >= 60) return 'Medium';
    return 'Low';
}

function getWarningColor(hiringProbability) {
    if (hiringProbability >= 85) return 'green';
    if (hiringProbability >= 60) return 'yellow';
    return 'red';
}

module.exports = {
    calculateSkillMatch,
    calculateExperienceScore,
    calculateResumeCompleteness,
    calculateHiringProbability,
    getRecommendationLabel,
    getWarningColor
};
