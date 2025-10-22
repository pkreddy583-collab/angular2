import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { Incident } from '../models/incident.model';
import { ControlMJob, AiSuggestion } from '../models/controlm.model';
import { WebApp, AiInsight, SreInvestigation, LogEntry } from '../models/sre.model';
import { ExplainPlanNode } from '../models/dbre.model';
import { PostmortemReport, TimelineEvent, ActionItem } from '../models/postmortem.model';
import { FinOpsApp, SavingsOpportunity } from '../models/finops.model';
import { PredictionResult } from '../models/predictive.model';
import { AiRoiSummary } from '../models/ai-roi.model';
import { Problem } from '../models/problem.model';
import { ConfigurationItem } from '../models/configuration-item.model';
import { BusinessService } from '../models/business-user.model';
import { L1TriageResult } from '../models/l1-workbench.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.error(
        'API_KEY environment variable not set. AI features will be disabled.'
      );
    }
  }

  async generateIncidentGist(incident: Incident): Promise<string> {
    if (!this.ai) {
      return 'AI service is not initialized. Please check API key.';
    }

    const prompt = `Based on the following incident details, write a concise progress gist for a technical team handover. Focus on the latest update and next steps.
    
    Incident Title: "${incident.title}"
    Description: "${incident.description}"
    Last Update: "${incident.lastUpdate}"
    
    Gist:`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating incident gist:', error);
      return 'Error generating summary. Please try again.';
    }
  }

  async generateEodSummary(
    incidents: Incident[],
    incidentGists: { [id: string]: string }
  ): Promise<string> {
    if (!this.ai) {
      return 'AI service is not initialized. Please check API key.';
    }

    const incidentsSummary =
      incidents
        .map((inc) => {
          return `- Incident ${inc.id} (${inc.priority}): ${inc.title}
  - Status: ${incidentGists[inc.id] || inc.lastUpdate}`;
        })
        .join('\n') || 'No active incidents to report.';

    const prompt = `You are 'Strider AI', an AI assistant for IT operations at Humana. Act as a senior technical lead writing an end-of-day (EOD) handover summary for the offshore team. 
    
    Based on the following list of active incidents and their progress, create a clear, concise, and well-structured summary. 
    
    Start with a brief general overview, then list key updates for each high-priority incident. Use bullet points for readability.
    
    Active Incidents Data:
    ${incidentsSummary}
    
    EOD Summary:`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating EOD summary:', error);
      return 'Error generating summary. Please try again.';
    }
  }

  async generateRcaSummary(problem: Problem, incidents: Incident[]): Promise<string> {
    if (!this.ai) {
      return 'AI service is not initialized. Please check API key.';
    }

    const incidentDetails = incidents.map(inc => 
      `- ${inc.id}: ${inc.title}\n  Description: ${inc.description}\n  Last Update: ${inc.lastUpdate}`
    ).join('\n\n');

    const prompt = `You are a Senior SRE performing a Root Cause Analysis (RCA).

    Problem Title: "${problem.title}"
    
    Linked Incidents:
    ${incidentDetails}
    
    Investigation Notes:
    ${problem.investigationNotes?.map(n => `- ${n.timestamp.toISOString()}: ${n.note}`).join('\n') || 'No notes available.'}

    Based on all the information above, write a concise but thorough Root Cause Analysis summary. Conclude with a clear statement of the root cause.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating RCA summary:', error);
      return 'Error generating summary. Please try again.';
    }
  }

  async generateCiImpactAnalysis(ci: ConfigurationItem, relatedCis: {item: ConfigurationItem, type: string}[]): Promise<string> {
    if (!this.ai) {
      return 'AI service is not initialized.';
    }

    const dependencies = relatedCis.filter(r => r.type === 'Depends on').map(r => `- ${r.item.name} (${r.item.type})`).join('\n');
    const dependents = relatedCis.filter(r => r.type === 'Used by').map(r => `- ${r.item.name} (${r.item.type})`).join('\n');

    const prompt = `You are an expert Site Reliability Engineer (SRE) performing an impact analysis.
    
    A critical alert has been received for the following Configuration Item (CI):
    - Name: ${ci.name}
    - Type: ${ci.type}
    - Environment: ${ci.environment}
    
    This CI has the following relationships:
    
    Downstream Dependencies (what it depends on):
    ${dependencies || '- None'}
    
    Upstream Dependents (what depends on it):
    ${dependents || '- None'}
    
    Assuming the primary CI "${ci.name}" is completely offline, write a concise impact analysis. Identify the "blast radius" by listing which other applications or business processes would be directly impacted.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating CI impact analysis:', error);
      return 'Error generating analysis. Please try again.';
    }
  }

  async getAiConciergeResponse(query: string, userServices: BusinessService[]): Promise<string> {
    if (!this.ai) {
      return 'AI service is not initialized. Please check API key.';
    }

    const servicesContext = userServices.map(s => 
      `- ${s.name}: Status is ${s.status}. ${s.businessImpact ? 'Current issue: ' + s.businessImpact : 'No known issues.'}`
    ).join('\n');

    const prompt = `You are "Strider AI," a friendly and helpful IT Concierge for business users at Humana. Your goal is to provide clear, simple, non-technical, and empathetic answers. Do not use technical jargon like "P1", "SLA", "MTTR", "backend", or "API".

    Here is the current status of the services this user cares about:
    ${servicesContext}

    The user has asked the following question:
    "${query}"

    Based on the service status and the user's question, provide a concise and helpful response. If you don't have enough information, politely say so and suggest they report an issue.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating AI concierge response:', error);
      return 'I am currently unable to process your request. Please try again in a moment.';
    }
  }

  async getL1Triage(problemDescription: string): Promise<L1TriageResult> {
    if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }
  
    const prompt = `You are Strider AI, an expert SRE co-pilot assisting a Level 1 support agent. The agent has provided a user's problem description. Your task is to analyze it and provide a structured plan for the L1 agent.
  
    Problem Description: "${problemDescription}"
  
    Based on this description, perform the following:
    1.  **Summarize:** Write a one-sentence technical summary of the likely issue.
    2.  **Suggest Actions:** Provide a list of 3-5 simple, concrete, step-by-step actions an L1 agent can perform to diagnose or resolve the issue. These should be things like checking user accounts, asking the user to perform an action, or checking a system's status.
    3.  **Find Knowledge:** Suggest 1-2 potentially relevant knowledge base articles or past incident titles. Use placeholders like "KB00123: Resetting User Passwords".
    4.  **Escalate if Necessary:** If the issue sounds complex (e.g., requires code changes, database access, or involves a major outage), specify the appropriate L2/L3 team to escalate to. Otherwise, this should be null.
    5.  **Identify Need for Change:** Determine if a formal change request is likely required to resolve this (e.g., deploying a patch, restarting a production service).
    6.  **Draft Change Details:** If a change is required, draft a preliminary title, description, and risk assessment for the change request.
  
    Return the result as a JSON object.`;
  
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    done: { type: Type.BOOLEAN, description: "Default to false" },
                  },
                },
              },
              relevantKnowledge: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                  },
                },
              },
              escalationPath: { type: Type.STRING, nullable: true },
              requiresChange: { type: Type.BOOLEAN },
              changeRequestDetails: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  risk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                }
              }
            },
          },
        },
      });
  
      const json = JSON.parse(response.text);
      return json as L1TriageResult;
    } catch (error) {
      console.error('Error generating L1 triage:', error);
      throw new Error('Failed to get AI analysis. Please try again.');
    }
  }

  async getControlmSuggestions(job: ControlMJob): Promise<AiSuggestion[]> {
    if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }

    const logSnippet = job.logOutput.substring(0, 1000); // Send a snippet to manage token count

    const prompt = `You are an expert L2 Oracle support engineer specializing in Control-M job failures. Analyze the following failed job data and provide a list of concrete, actionable suggestions for resolution. For each suggestion, provide a short title, a one-sentence description, and an actionType.

    Job Name: "${job.name}"
    Application: "${job.application}"
    Error Message: "${job.errorMessage}"
    Job Log Snippet:
    ---
    ${logSnippet}
    ---
    
    Provide a JSON response.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actionType: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const json = JSON.parse(response.text);
      return json.suggestions as AiSuggestion[];
    } catch (error) {
      console.error('Error generating Control-M suggestions:', error);
      // Return a user-friendly error suggestion
      return [
        {
          title: 'AI Analysis Failed',
          description: 'Could not generate suggestions. Please check the connection or try again later.',
          actionType: 'info'
        }
      ];
    }
  }

  async getInitialSreInvestigation(investigation: SreInvestigation, app: WebApp): Promise<string> {
    if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }
    const prompt = `You are Strider AI, an SRE expert. An investigation has been opened for the '${app.name}' application. 
    
    Investigation: "${investigation.title}"
    
    Based on the following app metrics, provide a concise, one-paragraph triage summary explaining the likely issue.
    - Health: ${app.healthStatus}
    - Apdex: ${app.apdex}
    - Error Rate: ${app.errorRate}%
    - P95 Latency: ${app.p95Latency}ms
    - CPU: ${app.cpuUtilization}%
    - Memory: ${app.memUtilization}%
    
    Triage Summary:`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error generating SRE investigation summary:', error);
        return 'Failed to generate AI triage summary.';
    }
  }

  async analyzeSreLogs(logs: LogEntry[], investigationTitle: string): Promise<string> {
     if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }

    // To manage token size, we'll summarize the logs first.
    const errorLogs = logs.filter(l => l.level === 'ERROR' || l.level === 'WARN').slice(-20); // Get last 20 errors/warnings
    const logSummary = errorLogs.map(l => `${l.timestamp.toISOString()} [${l.level}] ${l.message}`).join('\n');

    const prompt = `You are Strider AI, an SRE log analysis expert. I am investigating an issue titled "${investigationTitle}". 
    
    Analyze the following snippet of recent application logs. Identify the most likely root cause or the most frequent critical error messages. Provide a 2-3 sentence summary of your findings.
    
    Log Snippet:
    ---
    ${logSummary}
    ---
    
    Analysis:`;

     try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error analyzing SRE logs:', error);
        return 'Failed to analyze logs due to an AI service error.';
    }
  }

  // --- DBRE Workbench Methods ---
  async explainDbPlan(plan: ExplainPlanNode[]): Promise<string> {
    if (!this.ai) throw new Error('AI service not initialized');
    const planText = JSON.stringify(plan, null, 2);
    const prompt = `You are a senior Database Reliability Engineer (DBRE). Analyze the following SQL query execution plan and explain in plain English why it might be slow, focusing on the most expensive operations.
    
    Execution Plan:
    ${planText}
    
    Explanation:`;
    const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text.trim();
  }

  async optimizeSqlQuery(query: string, plan: ExplainPlanNode[]): Promise<string> {
    if (!this.ai) throw new Error('AI service not initialized');
    const planText = JSON.stringify(plan, null, 2);
    const prompt = `You are a senior Database Reliability Engineer (DBRE). Analyze the following SQL query and its execution plan. Suggest an optimized version of the query OR a new index to create that would improve performance. Provide only the SQL code for the new query or the CREATE INDEX statement.
    
    Original Query:
    ${query}

    Execution Plan:
    ${planText}
    
    Recommendation:`;
    const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text.trim();
  }

  // --- Postmortem Workbench Methods ---
  async generatePostmortemTimeline(incidentTitle: string): Promise<TimelineEvent[]> {
    if (!this.ai) throw new Error('AI service not initialized');
    const prompt = `Generate a realistic mock timeline of events for a postmortem of the incident: "${incidentTitle}". Include detection, diagnosis, mitigation, and resolution steps.`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    timeline: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING, description: 'ISO 8601 format' },
                                description: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });

    const json = JSON.parse(response.text);
    return json.timeline as TimelineEvent[];
  }

  async suggestRca(timeline: TimelineEvent[]): Promise<string> {
    if (!this.ai) throw new Error('AI service not initialized');
    const prompt = `Based on the following incident timeline, suggest a concise root cause analysis (RCA).
    
    Timeline:
    ${JSON.stringify(timeline, null, 2)}
    
    Root Cause Analysis:`;
    const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text.trim();
  }
  
  async suggestActionItems(rca: string): Promise<ActionItem[]> {
    if (!this.ai) throw new Error('AI service not initialized');
    const prompt = `Based on the root cause "${rca}", suggest 3 concrete action items to prevent recurrence.`;
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    actionItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                owner: { type: Type.STRING, description: 'e.g., SRE Team' },
                                status: { type: Type.STRING, description: 'e.g., Not Started' }
                            }
                        }
                    }
                }
            }
        }
    });
    const json = JSON.parse(response.text);
    return json.actionItems as ActionItem[];
  }
  
  // --- FinOps Workbench Methods ---
  async findCloudSavings(app: FinOpsApp): Promise<SavingsOpportunity[]> {
    if (!this.ai) throw new Error('AI service not initialized');
    const prompt = `You are a FinOps expert. Analyze the cloud resource data for the application "${app.name}" and identify specific, actionable savings opportunities.
    
    Data:
    - Total Monthly Cost: $${app.totalCost}
    - Compute Cost: $${app.costBreakdown.compute} (Avg CPU: ${app.metrics.avgCpu}%, Provisioned vCPU: ${app.metrics.provisionedVcpu})
    - Storage Cost: $${app.costBreakdown.storage} (Unattached Disks: ${app.metrics.unattachedDisks})
    
    Identify opportunities like rightsizing instances or deleting unused resources.`;
    
     const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    savings: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: 'e.g., Rightsizing, Unused Resources' },
                                description: { type: Type.STRING },
                                estimatedMonthlySavings: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        }
    });
    const json = JSON.parse(response.text);
    return json.savings as SavingsOpportunity[];
  }

  // --- Predictive Insights Methods ---
  async generatePrediction(modelName: string, input: string): Promise<PredictionResult> {
    if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }

    const prompt = `You are Strider AI, an expert SRE and data scientist. Generate a prediction for the model "${modelName}" with the input parameter "${input}". 
    
    Consider historical trends, system complexity, recent incidents, and potential upcoming events (like code freezes or marketing campaigns). 
    
    Provide a detailed prediction, a confidence level, a list of key factors considered in your analysis, and 2-3 concrete, proactive recommendations.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prediction: { type: Type.STRING },
              confidence: { type: Type.STRING },
              keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['prediction', 'confidence', 'keyFactors', 'recommendations'],
          },
        },
      });

      const json = JSON.parse(response.text);
      // Ensure confidence is one of the allowed literal types
      const confidence = json.confidence;
      if (confidence !== 'High' && confidence !== 'Medium' && confidence !== 'Low') {
        json.confidence = 'Medium';
      }
      return json as PredictionResult;
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw new Error('Failed to generate prediction from AI service.');
    }
  }

  // --- AI ROI Summary ---
  async getAiRoiSummary(): Promise<AiRoiSummary> {
    if (!this.ai) {
      throw new Error('AI service is not initialized.');
    }
    // In a real app, this would be an API call to a backend that runs the aggregation query.
    // For now, we simulate the result of that query.
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    return {
      totalTimeSavedHours: 12.5,
      incidentsAnalyzed: 42,
      helpfulnessRating: 92.8
    };
  }
}