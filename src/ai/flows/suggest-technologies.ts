'use server';

/**
 * @fileOverview AI-powered technology suggestion flow based on project requirements.
 *
 * - suggestTechnologies - A function that suggests relevant technologies and frameworks.
 * - SuggestTechnologiesInput - The input type for the suggestTechnologies function.
 * - SuggestTechnologiesOutput - The return type for the suggestTechnologies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTechnologiesInputSchema = z.object({
  projectRequirements: z
    .string()
    .describe('The project requirements document content.'),
});
export type SuggestTechnologiesInput = z.infer<typeof SuggestTechnologiesInputSchema>;

const SuggestTechnologiesOutputSchema = z.object({
  suggestedTechnologies: z
    .array(z.string())
    .describe('List of suggested technologies and frameworks.'),
  reasoning: z.string().describe('Explanation for each suggested technology.'),
});
export type SuggestTechnologiesOutput = z.infer<typeof SuggestTechnologiesOutputSchema>;

export async function suggestTechnologies(
  input: SuggestTechnologiesInput
): Promise<SuggestTechnologiesOutput> {
  return suggestTechnologiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTechnologiesPrompt',
  input: {schema: SuggestTechnologiesInputSchema},
  output: {schema: SuggestTechnologiesOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting relevant technologies and frameworks for software development projects.

  Based on the project requirements below, suggest a list of technologies and frameworks that would be suitable for the project.
  Explain why each technology is suitable for the project.

  Project Requirements: {{{projectRequirements}}}

  Return the suggested technologies and reasoning in JSON format.
  `,
});

const suggestTechnologiesFlow = ai.defineFlow(
  {
    name: 'suggestTechnologiesFlow',
    inputSchema: SuggestTechnologiesInputSchema,
    outputSchema: SuggestTechnologiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
