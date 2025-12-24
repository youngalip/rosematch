import { GoogleGenAI, Type } from "@google/genai";
import { User, Purpose } from "../types";

// Always initialize a fresh client with process.env.API_KEY directly
const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateIcebreaker = async (
  targetUser: User, 
  myInterests: string[], 
  myPurpose: Purpose
): Promise<string> => {
  try {
    const ai = getAI();
    // Use gemini-3-flash-preview for simple text tasks
    const prompt = `
      Generate a single, short, engaging, and friendly icebreaker message (max 20 words) to send to ${targetUser.name}.
      
      Context:
      - Their Purpose: ${targetUser.purpose}
      - Their Interests: ${targetUser.interests.join(', ')}
      - Their Bio: "${targetUser.bio}"
      - My Purpose: ${myPurpose}
      - My Interests: ${myInterests.join(', ')}
      
      The message should be relevant to their profile and our shared purpose.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.replace(/"/g, '').trim() || "Hey! I think we have some great common interests. Would love to chat!";
  } catch (error) {
    console.error("AI Error:", error);
    return "Hey! Your profile caught my eye. How's it going?";
  }
};

export const checkCompatibility = async (
  user1: User,
  user2Profile: Partial<User>
): Promise<{ score: number; reason: string }> => {
  try {
    const ai = getAI();
    
    // Complex reasoning task -> gemini-3-pro-preview
    const prompt = `
      Analyze the detailed compatibility between two users for a "${user1.purpose}" connection.
      
      User A (Me):
      - Interests: ${user1.interests.join(', ')}
      - Bio: ${user1.bio}
      - Age: ${user1.age}
      - Job: ${user1.job || 'Not specified'}
      
      User B (Potential Match):
      - Interests: ${user2Profile.interests?.join(', ')}
      - Bio: ${user2Profile.bio}
      - Age: ${user2Profile.age}
      - Job: ${user2Profile.job || 'Not specified'}
      
      Think deeply about their potential dynamic. Are their interests complementary? Does their bio suggest compatible personalities?
      
      Return a JSON object with:
      - score: number (0-100)
      - reason: string (A concise, insightful sentence explaining the compatibility)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
            thinkingBudget: 32768, // max budget for gemini-3-pro-preview
        },
        responseMimeType: "application/json" 
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
        score: typeof json.score === 'number' ? json.score : 75,
        reason: json.reason || "AI analyzed your profiles and found good potential."
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { score: 70, reason: "You both seem to be looking for similar connections." };
  }
};

export const generateDateIdea = async (
  purpose: Purpose,
  location: string
): Promise<string> => {
  try {
    const ai = getAI();
    // Search Grounding task -> gemini-3-flash-preview
    const prompt = `
      Find a specific, real, and highly-rated venue or activity for a "${purpose}" date in or near ${location}. 
      It should be currently open or relevant. 
      Return ONLY the suggestion in this format: "How about [Activity Name] at [Venue Name]?"
      Keep it short.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Enable Google Search grounding
      }
    });

    return response.text?.trim() || `How about checking out a popular spot in ${location}?`;
  } catch (error) {
    console.error("AI Search Error:", error);
    return "Check out a local cafe or park.";
  }
}