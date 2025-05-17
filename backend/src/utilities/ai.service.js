const generateAiResponse = async (message, type) => {
    const systemPrompt = `You are a helpful PTE tutor. Generate ${type} practice content.`;
    const res = await aiClient.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
        ]
    });
    return res.data.choices[0].message.content;
};

module.exports = generateAiResponse