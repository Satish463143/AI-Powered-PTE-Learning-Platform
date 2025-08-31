const generateFeedbackPrompt = (sectionScores) => {
    // Convert section names to lowercase for consistency
    const normalizedScores = {};
    Object.entries(sectionScores).forEach(([section, scores]) => {
        normalizedScores[section.toLowerCase()] = scores;
    });

    return `
    You are a professional PTE Academic Coach.

    Your job is to analyze the user's performance across different sections and question types based on their practice scores, and generate concise, structured feedback to help them improve.

    ---

    ### SECTIONS:
    You will analyze the following sections:

    1. **Reading**
    2. **Writing**
    3. **Speaking**
    4. **Listening**
    5. **Overall Summary**

    ---

    ### INPUT FORMAT:
    The user's performance data is provided as a structured JSON object:

    \`\`\`json
    ${JSON.stringify(normalizedScores, null, 2)}
    \`\`\`

    Each section contains one or more question types, each with recent scores (0–5).

    ---

    ### YOUR TASK:

    Generate feedback in this exact HTML format:

    <div class="feedback-section">
      <h3>[Section Name] Section</h3>
      <div class="feedback-content">
        <p>[General feedback about the section]</p>
        <ul>
          <li>[Specific point about strengths/weaknesses]</li>
          <li>[Practice recommendation]</li>
          <li>[Time management tip]</li>
        </ul>
      </div>
    </div>

    IMPORTANT RULES:
    1. Keep feedback concise and actionable
    2. Use only basic HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <br>, <div>
    3. Focus on most critical improvements
    4. Keep total response under 2000 characters
    5. Return ONLY the HTML content, no JSON wrapping
    6. For speaking section, focus on pronunciation, fluency, and content
    7. For listening section, focus on comprehension and note-taking skills
    8. DO NOT include any title like "PTE Academic Performance Feedback" at the top
    9. Start directly with the section feedback

    Now, using the provided JSON scores, generate the feedback.
    `;
};

const getPromptMessages = (sectionScores) => [
    { 
        role: 'system', 
        content: 'You are a PTE Academic Coach providing detailed feedback in HTML format.' 
    },
    { 
        role: 'user', 
        content: generateFeedbackPrompt(sectionScores)
    }
];

const generateDefaultFeedback = (section) => {
    const normalizedSection = section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
    
    if (section.toLowerCase() === 'overall') {
        return {
            feedback: `
<h3>📊 Overall Performance Analysis</h3>
<div class="feedback-content">
    <p>We don't have any recent practice data to analyze your overall performance. Here are some general tips to improve your PTE score:</p>
    <ul>
        <li><strong>Practice Regularly:</strong> Aim to practice at least a few questions from each section daily</li>
        <li><strong>Track Your Progress:</strong> Complete practice tests to identify your strengths and areas for improvement</li>
        <li><strong>Time Management:</strong> Practice with the timer to improve your speed and accuracy</li>
    </ul>
    <p>Start practicing now to get personalized feedback on your performance!</p>
</div>`,
            pdfContent: null
        };
    }

    const sectionSpecificTips = {
        speaking: `<li><strong>Record and Listen:</strong> Practice recording yourself and analyze your pronunciation and fluency</li>
                  <li><strong>Focus on Clarity:</strong> Speak at a steady pace and enunciate clearly</li>
                  <li><strong>Content Organization:</strong> Structure your responses with clear introductions and conclusions</li>`,
        listening: `<li><strong>Active Listening:</strong> Practice taking notes while listening to audio passages</li>
                   <li><strong>Focus on Keywords:</strong> Pay attention to main ideas and supporting details</li>
                   <li><strong>Practice with Different Accents:</strong> Expose yourself to various English accents</li>`,
        reading: `<li><strong>Time Management:</strong> Practice reading quickly while maintaining comprehension</li>
                 <li><strong>Skim and Scan:</strong> Learn when to read in detail and when to scan for information</li>
                 <li><strong>Vocabulary Building:</strong> Focus on academic and topic-specific vocabulary</li>`,
        writing: `<li><strong>Structure:</strong> Practice organizing your ideas with clear paragraphs</li>
                 <li><strong>Grammar Review:</strong> Focus on common academic writing structures</li>
                 <li><strong>Time Practice:</strong> Practice completing tasks within the time limit</li>`
    };

    return {
        feedback: `
<h3>📝 ${normalizedSection} Section Feedback</h3>
<div class="feedback-content">
    <p>We don't have any recent practice data for your ${normalizedSection} section. Here are some specific tips for ${normalizedSection}:</p>
    <ul>
        ${sectionSpecificTips[section.toLowerCase()] || `<li><strong>Practice Regularly:</strong> Try to attempt ${normalizedSection} questions daily</li>
        <li><strong>Review Guidelines:</strong> Make sure you understand the scoring criteria</li>
        <li><strong>Time Your Practice:</strong> Practice under timed conditions to improve efficiency</li>`}
    </ul>
    <p>Complete some ${normalizedSection} practice questions to receive personalized feedback on your performance!</p>
</div>`,
        pdfContent: null
    };
};

module.exports = {
    generateFeedbackPrompt,
    getPromptMessages,
    generateDefaultFeedback
};
