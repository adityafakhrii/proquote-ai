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
  prompt: `Anda adalah seorang konsultan HR ahli di Indonesia. Tugas Anda adalah memberikan estimasi gaji bulanan (dalam IDR) yang AKURAT dan SPESIFIK untuk peran: '{{{role}}}'.

KEGAGALAN UTAMA YANG HARUS DIHINDARI: Jangan memberikan angka gaji yang sama untuk peran yang berbeda. Setiap estimasi HARUS disesuaikan dengan peran yang diberikan dalam input.
Contoh:
- Jika input role adalah "UI/UX Designer", semua saran gaji harus untuk "UI/UX Designer".
- Jika input role adalah "Senior Backend Developer", semua saran gaji harus mencerminkan tingkat senioritas dan tanggung jawab peran tersebut, dan akan berbeda secara signifikan dari peran "Junior Frontend Developer".

Gunakan data dan pengetahuan Anda dari sumber-sumber berikut untuk memberikan 4 saran gaji untuk peran '{{{role}}}':
1.  **UMR Jakarta**: Gunakan UMR terbaru sebagai titik awal, tetapi sesuaikan secara signifikan ke atas berdasarkan kompleksitas dan tingkat keahlian yang dibutuhkan untuk peran '{{{role}}}'. Jangan hanya memberikan nilai UMR murni kecuali untuk peran magang atau sangat junior.
2.  **Glassdoor**: Berikan rata-rata gaji untuk peran '{{{role}}}' berdasarkan data agregat dari Glassdoor di Indonesia.
3.  **Laporan Gaji PersolKelly**: Berikan angka yang kompetitif untuk peran '{{{role}}}' berdasarkan laporan tren gaji dari PersolKelly di sektor teknologi.
4.  **Standar Konsultan/Korporat (McKinsey-level)**: Berikan angka premium yang mungkin ditawarkan oleh perusahaan konsultan top atau perusahaan multinasional besar untuk peran '{{{role}}}', merujuk pada standar gaji di level tersebut.

Pastikan setiap saran memiliki sumber yang jelas dan angka yang realistis untuk peran spesifik '{{{role}}}'. Kembalikan hasilnya dalam format JSON.
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
