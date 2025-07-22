'use server';

/**
 * @fileOverview AI flow to analyze project requirements and estimate roles, costs, and timeline.
 *
 * - analyzeProjectRequirements - Analyzes project requirements and provides estimates.
 * - AnalyzeProjectRequirementsInput - The input type for the analyzeProjectRequirements function.
 * - AnalyzeProjectRequirementsOutput - The return type for the analyzeProjectRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProjectRequirementsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A project requirements document (PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeProjectRequirementsInput = z.infer<typeof AnalyzeProjectRequirementsInputSchema>;

const AnalyzeProjectRequirementsOutputSchema = z.object({
  estimatedRoles: z
    .array(z.string())
    .describe('Estimated roles required for the project.'),
  estimatedLaborCosts: z.number().describe('Estimated labor costs for the project.'),
  estimatedTimeline: z.string().describe('Estimated timeline for the project as a Gantt chart.'),
  suggestedTechnologies: z
    .array(z.string())
    .describe('Suggested technologies or frameworks to use for the project.'),
});
export type AnalyzeProjectRequirementsOutput = z.infer<typeof AnalyzeProjectRequirementsOutputSchema>;

export async function analyzeProjectRequirements(
  input: AnalyzeProjectRequirementsInput
): Promise<AnalyzeProjectRequirementsOutput> {
  return analyzeProjectRequirementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProjectRequirementsPrompt',
  input: {schema: AnalyzeProjectRequirementsInputSchema},
  output: {schema: AnalyzeProjectRequirementsOutputSchema},
  prompt: `You are an expert project manager. Analyze the following project requirements document and provide estimates for required roles, labor costs, timeline and technology suggestions. Output the roles as a simple list, the labor costs as a single number, the timeline as a Gantt chart, and the technologies as a simple list.\n\nDocument: {{media url=documentDataUri}}\n\nRoles: \nLabor Costs: \nTimeline: \nTechnologies: `,
});

const analyzeProjectRequirementsFlow = ai.defineFlow(
  {
    name: 'analyzeProjectRequirementsFlow',
    inputSchema: AnalyzeProjectRequirementsInputSchema,
    outputSchema: AnalyzeProjectRequirementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
