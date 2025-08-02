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
    description: 'Add a new role to the team or update the count of an existing role. Use this to add or remove personnel.',
    inputSchema: z.object({
      role: z.string().describe('The job title, e.g., "Frontend Developer"'),
      count: z.number().describe('The number of people for this role. To remove a role, set this to 0.'),
    }),
    outputSchema: z.string(),
  },
  async ({role, count}) => {
    // In a real scenario, this would interact with the state management.
    // For now, we just return a confirmation message.
    if (count === 0) {
        return `Successfully removed the role: ${role}.`;
    }
    return `Successfully added/updated role: ${count}x ${role}.`;
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
        outputSchema: z.string(),
    },
    async (input) => {
        let updates = [];
        if(input.profitMargin !== undefined) updates.push(`profit margin to ${input.profitMargin}%`);
        if(input.technicalModal !== undefined) updates.push(`technical modal to IDR ${input.technicalModal.toLocaleString()}`);
        return `Successfully updated ${updates.join(' and ')}.`;
    }
);

// Tool to update the project timeline
const updateTimeline = ai.defineTool(
    {
        name: 'updateTimeline',
        description: 'Modify the project timeline by adding, removing, or changing phases and activities.',
        inputSchema: z.object({
            action: z.enum(['ADD', 'REMOVE', 'UPDATE']).describe('The action to perform.'),
            month: z.number().describe('The month number to modify.'),
            phase: z.string().optional().describe('The new phase name. Required for ADD/UPDATE.'),
            activity: z.string().optional().describe('The new activity description. Required for ADD/UPDATE.'),
        }),
        outputSchema: z.string(),
    },
    async ({ action, month, phase, activity }) => {
        return `Successfully performed ${action} for month ${month}.`;
    }
);

// Tool to update the tech stack
const updateTechStack = ai.defineTool(
    {
        name: 'updateTechStack',
        description: 'Modify the suggested technologies for the project.',
        inputSchema: z.object({
            action: z.enum(['ADD', 'REMOVE']).describe('The action to perform.'),
            technology: z.string().describe('The technology to add or remove.'),
        }),
        outputSchema: z.string(),
    },
    async ({ action, technology }) => {
        return `Successfully ${action === 'ADD' ? 'added' : 'removed'} ${technology} from the tech stack.`;
    }
);


// The main flow for the proposal assistant agent
const ProposalAssistantInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
  currentState: CurrentProposalStateSchema.describe('The current state of the proposal data.'),
});
export type ProposalAssistantInput = z.infer<typeof ProposalAssistantInputSchema>;

// The agent's output can be the updated state and a confirmation message.
// For this example, we'll just return the confirmation message.
const ProposalAssistantOutputSchema = z.object({
    response: z.string().describe('A confirmation message to the user about the action taken.'),
    updatedState: CurrentProposalStateSchema.describe('The new state of the proposal after modifications.')
});
export type ProposalAssistantOutput = z.infer<typeof ProposalAssistantOutputSchema>;

const assistantPrompt = ai.definePrompt({
    name: 'proposalAssistantPrompt',
    input: { schema: ProposalAssistantInputSchema },
    output: { schema: z.object({ response: z.string() }) },
    system: `You are a helpful assistant for editing a project proposal.
    Your task is to understand the user's command and use the available tools to modify the proposal data.
    The user will provide you with the current state of the proposal.
    After using a tool, formulate a friendly confirmation message to the user based on the tool's output.
    If the user's command is unclear or cannot be fulfilled with the available tools, ask for clarification.`,
    tools: [addOrUpdateTeamMember, updateCosts, updateTimeline, updateTechStack],
});

export const proposalAssistantFlow = ai.defineFlow(
    {
        name: 'proposalAssistantFlow',
        inputSchema: ProposalAssistantInputSchema,
        outputSchema: ProposalAssistantOutputSchema
    },
    async (input) => {
        const { output: toolCalls } = await assistantPrompt(input);

        // In a real implementation, you would process the tool calls and apply them
        // to the `input.currentState` to generate an `updatedState`.
        // For this example, we will just simulate this.
        let updatedState = { ...input.currentState }; //
        let responseMessage = "I wasn't able to make a change. Can you try rephrasing?";

        if (toolCalls) {
            // This is a simplified simulation. A real implementation would handle
            // multiple tool calls and more complex state updates.
            responseMessage = toolCalls.response;
        }

        return {
            response: responseMessage,
            updatedState: updatedState, // Return the (mock) updated state
        };
    }
);

// Exported wrapper function
export async function runProposalAssistant(
  input: ProposalAssistantInput
): Promise<ProposalAssistantOutput> {
  return proposalAssistantFlow(input);
}
