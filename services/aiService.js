const OpenAI = require('openai');
const Settings = require('../models/Settings');
const { AppError } = require('../middleware/errorHandler');

class AIService {
  constructor() {
    this.openai = null;
    this.settings = null;
  }

  // Initialize OpenAI client with current settings
  async initialize() {
    try {
      this.settings = await Settings.getSettingsWithSecrets();
      
      console.log('AI Service Debug - Settings retrieved:', {
        hasApiKey: !!this.settings.openRouterApiKey,
        modelName: this.settings.modelName,
        apiKeyPrefix: this.settings.openRouterApiKey ? this.settings.openRouterApiKey.substring(0, 10) + '...' : 'none'
      });
      
      if (!this.settings.openRouterApiKey) {
        throw new AppError('OpenRouter API key not configured. Please contact administrator.', 500);
      }

      // Fix for potential data corruption: if modelName looks like an API key, reset it
      if (this.settings.modelName && this.settings.modelName.startsWith('sk-or-v1-')) {
        console.log('AI Service Warning - Model name appears to be an API key, resetting to default');
        this.settings.modelName = 'openai/gpt-4o';
        await this.settings.save();
      }

      this.openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: this.settings.openRouterApiKey,
        defaultHeaders: {
          "HTTP-Referer": this.settings.systemSettings.siteUrl || "http://localhost:3000",
          "X-Title": this.settings.systemSettings.siteName || "AI Hiring Platform",
        },
      });

      return true;
    } catch (error) {
      console.error('AI Service initialization error:', error);
      throw error;
    }
  }

  // Generate interview questions based on job description
  async generateInterviewQuestions(jobDescription, questionCount = 5) {
    await this.initialize();

    const prompt = `
You are an expert HR interviewer. Based on the following job description, generate ${questionCount} relevant interview questions that will help assess a candidate's suitability for this role.

Job Description:
${jobDescription}

Please generate questions that cover:
1. Technical skills relevant to the role
2. Behavioral and situational scenarios
3. Cultural fit and motivation
4. Problem-solving abilities

Format your response as a JSON array of objects with the following structure:
[
  {
    "question": "Your question here",
    "type": "technical|behavioral|situational|general",
    "expectedAnswer": "Brief description of what a good answer should include"
  }
]

Make sure questions are:
- Specific to the role requirements
- Open-ended to encourage detailed responses
- Professional and unbiased
- Varied in difficulty and scope
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings.modelName || "openai/gpt-4o",
        messages: [
          { role: "system", content: "You are an expert HR interviewer who generates thoughtful, relevant interview questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      try {
        const questions = JSON.parse(response);
        return Array.isArray(questions) ? questions : [];
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        // Fallback: extract questions manually if JSON parsing fails
        return this.extractQuestionsFromText(response);
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new AppError('Failed to generate interview questions. Please try again.', 500);
    }
  }

  // Analyze candidate's answer to an interview question
  async analyzeAnswer(question, candidateAnswer, jobDescription) {
    await this.initialize();

    const prompt = `
You are an expert HR interviewer analyzing a candidate's response to an interview question.

Job Description:
${jobDescription}

Interview Question:
${question}

Candidate's Answer:
${candidateAnswer}

Please analyze this answer and provide:
1. A score from 1-10 (10 being excellent)
2. Key strengths demonstrated in the answer
3. Areas for improvement or concerns
4. Overall assessment of how well this answer fits the role requirements

Format your response as JSON:
{
  "score": 8,
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "analysis": "Detailed analysis of the answer",
  "relevanceToRole": "How well this answer demonstrates fit for the specific role"
}
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings.modelName || "openai/gpt-4o",
        messages: [
          { role: "system", content: "You are an expert HR interviewer who provides fair, objective analysis of candidate responses." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI analysis as JSON:', parseError);
        return {
          score: 5,
          strengths: ["Response provided"],
          concerns: ["Unable to analyze response properly"],
          analysis: response,
          relevanceToRole: "Analysis unavailable"
        };
      }
    } catch (error) {
      console.error('Error analyzing answer:', error);
      throw new AppError('Failed to analyze answer. Please try again.', 500);
    }
  }

  // Generate comprehensive evaluation report for a candidate
  async generateEvaluationReport(jobDescription, interviewResponses, candidateProfile) {
    await this.initialize();

    const responsesText = interviewResponses.map((response, index) => 
      `Question ${index + 1}: ${response.question}\nAnswer: ${response.answer}\nAI Analysis: ${response.aiAnalysis || 'Not analyzed'}\nScore: ${response.score || 'Not scored'}\n`
    ).join('\n---\n');

    const prompt = `
You are an expert HR manager creating a comprehensive evaluation report for a job candidate.

Job Description:
${jobDescription}

Candidate Profile:
- Name: ${candidateProfile.firstName} ${candidateProfile.lastName}
- Experience: ${candidateProfile.experience || 0} years
- Skills: ${candidateProfile.skills ? candidateProfile.skills.join(', ') : 'Not specified'}
- Location: ${candidateProfile.location || 'Not specified'}

Interview Responses and Analysis:
${responsesText}

Please provide a comprehensive evaluation report with:
1. Overall assessment and recommendation
2. Technical skills evaluation (score 0-100)
3. Communication skills evaluation (score 0-100)
4. Cultural fit assessment (score 0-100)
5. Key strengths (list)
6. Areas for improvement (list)
7. Suitability rating (excellent/good/average/below-average/poor)
8. Specific recommendations for hiring decision

Format as JSON:
{
  "overallAssessment": "Comprehensive summary of the candidate",
  "technicalSkillsScore": 85,
  "communicationScore": 90,
  "culturalFitScore": 80,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suitabilityRating": "good",
  "recommendations": "Specific recommendations for hiring decision",
  "overallScore": 85
}
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings.modelName || "openai/gpt-4o",
        messages: [
          { role: "system", content: "You are an expert HR manager who provides thorough, fair, and actionable candidate evaluations." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      try {
        const evaluation = JSON.parse(response);
        
        // Ensure all required fields are present with defaults
        return {
          overallAssessment: evaluation.overallAssessment || "Evaluation completed",
          technicalSkillsScore: Math.min(100, Math.max(0, evaluation.technicalSkillsScore || 50)),
          communicationScore: Math.min(100, Math.max(0, evaluation.communicationScore || 50)),
          culturalFitScore: Math.min(100, Math.max(0, evaluation.culturalFitScore || 50)),
          strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : ["Completed interview"],
          weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : ["Areas for improvement identified"],
          suitabilityRating: ['excellent', 'good', 'average', 'below-average', 'poor'].includes(evaluation.suitabilityRating) 
            ? evaluation.suitabilityRating : 'average',
          recommendations: evaluation.recommendations || "Further review recommended",
          overallScore: Math.min(100, Math.max(0, evaluation.overallScore || 50))
        };
      } catch (parseError) {
        console.error('Failed to parse evaluation report as JSON:', parseError);
        throw new AppError('Failed to generate evaluation report. Please try again.', 500);
      }
    } catch (error) {
      console.error('Error generating evaluation report:', error);
      throw new AppError('Failed to generate evaluation report. Please try again.', 500);
    }
  }

  // Fallback method to extract questions from text if JSON parsing fails
  extractQuestionsFromText(text) {
    const questions = [];
    const lines = text.split('\n');
    
    let currentQuestion = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for question patterns
      if (trimmedLine.match(/^\d+\./) || trimmedLine.includes('?')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        currentQuestion = {
          question: trimmedLine.replace(/^\d+\.\s*/, ''),
          type: 'general',
          expectedAnswer: 'Detailed response expected'
        };
      }
    }
    
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  }

  // Test AI connection
  async testConnection() {
    try {
      await this.initialize();
      
      const completion = await this.openai.chat.completions.create({
        model: this.settings.modelName || "openai/gpt-4o",
        messages: [
          { role: "user", content: "Hello, please respond with 'AI connection successful'" }
        ],
        max_tokens: 10
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
        model: this.settings.modelName
      };
    } catch (error) {
      console.error('AI connection test failed:', error);
      return {
        success: false,
        error: error.message,
        model: this.settings?.modelName || 'unknown'
      };
    }
  }
}

// Export singleton instance
module.exports = new AIService();