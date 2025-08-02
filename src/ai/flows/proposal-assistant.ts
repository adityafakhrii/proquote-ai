'use server';

/**
 * @fileOverview An AI agent that assists in editing a project proposal.
 *
 * This file defines a set of tools that the AI can use to programmatically
 * modify the proposal data, and an agent-like flow that uses these tools
 * based on natural language commands from the user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getSalarySuggestion } from './get-salary-suggestion';

// Schemas for the current state of the proposal, which will be the context for the agent.
const RoleSchema = z.object({
  role: z.string(),
  count: z.number(),
  monthlySalary: z.number(),
  salarySource: z.string(),
});

const TimelineItemSchema = z.object({
  month: z.number(),
  phase: z.string(),
  activity: z.string(),
});

const CostDetailsSchema = z.object({
  technicalModal: z.number(),
  profitMargin: z.number(),
});

const CurrentProposalStateSchema = z.object({
  estimatedRoles: z.array(RoleSchema),
  estimatedTimeline: z.array(TimelineItemSchema),
  costDetails: CostDetailsSchema,
  suggestedTechnologies: z.array(z.string()),
});
export type CurrentProposalState = z.infer<typeof CurrentProposalStateSchema>;


// Tool to add or update a team member
const addOrUpdateTeamMember = ai.defineTool(
  {
    name: 'addOrUpdateTeamMember',
    description: 'Add a new role to the team or update the count of an existing role. Use this to add or remove personnel. When adding a new role, you must find a reasonable salary estimate.',
    inputSchema: z.object({
      role: z.string().describe('The job title, e.g., "Frontend Developer"'),
      count: z.number().describe('The number of people for this role. To remove a role, set this to 0.'),
    }),
    outputSchema: z.object({
        role: z.string(),
        count: z.number(),
        monthlySalary: z.number(),
        salarySource: z.string(),
    }),
  },
  async ({role, count}) => {
    let monthlySalary = 0;
    let salarySource = "Manual";

    if (count > 0) {
        try {
            const salaryInfo = await getSalarySuggestion({ role });
            if (salaryInfo.suggestions && salaryInfo.suggestions.length > 0) {
                // Take the second suggestion (e.g., Glassdoor) for a reasonable average
                const suggestion = salaryInfo.suggestions[1] || salaryInfo.suggestions[0];
                monthlySalary = suggestion.salary;
                salarySource = suggestion.source;
            }
        } catch (e) {
            // Could not get salary, will default to 0
            salarySource = "Estimasi AI Gagal";
        }
    }
    
    return { role, count, monthlySalary, salarySource };
  }
);

// Tool to update cost details
const updateCosts = ai.defineTool(
    {
        name: 'updateCosts',
        description: 'Update the cost details of the project, such as profit margin or technical modal.',
        inputSchema: z.object({
            profitMargin: z.number().optional().describe('The new profit margin as a percentage (e.g., 25 for 25%).'),
            technicalModal: z.number().optional().describe('The new technical modal cost in IDR.'),
        }),
        outputSchema: z.object({
            profitMargin: z.number().optional(),
            technicalModal: z.number().optional(),
        }),
    },
    async (input) => {
        return {
            profitMargin: input.profitMargin,
            technicalModal: input.technicalModal
        };
    }
);

// Tool to update the project timeline
const updateTimeline = ai.defineTool(
    {
        name: 'updateTimeline',
        description: 'Modify the project timeline by adding or removing months/activities. You cannot update existing items, only add or remove entire months.',
        inputSchema: z.object({
            action: z.enum(['ADD', 'REMOVE']).describe('The action to perform.'),
            durationInMonths: z.number().optional().describe('For ADD action, the number of months to add.'),
            monthToRemove: z.number().optional().describe('For REMOVE action, the month number to remove.'),
            activity: z.string().optional().describe('The activity description for the new month(s). Required for ADD.'),
            phase: z.string().optional().describe('The phase name for the new month(s). Required for ADD.'),
        }),
        outputSchema: z.any(), // Will return new items or index to remove
    },
    async (input) => {
       return input; // Pass the raw input to the reducer
    }
);

// Tool to update the tech stack
const updateTechStack = ai.defineTool(
    {
        name: 'updateTechStack',
        description: 'Modify the suggested technologies for the project by adding or removing one.',
        inputSchema: z.object({
            action: z.enum(['ADD', 'REMOVE']).describe('The action to perform.'),
            technology: z.string().describe('The technology to add or remove.'),
        }),
        outputSchema: z.object({
            action: z.enum(['ADD', 'REMOVE']),
            technology: z.string(),
        }),
    },
    async ({ action, technology }) => {
        return { action, technology };
    }
);


// The main flow for the proposal assistant agent
const ProposalAssistantInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
  currentState: CurrentProposalStateSchema.describe('The current state of the proposal data.'),
});
export type ProposalAssistantInput = z.infer<typeof ProposalAssistantInputSchema>;

const ProposalAssistantOutputSchema = z.object({
    response: z.string().describe('A confirmation message to the user about the action taken.'),
    updatedState: CurrentProposalStateSchema.describe('The new state of the proposal after modifications.')
});
export type ProposalAssistantOutput = z.infer<typeof ProposalAssistantOutputSchema>;

const assistantPrompt = ai.definePrompt({
    name: 'proposalAssistantPrompt',
    system: `You are a helpful assistant for editing a project proposal.
    Your task is to understand the user's command and use the available tools to modify the proposal data.
    The user will provide you with the current state of the proposal.
    After using a tool, formulate a friendly confirmation message to the user based on the tool's output.
    If the user's command is unclear or cannot be fulfilled with the available tools, ask for clarification.
    Always provide a direct response based on the tool's action. Example: if a user says "add 2 designers", and the tool is called, your final response should be "Successfully added 2 UI/UX Designers." or similar.
    Do not respond with "I have used the tool...". Just give the confirmation.`,
    tools: [addOrUpdateTeamMember, updateCosts, updateTimeline, updateTechStack],
});

export const proposalAssistantFlow = ai.defineFlow(
    {
        name: 'proposalAssistantFlow',
        inputSchema: ProposalAssistantInputSchema,
        outputSchema: ProposalAssistantOutputSchema
    },
    async (input) => {
        let updatedState = JSON.parse(JSON.stringify(input.currentState));
        let responseMessage = "I wasn't able to make a change. Can you try rephrasing?";

        const {output} = await assistantPrompt(input);

        if (!output.toolCalls || output.toolCalls.length === 0) {
            return {
                response: output.text || responseMessage,
                updatedState: updatedState,
            };
        }

        let finalConfirmation = '';

        for (const toolCall of output.toolCalls) {
            const toolResponse = await ai.runTool(toolCall);
            const toolName = toolCall.tool;
            const toolOutput = toolResponse.output;

            if (toolName === 'addOrUpdateTeamMember') {
                const { role, count, monthlySalary, salarySource } = toolOutput;
                const existingRoleIndex = updatedState.estimatedRoles.findIndex(r => r.role.toLowerCase() === role.toLowerCase());

                if (existingRoleIndex !== -1) {
                    if (count === 0) {
                        updatedState.estimatedRoles.splice(existingRoleIndex, 1);
                        finalConfirmation += `Successfully removed the role: ${role}. `;
                    } else {
                        updatedState.estimatedRoles[existingRoleIndex].count = count;
                        finalConfirmation += `Successfully updated role: ${count}x ${role}. `;
                    }
                } else {
                    if (count > 0) {
                        updatedState.estimatedRoles.push({ role, count, monthlySalary, salarySource });
                        finalConfirmation += `Successfully added role: ${count}x ${role}. `;
                    }
                }
            } else if (toolName === 'updateCosts') {
                let updates: string[] = [];
                if (toolOutput.profitMargin !== undefined) {
                    updatedState.costDetails.profitMargin = toolOutput.profitMargin;
                    updates.push(`profit margin to ${toolOutput.profitMargin}%`);
                }
                if (toolOutput.technicalModal !== undefined) {
                    updatedState.costDetails.technicalModal = toolOutput.technicalModal;
                    updates.push(`technical modal to IDR ${toolOutput.technicalModal.toLocaleString()}`);
                }
                finalConfirmation += `Successfully updated ${updates.join(' and ')}. `;
            } else if (toolName === 'updateTimeline') {
                 if (toolOutput.action === 'ADD') {
                    const lastMonth = updatedState.estimatedTimeline.length > 0 ? Math.max(...updatedState.estimatedTimeline.map(t => t.month)) : 0;
                    for (let i = 1; i <= toolOutput.durationInMonths; i++) {
                        updatedState.estimatedTimeline.push({
                            month: lastMonth + i,
                            phase: toolOutput.phase || 'New Phase',
                            activity: toolOutput.activity || 'New Activity',
                        });
                    }
                    finalConfirmation += `Successfully added ${toolOutput.durationInMonths} month(s) to the timeline. `;
                } else if (toolOutput.action === 'REMOVE') {
                    updatedState.estimatedTimeline = updatedState.estimatedTimeline.filter(item => item.month !== toolOutput.monthToRemove);
                    // Re-index months
                    updatedState.estimatedTimeline = updatedState.estimatedTimeline.sort((a,b) => a.month - b.month).map((item, index) => ({...item, month: index + 1}));
                    finalConfirmation += `Successfully removed month ${toolOutput.monthToRemove}. `;
                }
            } else if (toolName === 'updateTechStack') {
                 if (toolOutput.action === 'ADD') {
                    updatedState.suggestedTechnologies.push(toolOutput.technology);
                 } else {
                    updatedState.suggestedTechnologies = updatedState.suggestedTechnologies.filter(t => t.toLowerCase() !== toolOutput.technology.toLowerCase());
                 }
                 finalConfirmation += `Successfully ${toolOutput.action === 'ADD' ? 'added' : 'removed'} ${toolOutput.technology}. `;
            }
        }
        
        const finalResponse = await assistantPrompt({
            ...input,
            context: output.toolCalls.map(tc => ({toolCall: tc, toolResponse: {output: "Action was successful"}})),
        });

        return {
            response: finalResponse.output?.text || finalConfirmation.trim(),
            updatedState: updatedState,
        };
    }
);

// Exported wrapper function
export async function runProposalAssistant(
  input: ProposalAssistantInput
): Promise<ProposalAssistantOutput> {
  return proposalAssistantFlow(input);
}
