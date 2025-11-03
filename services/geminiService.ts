import { GoogleGenAI, Type } from '@google/genai';
import { ReportData } from '../types';

// Helper to convert File to a Gemini Part
async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix "data:...;base64,", which we need to remove.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSSTBill = async (files: File[]): Promise<ReportData> => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set.');
  }

  // The prompt needs to be very specific about the task and the desired JSON output.
  const prompt = `
    You are an expert AI agent specializing in medical bill auditing for SST (Sales and Service Tax) compliance.
    Your task is to analyze the provided documents (medical bills, referral letters, supporting documents) and identify any discrepancies, inconsistencies, or potential for cost savings based on a simulated set of billing rules.

    Analyze the documents and provide a detailed scrutiny report in JSON format. The report should include:
    1.  A concise 'summary' of your findings.
    2.  A 'totalSavings' number representing the total potential monetary savings from your recommendations. If none, return 0.
    3.  A list of 'discrepancies', where each item includes:
        - 'lineItem': The specific service, drug, or charge in question.
        - 'issue': A clear description of the problem found.
        - 'recommendation': An actionable suggestion to correct the issue.
        - 'severity': The urgency or importance of the issue, categorized as 'High', 'Medium', or 'Low'.

    If no files are provided, or the files are not relevant medical bills, return a report with an appropriate summary and empty discrepancies.
    Ensure your output is a valid JSON object matching the provided schema. Do not include markdown backticks or the word "json" in your response.
  `;

  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const contents = {
    parts: [{ text: prompt }, ...fileParts],
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      totalSavings: { type: Type.NUMBER },
      discrepancies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            lineItem: { type: Type.STRING },
            issue: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            severity: { type: Type.STRING },
          },
          required: ['lineItem', 'issue', 'recommendation', 'severity'],
        },
      },
    },
    required: ['summary', 'totalSavings', 'discrepancies'],
  };

  try {
    // FIX: Use gemini-2.5-pro for complex tasks as per guidelines.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        }
    });
    
    // FIX: Get text from response.text property directly.
    const jsonText = response.text.trim();
    const reportData: ReportData = JSON.parse(jsonText);
    return reportData;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze documents with Gemini API.');
  }
};
