module.exports = {
  // Base requirements for all question types to ensure variety and quality
  baseRequirements: `
    <h3>🎯 <strong>General Requirements for Question Generation</strong></h3>
    
    <ul>
      <li><strong>📚 Topic Variety:</strong> Choose a topic from a diverse range of academic subjects (e.g., history, science, environment, sociology, economics, arts, technology). Ensure the topic is distinct from previous questions if applicable.</li>
      
      <li><strong>📏 Passage Length:</strong> The passage should be concise, typically between 80 and 300 words, suitable for a PTE exam context.</li>
      
      <li><strong>🎓 Academic Tone & Vocabulary:</strong> Use formal, academic English. The vocabulary should be appropriate for university-level discourse, incorporating words that might challenge a non-native speaker but are still inferable from context.</li>
      
      <li><strong>✅ Content Quality:</strong> Ensure the content is factually accurate, well-structured, and appropriate for academic assessment.</li>
    </ul>

    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0;">
      <strong>⚠️ CRITICAL:</strong> Return ONLY valid JSON format without any additional text, explanations, or formatting.
    </div>
  `,

  getPrompt(type, variant) {
    const prompts = {
      
      //Writing Section prompts
      writeEssay: {
        generate: `${this.baseRequirements}
          <h3>✍️ <strong>Generate a PTE Essay Writing Question</strong></h3>
          
          <h4>📋 <strong>Instructions:</strong></h4>
          <ul>
            <li><strong>Step 1:</strong> Create a clear essay topic that requires analysis and discussion.</li>
            <li><strong>Step 2:</strong> Format the question to include both the topic statement and specific instructions.</li>
          </ul>
          
          <h4>📝 <strong>Return Format:</strong></h4>
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <pre><code>{
  "topic": "In today's digital age, artificial intelligence is becoming increasingly prevalent in various aspects of our lives.",
  "question": "Discuss the advantages and disadvantages of artificial intelligence in modern society. Give your own opinion and relevant examples. Give answer in 200-300 words. Structure your essay with clear introduction, body paragraphs, and conclusion"
}</code></pre>
          </div>`,
        hint: "Give a helpful tip to structure a PTE essay effectively."
      },
      summarizeWrittenText: {
        generate: `${this.baseRequirements}
          <h3>📝 <strong>Generate a PTE Summarize Written Text Question</strong></h3>
          
          <h4>📋 <strong>Instructions:</strong></h4>
          <ul>
            <li><strong>Step 1:</strong> Write an academic passage (200-300 words) on a specific topic.</li>
            <li><strong>Step 2:</strong> Create a clear instruction asking to summarize the main points.</li>
          </ul>
          
          <h4>📝 <strong>Return Format:</strong></h4>
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <pre><code>{
  "passage": "Artificial intelligence (AI) has emerged as a transformative force in the modern workplace, fundamentally altering traditional employment patterns and job requirements. While AI technology has demonstrated remarkable capabilities in automating routine tasks and increasing operational efficiency across various industries, its impact on the job market is multifaceted. Some sectors have witnessed job displacement as AI systems take over repetitive functions, particularly in manufacturing, data entry, and customer service roles. However, this technological shift has simultaneously created new employment opportunities in fields such as AI development, data science, and machine learning engineering. Additionally, many existing roles are being redefined rather than eliminated, with employees increasingly required to develop skills in AI collaboration and oversight. This evolution suggests that the future workforce will need to adapt by acquiring new competencies and embracing roles that emphasize uniquely human capabilities such as creative thinking, emotional intelligence, and complex problem-solving.",
  "question": "Summarize the main points of the passage in one sentence, not exceeding 75 words."
}</code></pre>
          </div>`,
        hint: "Give a helpful tip to structure a PTE essay effectively."
      },
      //Reading Section prompts
      reorderParagraph: {
        generate: `${this.baseRequirements}
          <h3>🔄 <strong>Generate a PTE Reorder Paragraph Question</strong></h3>
          
          <h4>📋 <strong>Instructions:</strong></h4>
          <ul>
            <li><strong>Step 1:</strong> Write a short, logically connected paragraph of exactly 5 sentences.</li>
            <li><strong>Step 2:</strong> Randomly SHUFFLE these 5 sentences so they are NOT in the correct order.</li>
            <li><strong>Step 3:</strong> Return ONLY the shuffled version in the following JSON format.</li>
          </ul>
          
          <h4>📝 <strong>Return Format:</strong></h4>
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <pre><code>{
  "questions": [
    "Shuffled sentence 1.",
    "Shuffled sentence 2.",
    "Shuffled sentence 3.",
    "Shuffled sentence 4.",
    "Shuffled sentence 5."
  ]
}</code></pre>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0;">
            <strong>⚠️ IMPORTANT:</strong>
            <ul>
              <li>DO NOT return the ordered version.</li>
              <li>DO NOT include explanations or instructions.</li>
              <li>ONLY return the final JSON object with SHUFFLED SENTENCES.</li>
              <li>Sentences MUST be clearly out of order.</li>
            </ul>
          </div>`,
        hint: `Return a JSON object with a concise hint for reordering paragraphs not more than 30-40 words. Make it in 2 sentences:
        {
          "hint": "Look for key transition words and logical connections between sentences. Start with the main idea and follow the natural flow of information."
        }`
      },
      fillInTheBlanks_reading: {
          generate:`${this.baseRequirements}Generate a Reading "Fill in the Blanks" question.
          
          Step 1: Write a paragraph with 5 specific words that you will remove.
          Step 2: Replace those words with {{blank1}}, {{blank2}}, {{blank3}}, {{blank4}}, {{blank5}} placeholders.
          Step 3: For each blank, provide 4 options where only 1 is correct.
          
          Return a JSON object like:
          {
             "paragraph": "The {{blank1}} advancement of artificial {{blank2}} has {{blank3}} considerable debate regarding its {{blank4}} societal implications. While {{blank5}} highlight AI's capacity to automate repetitive tasks.",
              "blanks": {
                "blank1": ["rapid", "slow", "gradual", "minimal"],
                "blank2": ["intelligence", "technology", "research", "development"],
                "blank3": ["prompted", "prevented", "ignored", "delayed"],
                "blank4": ["potential", "actual", "previous", "limited"],
                "blank5": ["critics", "opponents", "proponents", "researchers"]
              }
          }
          
          ⚠️ IMPORTANT:
          - The paragraph MUST contain 5 blanks: {{blank1}}, {{blank2}}, {{blank3}}, {{blank4}}, {{blank5}}
          - Each blank should have exactly 4 options
          - Only 1 option per blank should be grammatically/contextually correct
          - Make sure all blanks are clearly marked in the paragraph text
          - Distribute blanks evenly throughout the paragraph`,
        hint: "Look at grammar and vocabulary clues to choose the correct words."
      },
      multipleChoiceMultiple_reading: {
         generate: `${this.baseRequirements}Generate a PTE reading multiple choice multiple answer question.
         
         Step 1: Write a passage (200-350 words) on an academic topic.
         Step 2: Create a clear question asking about specific information from the passage.
         Step 3: Provide 5 answer options where All 5 options can be correct, or only some can be correct (flexible)
         
         Return a JSON object like:
         {
           "passage": "Climate change represents one of the most pressing challenges of the 21st century. The primary causes include deforestation, industrial emissions, and excessive use of fossil fuels. Scientists have identified several key indicators of climate change: rising global temperatures, melting polar ice caps, and increasing sea levels. To combat these effects, governments worldwide are implementing renewable energy policies, carbon taxation systems, and reforestation programs. Additionally, individuals can contribute through energy conservation, sustainable transportation choices, and supporting eco-friendly products.",
           "question": "According to the passage, which of the following statements are correct about climate change?",
           "options": [
             "Deforestation is mentioned as one of the primary causes of climate change",
             "Rising sea levels are identified as a key indicator of climate change", 
             "Governments are implementing renewable energy policies to combat climate change",
             "Individual actions like energy conservation can help address climate change",
             "The passage states that polar ice caps are growing due to climate change"
           ],
          }
         
         ⚠️ IMPORTANT:
         - Include both passage and question
         - Provide exactly 5 options total (no more, no less)
         - Options should be complete sentences/statements, not single words
         - All 5 options can be correct, or only some can be correct (flexible)
         - Incorrect options should be plausible and can be based on passage content but twisted/modified to be false
         - Question should be clear about selecting multiple correct statements
         - All options should be clearly related to the passage topic`,
         hint: "Read the passage carefully and identify key information that directly answers the question."
      },
      multipleChoiceSingle_reading: {
         generate: `${this.baseRequirements}Generate a PTE reading multiple choice single answer question.
         
         Step 1: Write a passage (200-350 words) on an academic topic.
         Step 2: Create a clear question asking about specific information from the passage.
         Step 3: Provide 5 answer options where only one option is correct.
         
         Return a JSON object like:
         {
           "passage": "Climate change represents one of the most pressing challenges of the 21st century. The primary causes include deforestation, industrial emissions, and excessive use of fossil fuels. Scientists have identified several key indicators of climate change: rising global temperatures, melting polar ice caps, and increasing sea levels. To combat these effects, governments worldwide are implementing renewable energy policies, carbon taxation systems, and reforestation programs. Additionally, individuals can contribute through energy conservation, sustainable transportation choices, and supporting eco-friendly products.",
           "question": "According to the passage, which of the following statements are correct about climate change?",
           "options": [
             "Deforestation is mentioned as one of the primary causes of climate change",
             "Rising sea levels are identified as a key indicator of climate change", 
             "Governments are implementing renewable energy policies to combat climate change",
             "Individual actions like energy conservation can help address climate change",
             "The passage states that polar ice caps are growing due to climate change"
           ]
        }
         
         ⚠️ IMPORTANT:
         - Include both passage and question
         - Provide exactly 5 options total (no more, no less)
         - Options should be complete sentences/statements, not single words
         - only one option should be correct
         - Incorrect options should be plausible and can be based on passage content but twisted/modified to be false
         - Question should be clear about selecting one correct statement
         - All options should be clearly related to the passage topic`,
         hint: "Read the passage carefully and identify key information that directly answers the question."
      },
      reading_fillInTheBlanks: {
        generate:`${this.baseRequirements}Generate a Reading "Reading: Fill in the Blanks" question.
        
        STRICT REQUIREMENTS:
        1. Write a paragraph of 100-200 words.
        2. You MUST create EXACTLY:
           - 5 blanks marked with ___
           - 10 word options total (5 correct + 5 incorrect)
        3. The correct words MUST be the first 5 options in the array, in order of appearance in the text.
        4. The incorrect words MUST be the last 5 options in the array.
        
        Return ONLY a JSON object in this EXACT format:
        {
          "paragraph": "The ___ advancement of artificial ___ has ___ considerable debate regarding its ___ societal implications. While ___ highlight AI's capacity to automate repetitive tasks.",
          "blanks": [
            "rapid",        // correct for 1st blank
            "limited",     // incorrect option
            "intelligence", // correct for 2nd blank
            "prompted",     // correct for 3rd blank
            "technology",  // incorrect option
            "potential",    // correct for 4th blank
            "opponents",    // incorrect option
            "researchers",  // correct for 5th blank
            "slow",        // incorrect option            
            "prevented",   // incorrect option            
          ]
        }
        
        ⚠️ CRITICAL VALIDATION RULES:
        1. The paragraph MUST have EXACTLY 5 blanks marked with ___
        2. The blanks array MUST have EXACTLY 10 words:
           - First 5: correct answers in order of appearance
           - Last 5: incorrect but plausible options
        3. Each blank MUST have exactly one correct option
        4. Distribute blanks evenly throughout the paragraph
        5. All options must be grammatically compatible with the blanks`,
        hint: "Look at grammar and vocabulary clues to choose the correct words."
      },


      //Speaking Section prompts
      readAloud: {
        generate:`${this.baseRequirements}Generate a Speaking "Read Aloud" question.
        
        Step 1: Write a paragraph of 15-20 words on an academic topic.
        Step 2: The paragraph must be clear, well-structured, and suitable for reading aloud.
        Step 3: Return ONLY the paragraph in this exact JSON format:
        {
          "paragraph": "Your academic paragraph here"
        }
        
        ⚠️ CRITICAL REQUIREMENTS:
        1. Return ONLY the JSON object with the paragraph field
        2. NO additional fields or metadata
        3. Paragraph should be 40-60 words
        4. Use proper punctuation for natural reading flow
        5. Content should be similar to: "The ecological concept of a trophic cascade describes powerful indirect interactions that can control entire ecosystems. These cascades occur when predators limit the density or behavior of their prey, thereby enhancing the survival of the next lower trophic level."
        `,
        hint: "Speak clearly and at a natural pace. Focus on pronunciation and stress important words. Take a short pause at punctuation marks."
      },

      describeImage: {
        generate: `${this.baseRequirements}Generate a Speaking "Describe Image" question.
        
        Step 1: Select an image type from: line_graph, bar_chart, pie_chart, table, process_diagram, map
        Step 2: Return the question in the following JSON format:
        {
          "imageUrl": "URL_TO_IMAGE", // This will be replaced by frontend
          "imageType": "line_graph", // Must be one of: line_graph, bar_chart, pie_chart, table, process_diagram, map
          "prompt": "Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response."
        }
        
        ⚠️ IMPORTANT:
        - The imageUrl will be handled by the frontend
        - Keep the prompt consistent with PTE exam format
        - imageType MUST be one of the specified values
        - All fields are required
        `,
        hint: "Start with the main trend or key feature, then describe specific details, and end with a conclusion or overall observation."
      },
      
      repeatSentence: {
        generate: `${this.baseRequirements}Generate a Speaking "Repeat Sentence" question.        
        
        Step 1: Create a sentence that is 5-8 words long.
        Step 2: The sentence should use natural, academic language.
        Step 3: Return the sentence in the following JSON format:
        {
          "sentence": "The university library will be closed for renovation during the summer break.",
          "audioUrl": null // This will be set by the frontend
        }         
        `,
        hint: "Listen carefully to the pronunciation and intonation. Try to remember the sentence in chunks rather than individual words."
      },

      answerShortQuestion: {
        generate: `${this.baseRequirements}Generate a Speaking "Answer Short Question" question.
        
        Step 1: Create a simple question that requires a one or two-word answer.
        Step 2: The question should test general knowledge or logical reasoning.
        Step 3: Return the question and answer in the following JSON format:
        {
          "question": "What season comes after summer?",
          "expectedAnswer": "autumn",
          "audioUrl": null // This will be set by the frontend
        }        
        `,
        hint: "Listen carefully to the question and answer with just one or two words. Keep your response short and precise."
      },

      respondToSituation: {
        generate: `${this.baseRequirements}Generate a Speaking "Respond to a Situation" question.
        
        Step 1: Create a brief scenario that requires a verbal response.
        Step 2: The situation should be common in academic or professional settings.
        Step 3: Return the scenario in the following JSON format:
        {
          "situation": "You need to reschedule a meeting with your professor. What would you say?",
          "expectedResponse": ["I would like to reschedule our meeting", "Could we arrange another time to meet", "I need to change our meeting time"],
          "audioUrl": null // This will be set by the frontend
        }        
        `,
        hint: "Listen to the situation carefully and respond naturally as you would in real life. Keep your response polite and professional."
      },
      retellLecture: {
        generate: `${this.baseRequirements}Generate a Speaking "Retell Lecture" question.
        
        Step 1: Create an academic lecture transcript (150-200 words).
        Step 2: Return the question in the following JSON format:
        {
          "transcript": "Your academic lecture transcript here",
          "audioUrl": null // This will be set by the frontend
        }
        
        ⚠️ IMPORTANT:
        - The audioUrl will be handled by the frontend
        - The transcript should be clear and well-structured
        - Include key points and supporting details
        - Use academic language appropriate for a university lecture
        `,
        hint: "Take notes while listening, focus on main ideas and key points, then organize your response logically."
      },

      //listening section prompts
      summarizeSpokenText: {
        generate: `${this.baseRequirements}Generate a Listening "Summarize Spoken Text" question.
        
        Return ONLY in this exact JSON format:
        {
          "audioUrl": null // This will be set by the frontend/backend
        }        
        `,
        hint: "Take notes while listening to identify main ideas and key details. Focus on the overall message rather than every word."
      },
      writeFromDictation: {
        generate: `${this.baseRequirements}Generate a Listening "Write from Dictation" question.
        
        Return ONLY in this exact JSON format:
        {
          "audioUrl": null // This will be set by the frontend/backend
        }        
        `,
        hint: "Listen carefully and write exactly what you hear."
      },
      multipleChoiceMultiple_listening:{
        generate: `${this.baseRequirements}Generate a Listening "Multiple Choice Multiple Answer" question.
        
        Step 1: The audio lecture/conversation will be provided by the backend
        Step 2: Return ONLY in this exact JSON format:
        {
          "audioUrl": null, // Will be set by backend
          "question": null, // Will be set by backend
          "options": null,  // Will be set by backend
          "correctAnswers": null // Will be set by backend
        }`,
        hint: "Listen carefully to the audio and select ALL correct options that match what you heard. Pay attention to both explicit and implied information."
      },
      multipleChoiceSingle_listening:{
        generate: `${this.baseRequirements}Generate a Listening "Multiple Choice Single Answer" question.
        
        Step 1: The audio lecture/conversation will be provided by the backend
        Step 2: Return ONLY in this exact JSON format:
        {
          "audioUrl": null, // Will be set by backend
          "question": null, // Will be set by backend
          "options": null,  // Will be set by backend
          "correctAnswer": null // Will be set by backend (single correct answer)
        }`,
        hint: "Listen carefully to the audio and select the ONE correct option that best matches what you heard. Focus on key details and main points in the audio."
      },
      fillInTheBlanks_listening:{
        generate: `${this.baseRequirements}Generate a Listening "Fill in the Blanks" question.
        
        Step 1: The audio and transcript will be provided by the backend
        Step 2: Return ONLY in this exact JSON format:
        {
          "audioUrl": null, // Will be set by backend
          "paragraph": null, // Will be set by backend (text with blanks marked)
          "blanks": null,  // Will be set by backend (array of correct answers)
          "transcript": null // Will be set by backend (complete text without blanks)
        }`,
        hint: "Listen carefully to the audio and type the exact words you hear in the blanks. Pay attention to the context and surrounding words to help you understand what's missing."
      },
      highlightIncorrectWords:{
        generate: `${this.baseRequirements}Generate a Listening "Highlight Incorrect Words" question.
        
        Step 1: The audio and transcript will be provided by the backend
        Step 2: Return ONLY in this exact JSON format:
        {
          "audioUrl": null, // Will be set by backend
          "paragraph": null, // Will be set by backend (text with blanks marked)
        }`,
        hint: "Listen carefully to the audio and select the incorrect words. Pay attention to the context and surrounding words to help you understand what's missing."
      },
      selectMissingWord: {
        generate: `${this.baseRequirements}Generate a Listening "Select Missing Word" question.
        
        Step 1: Write a paragraph of 100-200 words.
        Step 2: Identify a word that is missing from the paragraph.
        Step 3: Provide 4 options where only one is correct.
        
        Return a JSON object like:
        {
          "paragraph": "The ___ advancement of artificial ___ has ___ considerable debate regarding its ___ societal implications. While ___ highlight AI's capacity to automate repetitive tasks.",
          "missingWord": "environment",
          "options": {
            "option1": "environment",
            "option2": "technology",
            "option3": "research",
            "option4": "development"
          }
        }
        
        ⚠️ IMPORTANT:
        - The paragraph MUST contain the missing word.
        - The missing word MUST be clearly marked with ___
        - Each option MUST be a complete word
        - Only one option MUST be grammatically/contextually correct
        - Make sure all options are plausible and can be based on the paragraph content`,
        hint: "Look for a word that fits the context and is missing from the paragraph. Choose the option that makes the most sense."
      },
        
      // Add more as needed
    };

    // ✅ No friendlyNepaliTone here — only for feedback
    return prompts[type]?.[variant] || `${this.baseRequirements}Generate a general PTE question.`;
  },

  getEvaluationPrompt(type, userAnswer, originalQuestion) {
    console.log('Debug - getEvaluationPrompt called with:', {
      type,
      userAnswerType: typeof userAnswer,
      userAnswerIsArray: Array.isArray(userAnswer),
      originalQuestionType: typeof originalQuestion
    });
    
    const evaluationPrompts = {
      // Base evaluation prompt that uses standardized format for all question types
      basePrompt: `You are a PTE academic evaluator. Evaluate this PTE ${type} answer: ${JSON.stringify(userAnswer)}.
      
      Original question: ${JSON.stringify(originalQuestion)}
      
      Return the evaluation in EXACTLY this format:
      {
        "questionType": "${type}",
        "headers": ["Criteria", "Description", "Points"],
        "rows": [
          ["Content Accuracy", "Accuracy of the answer content and understanding", "+1"],
          ["Language Use", "Appropriate use of grammar and vocabulary", "+1"],
          ["Task Completion", "All required elements of the task addressed", "+1"],
          ["Organization", "Logical organization and structure of the answer", "+1"],
          ["Overall Quality", "Overall effectiveness in addressing the question", "+1"]
        ],
        "overallScore": "X / 5"
      }

      💡 Each criteria is worth exactly 1 point. Total score must be out of 5.
      `,

      // For speaking questions like Read Aloud, use specific speaking criteria
      readAloud: `You are a PTE academic evaluator. The task is a "Read Aloud" speaking question.

      Original text: ${JSON.stringify(originalQuestion)}
      User's recorded answer: ${JSON.stringify(userAnswer)}

      Return the evaluation in EXACTLY this format:
      {
        "questionType": "Read Aloud",
        "headers": ["Criteria", "Description", "Points"],
        "rows": [
          ["Fluency", "Choose one: 'Speech flows naturally with appropriate pacing and minimal hesitation' OR 'Delivery shows good rhythm and natural pauses' OR 'Speaking pace and flow demonstrate confidence'", "+1"],
          ["Pronunciation", "Choose one: 'Words are pronounced clearly with correct stress patterns' OR 'Sound production is accurate and intelligible' OR 'Individual sounds and word stress are well-articulated'", "+1"],
          ["Vocal Variation", "Choose one: 'Good use of intonation to emphasize key points' OR 'Effective variation in tone and pitch throughout' OR 'Voice modulation adds meaning and engagement'", "+1"],
          ["Correctness", "Choose one: 'All words are read accurately as written' OR 'Text is reproduced faithfully without substitutions' OR 'Reading maintains the exact wording of the text'", "+1"],
          ["Completeness", "Choose one: 'The entire passage is covered without omissions' OR 'All parts of the text are included in the reading' OR 'No content is skipped or missed in the delivery'", "+1"]
        ],
        "overallScore": "X / 5"
      }`,

      // For writing questions like essays, use specific writing criteria
      writeEssay: `You are a PTE academic evaluator. The task is a "Write Essay" question.

        TASK: Evaluate the user's essay by analyzing content, structure, grammar, vocabulary, and length.

        INPUT DATA:
        Topic: ${JSON.stringify(originalQuestion?.topic || '')}
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        User's essay: ${JSON.stringify(typeof userAnswer === 'string' ? userAnswer : '')}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Write Essay",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Overall Quality", "Evaluation of content, structure, grammar, vocabulary, and length", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["Key points that should be covered:", "1. point_1", "2. point_2", ...]
        }

        EVALUATION GUIDELINES:
        1. Award points based on overall quality (0-5 points):
           - Perfect (5 points):
             * Clear structure (intro, body, conclusion)
             * Strong arguments with examples
             * No grammar errors
             * Excellent vocabulary
             * Within word limit (200-300 words)
             * Addresses all aspects of topic
           
           - Very Good (4 points):
             * Good structure
             * Valid arguments with some examples
             * Minor grammar issues
             * Good vocabulary
             * Within word limit
             * Addresses main aspects
           
           - Good (3 points):
             * Basic structure
             * Some arguments
             * Some grammar issues
             * Basic vocabulary
             * Slightly outside word limit
             * Addresses topic partially
           
           - Fair (2 points):
             * Weak structure
             * Few arguments
             * Multiple grammar issues
             * Limited vocabulary
             * Outside word limit
             * Misses key aspects
           
           - Poor (1 point):
             * No clear structure
             * Weak arguments
             * Major grammar issues
             * Poor vocabulary
             * Far outside word limit
             * Off-topic content
           
           - Very Poor (0 points):
             * No structure
             * No arguments
             * Severe grammar issues
             * Inappropriate vocabulary
             * Completely outside limit
             * Irrelevant content

        2. In the description:
           - Analyze essay structure
           - Evaluate argument quality
           - Point out grammar/vocabulary issues
           - Comment on word count
           - Provide specific improvement suggestions
           - Note strong and weak points

        3. In correctAnswers:
           - List key points that should be covered
           - Suggest argument structure
           - Recommend relevant examples
           - Note important vocabulary for topic

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      summarizeWrittenText: `You are a PTE academic evaluator. The task is a "Summarize Written Text" writing question.

        TASK: Evaluate the user's summary by analyzing content coverage, grammar, vocabulary, and length.

        INPUT DATA:
        Original passage: ${JSON.stringify(originalQuestion?.passage || '')}
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        User's summary: ${JSON.stringify(typeof userAnswer === 'string' ? userAnswer : '')}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Summarize Written Text",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Overall Quality", "Evaluation of content, grammar, vocabulary, and length", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["A good summary should include: key_point_1, key_point_2, ..."]
        }

        EVALUATION GUIDELINES:
        1. Award points based on overall quality (0-5 points):
           - Perfect (5 points):
             * Covers all main ideas
             * No grammar errors
             * Excellent vocabulary
             * Within word limit (5-75 words)
             * Clear and concise
           
           - Very Good (4 points):
             * Covers most main ideas
             * Minor grammar issues
             * Good vocabulary
             * Within word limit
             * Generally clear
           
           - Good (3 points):
             * Covers key ideas
             * Some grammar issues
             * Basic vocabulary
             * Slightly outside word limit
             * Mostly understandable
           
           - Fair (2 points):
             * Missing main ideas
             * Multiple grammar issues
             * Limited vocabulary
             * Outside word limit
             * Somewhat unclear
           
           - Poor (1 point):
             * Few relevant ideas
             * Major grammar issues
             * Poor vocabulary
             * Far outside word limit
             * Difficult to understand
           
           - Very Poor (0 points):
             * No relevant content
             * Severe grammar issues
             * Inappropriate vocabulary
             * Completely outside limit
             * Incomprehensible

        2. In the description:
           - List the main ideas that were covered/missed
           - Point out specific grammar issues
           - Highlight good/poor vocabulary choices
           - Note any length issues
           - Provide specific improvement suggestions

        3. In correctAnswers:
           - List the key points that should be included
           - Provide example phrasing if helpful
           - Note any essential vocabulary

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      fillInTheBlanks_reading: `You are a PTE academic evaluator. The task is a "Fill in the Blanks" reading question.

        TASK: Evaluate the user's answers for a reading fill in the blanks question by analyzing the paragraph context.

        INPUT DATA:
        Paragraph with blanks: ${JSON.stringify(originalQuestion?.paragraph || '')}
        Available options for each blank: ${JSON.stringify(originalQuestion?.blanks || {})}
        User's answers: ${JSON.stringify(typeof userAnswer === 'object' ? userAnswer : {})}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Fill in the Blanks (Reading)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": [" correct_word", " correct_word", ...]
        }

        EVALUATION GUIDELINES:
        1. Analyze the paragraph context and grammar to determine the most appropriate word for each blank
        2. Consider:
           - Grammatical correctness
           - Context appropriateness
           - Semantic meaning
           - Collocation patterns
        3. Award points based on:
           - All answers fit perfectly: +5 points
           - Most answers fit well (75%+ correct): +4 points
           - Half answers fit (50-74% correct): +3 points
           - Some answers fit (25-49% correct): +2 points
           - Few answers fit (1-24% correct): +1 point
           - No answers fit: +0 points
        4. In the description, explain why each answer does or doesn't fit the context
        5. Make the feedback sound like a direct response to the person chatting
        6. IMPORTANT: Include the correct word for each blank in the correctAnswers array

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      reading_fillInTheBlanks: `You are a PTE academic evaluator. The task is a "Reading & Writing: Fill in the Blanks" question with drag and drop.

        TASK: Evaluate the user's answers for a reading fill in the blanks question by analyzing the paragraph context.

        INPUT DATA:
        Paragraph with blanks: ${JSON.stringify(originalQuestion?.paragraph || '')}
        Available words: ${JSON.stringify(originalQuestion?.blanks || [])}
        User's answers: ${JSON.stringify(typeof userAnswer === 'object' ? userAnswer : {})}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Reading & Writing: Fill in the Blanks (Drag & Drop)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": [" correct_word", "correct_word", ...]
        }

        EVALUATION GUIDELINES:
        1. Analyze the paragraph context and grammar to determine the most appropriate word for each blank
        2. Consider:
           - Grammatical correctness
           - Context appropriateness
           - Semantic meaning
           - Collocation patterns
           - Word order and flow
        3. Award points based on:
           - All words placed correctly: +5 points
           - Most words correct (75%+ accuracy): +4 points
           - Half words correct (50-74% accuracy): +3 points
           - Some words correct (25-49% accuracy): +2 points
           - Few words correct (1-24% accuracy): +1 point
           - No words correct: +0 points
        4. In the description:
           - Explain why each word placement is correct or incorrect
           - Suggest the best word for each blank
           - Explain how the correct words improve readability and meaning
        5. Make the feedback sound like a direct response to the person chatting
        6. IMPORTANT: Include the correct word for each blank in the correctAnswers array

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      multipleChoiceMultiple_reading: `You are a PTE academic evaluator. The task is a "Multiple Choice (Multiple Answer)" reading question.

        TASK: Evaluate the user's selected answers by analyzing the passage content.

        INPUT DATA:
        Passage: ${JSON.stringify(originalQuestion?.passage || '')}
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        Options: ${JSON.stringify(originalQuestion?.options || [])}
        User's answers: ${JSON.stringify(Array.isArray(userAnswer) ? userAnswer : [])}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Multiple Choice (Multiple Answer)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["correct_option_1", "correct_option_2", ...]
        }

        EVALUATION GUIDELINES:
        1. Analyze the passage carefully to determine which options are correct
        2. Consider:
           - Direct statements from the passage
           - Implied information
           - Supporting evidence
        3. Award points based on:
           - All correct options selected, no wrong ones: +5 points
           - Most correct options (75%+ accuracy): +4 points
           - Half correct options (50-74% accuracy): +3 points
           - Some correct options (25-49% accuracy): +2 points
           - Few correct options (1-24% accuracy): +1 point
           - No correct options or all wrong: +0 points
        4. In the description, explain why each selected option is correct or incorrect
        5. Make the feedback sound like a direct response to the person chatting
        6. IMPORTANT: List all correct options in the correctAnswers array

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      multipleChoiceSingle_reading: `You are a PTE academic evaluator. The task is a "Multiple Choice (Single Answer)" reading question.

        TASK: Evaluate the user's selected answer by analyzing the passage content and question.

        INPUT DATA:
        Passage: ${JSON.stringify(originalQuestion?.passage || '')}
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        Available options: ${JSON.stringify(originalQuestion?.options || [])}
        User's answer: ${JSON.stringify(Array.isArray(userAnswer) && userAnswer.length > 0 ? userAnswer[0] : '')}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Multiple Choice (Single Answer)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Selection", "Description of answer accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["correct_option"]
        }

        EVALUATION GUIDELINES:
        1. Analyze the passage carefully to determine the correct answer
        2. Consider:
           - Direct statements from the passage
           - Implied information
           - Supporting evidence
           - Context and meaning
           - Question type (main idea, detail, inference, etc.)
        3. Award points based on:
           - Correct answer with strong passage support: +5 points
           - Partially correct answer with some support: +2-3 points
           - Incorrect answer or no answer: +0 points
        4. In the description:
           - Explain why the selected answer is correct or incorrect
           - Point out relevant evidence from the passage
           - Clarify any misunderstandings
           - Suggest what to look for in similar questions
        5. Make the feedback sound like a direct response to the person chatting
        6. IMPORTANT: Include the correct option in the correctAnswers array with explanation

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      reorderParagraph: `You are a PTE academic evaluator. The task is a "Reorder Paragraphs" reading question.

        TASK: Evaluate the user's paragraph ordering by analyzing coherence, flow, and logical progression.

        INPUT DATA:
        Original paragraphs: ${JSON.stringify(originalQuestion?.questions || [])}
        User's order: ${JSON.stringify(Array.isArray(userAnswer) ? userAnswer : [])}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Reorder Paragraphs",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Paragraph Order", "Description of ordering accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["1. first_paragraph", "2. second_paragraph", "3. third_paragraph", ...]
        }

        EVALUATION GUIDELINES:
        1. Analyze the logical flow and coherence of the paragraphs
        2. Consider:
           - Topic introduction and development
           - Logical progression of ideas
           - Transitional phrases and connections
           - Cause and effect relationships
           - Chronological sequence (if applicable)
           - Conclusion placement
        3. Award points based on:
           - Perfect order with clear logical flow: +5 points
           - Mostly correct order (1-2 minor swaps): +4 points
           - Partially correct order (main ideas in place): +3 points
           - Some correct sequences: +2 points
           - Few correct connections: +1 point
           - Completely incorrect order: +0 points
        4. In the description:
           - Explain why the current order works or doesn't work
           - Point out logical breaks in flow
           - Highlight successful connections
           - Suggest improvements
        5. Make the feedback sound like a direct response to the person chatting
        6. IMPORTANT: List the paragraphs in the correct order in the correctAnswers array, numbered from 1

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      // For listening questions
      summarizeSpokenText: `IMPORTANT: You MUST respond with ONLY a JSON object. NO greetings, NO explanations, NO other text.

        TASK: Evaluate this Summarize Spoken Text response by comparing the meaning and key points, not exact matches.

        INPUT DATA:
        User summary: "${userAnswer || ''}"
        Model summary: "${originalQuestion.correct_answers?.[0] || ''}"

        REQUIRED OUTPUT FORMAT (fill in the X values and descriptions):
        {
          "questionType": "Summarize Spoken Text",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Content Accuracy", "Description of how well key points and main ideas are captured", "+X"],
            ["Grammar & Vocabulary", "Description of language use and expression", "+X"],
            ["Word Count", "Description of word count requirement (50-70 words)", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["${originalQuestion.correct_answers?.[0] || ''}"]
        }

        SCORING CRITERIA:
        1. Content Accuracy (0-2 points):
          - All key points and main ideas captured, even if expressed differently: +2
          - Most key points captured with some missing or minor inaccuracies: +1.5
          - Some key points captured but significant ideas missing: +1
          - Few key points captured or major misunderstandings: +0.5
          - Completely off-topic or no relevant points: +0

        2. Grammar & Vocabulary (0-2 points):
          - Clear, well-structured language with appropriate academic vocabulary: +2
          - Generally clear with minor errors, good vocabulary use: +1.5
          - Some errors but meaning is clear, adequate vocabulary: +1
          - Frequent errors that sometimes affect meaning: +0.5
          - Major errors that make the text difficult to understand: +0

        3. Word Count (0-1 points):
          - Within 50-70 words: +1
          - Slightly outside range (45-49 or 71-75 words): +0.5
          - Significantly outside range: +0

        EVALUATION GUIDELINES:
        - Focus on meaning and key ideas rather than exact word matches
        - Consider alternative expressions that convey the same meaning
        - Look for demonstration of understanding rather than memorization
        - Accept valid paraphrasing and synonyms
        - Consider coherence and logical flow of ideas
        - Evaluate effectiveness of communication rather than perfect reproduction

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      listening: `You are a PTE academic evaluator. The task is a "${type}" listening question.

        Original audio transcript/correct answer: ${JSON.stringify(originalQuestion)}
        User's answer: ${JSON.stringify(userAnswer)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "${type}",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Content Accuracy", "Accuracy of understanding and response to the audio content.", "+1"],
            ["Key Information", "Identification and inclusion of main points and details.", "+1"],
            ["Grammar & Vocabulary", "Appropriate use of language in the response.", "+1"],
            ["Completeness", "All required elements of the answer are provided.", "+1"],
            ["Task Fulfillment", "Answer meets the specific requirements of the question type.", "+1"]
          ],
          "overallScore": "X / 5"
        }`,

      // For speaking questions (except readAloud which is handled above)
      speaking: `You are a PTE academic evaluator. The task is a "${type}" speaking question.

        Original prompt/expected response: ${JSON.stringify(originalQuestion)}
        User's recorded answer transcript: ${JSON.stringify(userAnswer)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "${type}",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Pronunciation", "Clarity and accuracy of word sounds and stress patterns.", "+1"],
            ["Fluency", "Natural flow and rhythm of speech without unnatural pauses.", "+1"],
            ["Content Accuracy", "Relevance and accuracy of the spoken response.", "+1"],
            ["Vocabulary Usage", "Appropriate choice and range of vocabulary.", "+1"],
            ["Grammar & Structure", "Correct use of grammar and sentence structures.", "+1"]
          ],
          "overallScore": "X / 5"
        }`,

      // Special handling for describeImage
      describeImage: `You are a PTE academic evaluator. The task is a "Describe Image" speaking question.

        Original image details: ${JSON.stringify(originalQuestion)}
        User's audio recording URL: ${JSON.stringify(userAnswer?.audioUrl)}

        You are evaluating a speaking response where the user has described the image shown. 
        
        IMPORTANT EVALUATION RULES:
        1. If the audio recording URL is missing or invalid, give 0 points for all criteria
        2. For proper responses, evaluate based on these aspects:
          - Content Coverage (0-2 points):
            * Describes main features and key details from the image_description
            * Follows logical structure (introduction, key features, conclusion)
            * Includes relevant data/numbers if present in the image
          - Fluency (0-1 points):
            * Natural speech flow without unnatural pauses
            * Appropriate speaking pace
          - Pronunciation (0-1 points):
            * Clear word pronunciation with proper stress
            * Easily understandable speech
          - Vocabulary (0-0.5 points):
            * Uses appropriate terms for image description
            * Demonstrates good range of vocabulary
          - Structure (0-0.5 points):
            * Logical organization with clear introduction and conclusion
            * Good use of linking words

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "Describe Image",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Content Coverage", "Description of main features and key details of the image", "+0"],
            ["Fluency", "Natural flow of speech without unnatural pauses", "+0"],
            ["Pronunciation", "Clear pronunciation of words with proper stress", "+0"],
            ["Vocabulary", "Use of appropriate vocabulary to describe the image", "+0"],
            ["Structure", "Logical organization with introduction and conclusion", "+0"]
          ],
          "overallScore": "X / 5"
        }
        Note: The above is a template showing minimum scores. Adjust points based on actual performance.`,

      repeatSentence: `You are evaluating a PTE Speaking "Repeat Sentence" response.

          Original sentence: "${originalQuestion.sentence}"

          Student's audio response details:
          ${JSON.stringify(userAnswer, null, 2)}

          IMPORTANT EVALUATION RULES:
          1. If the audio recording is empty (isEmpty: true), give 0 points for all criteria
          2. If no clear speech is detected or contentSize < 1024 bytes, give 0 points for all criteria
          3. For proper responses, evaluate based on these aspects:
            - Content: Exact words and sequence match (max 2 points)
            - Pronunciation: Clear and accurate pronunciation (max 1.5 points)
            - Fluency: Natural flow and appropriate pace (max 1.5 points)

          YOU MUST RETURN THE EVALUATION IN THIS EXACT FORMAT, WITH NO ADDITIONAL TEXT OR EXPLANATION:
          {
            "questionType": "Repeat Sentence",
            "headers": ["Criteria", "Description", "Points"],
            "rows": [
              ["Content", "Accuracy in repeating the exact words and sequence", "+0"],
              ["Pronunciation", "Clarity and accuracy of pronunciation", "+0"],
              ["Fluency", "Natural flow and appropriate pacing", "+0"]
            ],
            "overallScore": "X/ 5"
          }

          CRITICAL REQUIREMENTS:
          1. Use EXACTLY these field names and structure
          2. Points must be strings starting with "+" (e.g. "+1", "+1.5", "+0")
          3. overallScore must be in format "X / 5" where X is a number
          4. Do not add any additional fields or explanatory text
          5. Return ONLY the JSON object, nothing else
          `,
          
      answerShortQuestion: `You are evaluating a PTE Speaking "Answer Short Question" response.

        Original question: ${JSON.stringify(originalQuestion)}
        User's recorded answer: ${JSON.stringify(userAnswer)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "Answer Short Question",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Content Accuracy", "Accuracy and relevance of the spoken response", "+1"],
            ["Pronunciation", "Clarity and accuracy of pronunciation", "+1"],
            ["Fluency", "Natural flow and appropriate pacing", "+1"],
            ["Response Time", "Quick and confident response", "+1"],
            ["Task Completion", "Answer provided within expected length", "+1"]
          ],
          "overallScore": "X / 5"
        }
        
        IMPORTANT EVALUATION RULES:
        1. If the audio recording is empty (isEmpty: true), give 0 points for all criteria
        2. If no clear speech is detected or contentSize < 1024 bytes, give 0 points for all criteria
        3. For proper responses, evaluate based on these aspects and adjust points accordingly`,

      respondToSituation: `You are evaluating a PTE Speaking "Respond to a Situation" response.

        Original question: ${JSON.stringify(originalQuestion)}
        User's recorded answer: ${JSON.stringify(userAnswer)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "Respond to a Situation",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Content Accuracy", "Accuracy and relevance of the spoken response", "+1"],
            ["Pronunciation", "Clarity and accuracy of pronunciation", "+1"],
            ["Fluency", "Natural flow and appropriate pacing", "+1"],
            ["Response Time", "Quick and confident response", "+1"],
            ["Task Completion", "Answer provided within expected length", "+1"]
          ],
          
          "overallScore": "X / 5"
        }

        IMPORTANT EVALUATION RULES:
        
        1. If the audio recording is empty (isEmpty: true), give 0 points for all criteria
        2. If no clear speech is detected or contentSize < 1024 bytes, give 0 points for all criteria
        3. For proper responses, evaluate based on these aspects and adjust points accordingly`,

      writeFromDictation: `IMPORTANT: You MUST respond with ONLY a JSON object. NO greetings, NO explanations, NO other text.

        TASK: Evaluate this Write from Dictation response by comparing the written answer with the correct sentence.

        INPUT DATA:
        User answer: "${userAnswer || ''}"
        Correct sentence: "${originalQuestion.sentence || originalQuestion.correct_answers?.[0] || ''}"

        REQUIRED OUTPUT FORMAT (fill in the X values and descriptions):
        {
          "questionType": "Write from Dictation",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Word Accuracy", "Description of spelling and word choice accuracy", "+X"],
            ["Word Order", "Description of word sequence accuracy", "+X"],
            ["Completeness", "Description of whether all words are included", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ["${originalQuestion.sentence || originalQuestion.correct_answers?.[0] || ''}"]
        }

        SCORING CRITERIA:
        1. Word Accuracy (0-2 points):
          - All words spelled correctly and match audio: +2
          - Most words correct with minor spelling errors: +1.5
          - Some words correct but significant spelling errors: +1
          - Few words correct or major spelling errors: +0.5
          - No correct words or incomprehensible: +0

        2. Word Order (0-2 points):
          - Perfect word sequence matching audio: +2
          - Mostly correct sequence with 1-2 word order issues: +1.5
          - Some correct sequences but multiple order issues: +1
          - Major word order issues: +0.5
          - Completely incorrect order: +0

        3. Completeness (0-1 point):
          - All words from audio included: +1
          - Most words included (1-2 missing): +0.5
          - Multiple words missing: +0

        EVALUATION GUIDELINES:
        - Compare exact words and spelling
        - Check word order matches exactly
        - Verify all words from audio are included
        - Consider capitalization and punctuation
        - Evaluate based on exact matches, not meaning
        - No partial credit for synonyms or paraphrasing

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      fillInTheBlanks_listening: `You are a PTE academic evaluator. The task is a "Fill in the Blanks" listening question.

        Original question: ${JSON.stringify(originalQuestion)}
        User's answers: ${JSON.stringify(userAnswer)}

        Compare the arrays directly:
        1. User's answers: ${JSON.stringify(userAnswer)}
        2. Correct answers: ${JSON.stringify(originalQuestion.correct_answers)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "Fill in the Blanks (Listening)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ${JSON.stringify(originalQuestion.correct_answers)}
        }

        IMPORTANT EVALUATION RULES:
        1. Compare each answer with the corresponding correct answer at the same array index
        2. Award points based on:
           - All answers correct: +5 points
           - Most answers correct (75%+ correct): +4 points
           - Half answers correct (50-74% correct): +3 points
           - Some answers correct (25-49% correct): +2 points
           - Few answers correct (1-24% correct): +1 point
           - No correct answers: +0 points
        3. In the description, explain which answers were correct/incorrect
        4. Make the feedback sound like a direct response to the person chatting
        5. Consider minor spelling mistakes - if the answer is very close to correct, count it as partially correct`,

      multipleChoiceMultiple_listening: `You are a PTE academic evaluator. The task is a "Multiple Choice (Multiple Answer)" listening question.

        Original question: ${JSON.stringify(originalQuestion)}
        User's selected answers: ${JSON.stringify(userAnswer)}

        The correct answers are: ${JSON.stringify(originalQuestion.correct_answers)}

        Evaluate the answers by comparing arrays:
        1. User selected: ${JSON.stringify(userAnswer)}
        2. Correct answers: ${JSON.stringify(originalQuestion.correct_answers)}

        Return the evaluation in EXACTLY this format:
        {
          "questionType": "Multiple Choice (Multiple Answer)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": ${JSON.stringify(originalQuestion.correct_answers)}
        }

        IMPORTANT EVALUATION RULES:
        1. Compare arrays exactly - order doesn't matter but content must match
        2. Award points based on:
           - All correct answers selected AND no wrong answers: +5 points
           - All correct answers but some wrong ones too: +3 points
           - Some correct answers only: +2 points
           - All wrong answers: +0 points
        3. In the description, explain which answers were correct/incorrect
        4. Make the feedback sound like a direct response to the person chatting`,

      multipleChoiceSingle_listening: `You are a PTE academic evaluator. The task is a "Multiple Choice (Single Answer)" listening question.

        TASK: Evaluate the user's selected answer against the audio content.

        INPUT DATA:
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        Options: ${JSON.stringify(originalQuestion?.options || [])}
        User's answer: ${JSON.stringify(Array.isArray(userAnswer) && userAnswer.length > 0 ? userAnswer[0] : null)}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Multiple Choice (Single Answer)",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": []
        }

        EVALUATION GUIDELINES:
        1. Analyze the answer in context of the audio content
        2. Award points based on:
           - Answer matches audio content perfectly: +5 points
           - Answer partially matches or is related: +2-3 points
           - Answer contradicts or is unrelated: +0 points
        3. In the description, explain why the answer is or isn't appropriate
        4. Make the feedback sound like a direct response to the person chatting

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      selectMissingWord_listening: `You are a PTE academic evaluator. The task is a "Select Missing Word" listening question.

        TASK: Evaluate the user's selected word against the audio context.

        INPUT DATA:
        Question: ${JSON.stringify(originalQuestion?.question || '')}
        Options: ${JSON.stringify(originalQuestion?.options || [])}
        User's answer: ${JSON.stringify(Array.isArray(userAnswer) && userAnswer.length > 0 ? userAnswer[0] : null)}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Select Missing Word",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": []
        }

        EVALUATION GUIDELINES:
        1. Analyze how well the selected word completes the audio
        2. Consider:
           - Semantic fit
           - Grammatical correctness
           - Context appropriateness
        3. Award points based on:
           - Perfect fit: +5 points
           - Good but not perfect fit: +3-4 points
           - Poor fit: +1-2 points
           - Completely inappropriate: +0 points
        4. In the description, explain why the word does or doesn't fit
        5. Make the feedback sound like a direct response to the person chatting

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`,

      highlightIncorrectWords: `You are a PTE academic evaluator. The task is a "Highlight Incorrect Words" listening question.

        TASK: Evaluate the user's highlighted words against the audio content.

        INPUT DATA:
        Text: ${JSON.stringify(originalQuestion?.text || '')}
        User's highlighted words: ${JSON.stringify(Array.isArray(userAnswer) ? userAnswer : [])}

        REQUIRED OUTPUT FORMAT:
        {
          "questionType": "Highlight Incorrect Words",
          "headers": ["Criteria", "Description", "Points"],
          "rows": [
            ["Answer Accuracy", "Description of accuracy and points awarded", "+X"]
          ],
          "overallScore": "X / 5",
          "correctAnswers": []
        }

        EVALUATION GUIDELINES:
        1. Compare highlighted words with audio content
        2. Consider both:
           - False positives (highlighting correct words)
           - False negatives (missing incorrect words)
        3. Award points based on:
           - All incorrect words found, no extras: +5 points
           - Most found (75%+ accuracy): +4 points
           - Half found (50-74% accuracy): +3 points
           - Some found (25-49% accuracy): +2 points
           - Few found (1-24% accuracy): +1 point
           - None found or all wrong: +0 points
        4. In the description, explain each highlight's accuracy
        5. Make the feedback sound like a direct response to the person chatting

        CRITICAL: Return ONLY the JSON object. Any other text will cause an error.`
    };

    return evaluationPrompts[type] || "No evaluation prompt found for this type.";
  },

  casualChatTone: `
    🔁 Chat गर्दा:
    - Natural र friendly tone मा कुरा गर्नुहोस्
    - Short र simple responses दिनुहोस्
    - If appropriate, ask if they want to practice PTE
    - Mix Nepali and English naturally
  `,

  casualNepaliTone: `
    Response दिनुहोस्: **५०% Nepali (Devanagari)** र **५०% English** मा।

    🗂️ Structure + Format:
    - Use bullet points with <ul><li>...</li></ul> for clarity
    - Use <strong> for emphasis, <br/> for line breaks
    - Keep the tone friendly, encouraging, and easy to understand — as if you're explaining to a school student
    - Explain briefly *only when necessary*, and make the logic simple and positive

    ---

    ✅ <strong>Formatting Instructions:</strong>
    <ul>
      <li>Each feedback point should be concise and clear</li>
      <li>If helpful, include short reasoning or explanation</li>
      <li>Use plain Nepali-English mix — modern and conversational</li>
      <li>Use HTML tags to highlight or structure important points</li>
      <li><strong>English Answer:</strong> Repeat the full response below in pure English (no Nepali)</li>
    </ul>

    ---

    📌 यदि प्रश्न PTE सँग सम्बन्धित छैन भने:
    <ul>
      <li>Redirect the user: <strong>"यो प्रश्न PTE सँग सम्बन्धित छैन। तपाईं <u>PTE Practice</u> मा फर्कन चाहनुहुन्छ?"</strong></li>
    </ul>
    `,

  friendlyNepaliTone: `
    Response दिनुहोस्: **५०% Nepali (Devanagari)** र **५०% English** मा।

    🗂️ Structure + Format:
    - Use bullet points with <ul><li>...</li></ul> for clarity
    - Use <strong> for emphasis, <br/> for line breaks
    - Keep the tone friendly, encouraging, and easy to understand — as if you're explaining to a school student
    - Explain briefly *only when necessary*, and make the logic simple and positive

    ---

    ✅ <strong>Formatting Instructions:</strong>
    <ul>
      <li>Each feedback point should be concise and clear</li>
      <li>If helpful, include short reasoning or explanation</li>
      <li>Use plain Nepali-English mix — modern and conversational</li>
      <li>Use HTML tags to highlight or structure important points</li>
      <li><strong>English Answer:</strong> Repeat the full response below in pure English (no Nepali)</li>
    </ul>

    ---

    📌 यदि प्रश्न PTE सँग सम्बन्धित छैन भने:
    <ul>
      <li>Redirect the user: <strong>"यो प्रश्न PTE सँग सम्बन्धित छैन। तपाईं <u>PTE Practice</u> मा फर्कन चाहनुहुन्छ?"</strong></li>
    </ul>

    ---

    🎯 <strong>Enhanced Response Format:</strong>
    <ul>
      <li><strong>For normal paragraphs:</strong> Use regular text with <strong>bold</strong> for emphasis</li>
      <li><strong>For bullet points:</strong> Always use proper HTML structure:
        <ul>
          <li>Use <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> tags for lists</li>
          <li>Use <code>&lt;strong&gt;</code> for important points</li>
          <li>Use <code>&lt;br/&gt;</code> for line breaks when needed</li>
        </ul>
      </li>
      <li><strong>For structured content:</strong> Use appropriate HTML tags:
        <ul>
          <li><code>&lt;h3&gt;</code> for section headers</li>
          <li><code>&lt;p&gt;</code> for paragraphs</li>
          <li><code>&lt;div&gt;</code> for content blocks</li>
        </ul>
      </li>
    </ul>

    ---

    📝 <strong>Response Structure:</strong>
    <ul>
      <li>Start with a brief introduction or context</li>
      <li>Present main points in bullet format using <code>&lt;ul&gt;&lt;li&gt;</code></li>
      <li>Use <strong>bold text</strong> to highlight key concepts</li>
      <li>End with a conclusion or next steps</li>
      <li>Always include the <strong>English Answer</strong> section at the end</li>
    </ul>
    `,

  // Enhanced formatting instructions for responses that need HTML structure
  enhancedFormattingInstructions: `
    🎯 <strong>Enhanced Response Format Guidelines:</strong>
    
    <h3>📋 Response Structure</h3>
    <ul>
      <li><strong>Introduction:</strong> Brief context or overview</li>
      <li><strong>Main Content:</strong> Detailed explanation with proper formatting</li>
      <li><strong>Conclusion:</strong> Summary or next steps</li>
    </ul>

    <h3>🔧 HTML Formatting Rules</h3>
    <ul>
      <li><strong>For bullet points:</strong> Always use <code>&lt;ul&gt;&lt;li&gt;</code> structure</li>
      <li><strong>For emphasis:</strong> Use <code>&lt;strong&gt;</code> tags</li>
      <li><strong>For line breaks:</strong> Use <code>&lt;br/&gt;</code> when needed</li>
      <li><strong>For sections:</strong> Use <code>&lt;h3&gt;</code> for headers</li>
      <li><strong>For paragraphs:</strong> Use <code>&lt;p&gt;</code> tags</li>
    </ul>

    <h3>📝 Content Guidelines</h3>
    <ul>
      <li>Keep responses concise and actionable</li>
      <li>Use clear, simple language</li>
      <li>Structure information logically</li>
      <li>Highlight important points with bold text</li>
      <li>Use bullet points for lists and multiple items</li>
    </ul>

    <h3>⚠️ Important Notes</h3>
    <ul>
      <li>Always validate HTML structure</li>
      <li>Ensure proper opening and closing tags</li>
      <li>Use semantic HTML where appropriate</li>
      <li>Keep formatting consistent throughout the response</li>
    </ul>
  `,

  // Method to get enhanced formatting for specific response types
  getEnhancedFormattingPrompt(responseType) {
    const enhancedPrompts = {
      feedback: `
        ${this.enhancedFormattingInstructions}
        
        <h3>📊 Feedback Response Format</h3>
        <ul>
          <li>Use <code>&lt;h3&gt;</code> for section headers</li>
          <li>Use <code>&lt;div class="feedback-content"&gt;</code> for main content</li>
          <li>Use <code>&lt;ul&gt;&lt;li&gt;</code> for feedback points</li>
          <li>Use <code>&lt;strong&gt;</code> for emphasis on key points</li>
          <li>Keep feedback concise and actionable</li>
        </ul>
      `,
      
      explanation: `
        ${this.enhancedFormattingInstructions}
        
        <h3>📚 Explanation Response Format</h3>
        <ul>
          <li>Start with a clear introduction</li>
          <li>Break down complex concepts into bullet points</li>
          <li>Use examples where helpful</li>
          <li>End with a summary or practical tip</li>
        </ul>
      `,
      
      instruction: `
        ${this.enhancedFormattingInstructions}
        
        <h3>📖 Instruction Response Format</h3>
        <ul>
          <li>Number steps clearly</li>
          <li>Use bullet points for sub-steps</li>
          <li>Highlight important warnings or tips</li>
          <li>Provide clear examples when needed</li>
        </ul>
      `,
      
      default: this.enhancedFormattingInstructions
    };

    return enhancedPrompts[responseType] || enhancedPrompts.default;
  },

  // Utility method to format response with proper HTML structure
  formatResponseWithHTML(content, responseType = 'default') {
    const formattingPrompt = this.getEnhancedFormattingPrompt(responseType);
    
    return `
      ${formattingPrompt}
      
      <h3>📝 Response Content</h3>
      <div class="response-content">
        ${content}
      </div>
      
      <h3>✅ Formatting Requirements</h3>
      <ul>
        <li>Convert any bullet points to proper <code>&lt;ul&gt;&lt;li&gt;</code> structure</li>
        <li>Use <code>&lt;strong&gt;</code> for emphasis on important points</li>
        <li>Use <code>&lt;h3&gt;</code> for section headers if needed</li>
        <li>Use <code>&lt;p&gt;</code> for paragraphs</li>
        <li>Ensure all HTML tags are properly closed</li>
      </ul>
    `;
  },

  // Method to get chat response formatting instructions
  getChatResponseFormat() {
    return `
      🎯 <strong>Chat Response Format Guidelines:</strong>
      
      <h3>📋 Response Structure</h3>
      <ul>
        <li><strong>Introduction:</strong> Brief context or greeting</li>
        <li><strong>Main Content:</strong> Detailed response with proper formatting</li>
        <li><strong>Conclusion:</strong> Summary or next steps</li>
      </ul>

      <h3>🔧 HTML Formatting Rules</h3>
      <ul>
        <li><strong>For bullet points:</strong> Always use <code>&lt;ul&gt;&lt;li&gt;</code> structure</li>
        <li><strong>For emphasis:</strong> Use <code>&lt;strong&gt;</code> tags</li>
        <li><strong>For line breaks:</strong> Use <code>&lt;br/&gt;</code> when needed</li>
        <li><strong>For sections:</strong> Use <code>&lt;h3&gt;</code> for headers</li>
        <li><strong>For paragraphs:</strong> Use <code>&lt;p&gt;</code> tags</li>
      </ul>

      <h3>📝 Content Guidelines</h3>
      <ul>
        <li>Keep responses concise and helpful</li>
        <li>Use clear, simple language</li>
        <li>Structure information logically</li>
        <li>Highlight important points with bold text</li>
        <li>Use bullet points for lists and multiple items</li>
      </ul>

      <h3>⚠️ Important Notes</h3>
      <ul>
        <li>Always validate HTML structure</li>
        <li>Ensure proper opening and closing tags</li>
        <li>Use semantic HTML where appropriate</li>
        <li>Keep formatting consistent throughout the response</li>
      </ul>
    `;
  }
};