'use server';

/**
 * @fileOverview AI flow to suggest salaries for a specific role based on various data sources.
 *
 * - getSalarySuggestion - Suggests a salary for a given role.
 * - GetSalarySuggestionInput - The input type for the getSalarySuggestion function.
 * - GetSalarySuggestionOutput - The return type for the getSalarySuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSalarySuggestionInputSchema = z.object({
  role: z.string().describe('The job role to get a salary suggestion for, e.g., "Frontend Developer".'),
});
export type GetSalarySuggestionInput = z.infer<typeof GetSalarySuggestionInputSchema>;

const SalarySuggestionSchema = z.object({
    source: z.string().describe("The data source for the salary, e.g., 'UMR Jakarta'."),
    salary: z.number().describe('The suggested monthly salary in IDR.'),
});

const GetSalarySuggestionOutputSchema = z.object({
  suggestions: z.array(SalarySuggestionSchema).describe('A list of salary suggestions from different sources.'),
});
export type GetSalarySuggestionOutput = z.infer<typeof GetSalarySuggestionOutputSchema>;

export async function getSalarySuggestion(
  input: GetSalarySuggestionInput
): Promise<GetSalarySuggestionOutput> {
  return getSalarySuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSalarySuggestionPrompt',
  input: {schema: GetSalarySuggestionInputSchema},
  output: {schema: GetSalarySuggestionOutputSchema},
  prompt: `Anda adalah seorang konsultan HR ahli di Indonesia. Berikan estimasi gaji bulanan (dalam IDR) KHUSUS untuk peran: {{{role}}}.

Sangat penting: Setiap saran gaji harus disesuaikan secara spesifik dengan peran '{{{role}}}'. Jangan gunakan angka yang sama untuk peran yang berbeda. Misalnya, gaji untuk "Backend Developer" harus berbeda dengan "UI/UX Designer".

Gunakan data dan pengetahuan Anda dari sumber-sumber berikut untuk memberikan 4 saran gaji:
1.  **UMR Jakarta**: Gunakan UMR terbaru sebagai dasar untuk peran entry-level/junior. Sesuaikan jika peran '{{{role}}}' jelas bukan level junior.
2.  **Glassdoor**: Berikan rata-rata gaji untuk peran '{{{role}}}' ini berdasarkan data agregat dari Glassdoor di Indonesia.
3.  **Laporan Gaji PersolKelly**: Berikan angka yang kompetitif untuk peran '{{{role}}}' ini berdasarkan laporan tren gaji dari PersolKelly.
4.  **Laporan Gaji McKinsey**: Berikan angka premium yang mungkin ditawarkan oleh perusahaan konsultan top atau perusahaan multinasional besar untuk peran '{{{role}}}', merujuk pada standar gaji dari laporan atau praktik di McKinsey & Company.

Pastikan setiap saran memiliki sumber yang jelas dan angka yang realistis untuk peran '{{{role}}}'. Kembalikan hasilnya dalam format JSON.
`,
});

const getSalarySuggestionFlow = ai.defineFlow(
  {
    name: 'getSalarySuggestionFlow',
    inputSchema: GetSalarySuggestionInputSchema,
    outputSchema: GetSalarySuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
