import { GoogleGenAI } from "@google/genai";
import { HOPE_TOKEN_SOL, ZENITH_VAULT_SOL } from '../constants/contractCode';

const getClient = () => {
    let apiKey = '';
    
    // Try process.env (Node/Webpack/React Scripts)
    try {
        if (typeof process !== 'undefined' && process.env) {
            apiKey = process.env.API_KEY || '';
        }
    } catch (e) {
        // Ignore reference errors
    }

    // Try import.meta.env (Vite/Modern) if process failed
    if (!apiKey) {
        try {
            // @ts-ignore - import.meta might not be typed
            if (import.meta && import.meta.env) {
                // @ts-ignore
                apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || '';
            }
        } catch (e) {
             // Ignore
        }
    }

    if (!apiKey) {
        console.warn("API_KEY not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

export const analyzeContracts = async (userQuestion: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "Error: API Key missing. Cannot connect to Gemini.";

    const systemPrompt = `
    You are the Chief Protocol Architect for HopeFi/Zenith. 
    You are an expert in Solidity, ERC-4626, ERC-7540 Asynchronous Vaults, and DeFi Security.
    
    Context:
    The user is asking about the Zenith smart contracts.
    Zenith uses ERC-7540 (Request -> Fulfill -> Claim) to handle RWA settlement times (T+1).
    It also uses Virtual Shares to prevent inflation attacks.
    
    HopeToken.sol Source:
    ${HOPE_TOKEN_SOL}
    
    ZenithVault.sol Source:
    ${ZENITH_VAULT_SOL}
    
    Your goal is to explain the architecture, security features, or logic based on the user's question.
    Be technical but concise. Use markdown for code formatting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userQuestion,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        return response.text || "I could not analyze the contracts at this time.";
    } catch (error) {
        console.error("Gemini Analysis Failed", error);
        return "System Error: Unable to reach the AI Architect.";
    }
};