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
    .array(z.object({ role: z.string(), count: z.number() }))
    .describe('Estimated roles and number of people for the project.'),
  costDetails: z.object({
      technicalModal: z.number().describe('Estimated costs for technical capital/tools.'),
      manpower: z.number().describe('Estimated costs for manpower.'),
      development: z.number().describe('Estimated costs for development.'),
      profitMargin: z.number().describe('Profit margin for the project.'),
  }),
  estimatedTimeline: z
    .array(z.object({
        month: z.number(),
        phase: z.string(),
        activity: z.string(),
    }))
    .describe('Estimated timeline for the project, broken down by month, phase, and main activity.'),
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
  prompt: `Anda adalah seorang manajer proyek ahli. Analisis dokumen persyaratan proyek berikut dan berikan estimasi untuk:
1.  **Peran Tim & Jumlah Orang**: Buat daftar peran yang dibutuhkan dan jumlah orang untuk setiap peran. Contoh: [{role: "Project Manager", count: 1}, {role: "Developer", count: 2}].
2.  **Rincian Biaya (IDR)**: Rincikan biaya menjadi modal teknis (untuk tools/software), tenaga kerja (manpower), dan pengembangan (infrastruktur/dll.). Tambahkan juga margin keuntungan yang wajar.
3.  **Linimasa Proyek**: Buat tabel linimasa bulanan. Setiap baris harus berisi bulan (sebagai angka), fase (misalnya, "Perencanaan"), dan aktivitas utama. Contoh: [{month: 1, phase: "Discovery", activity: "Analisis Kebutuhan"}, {month: 2, phase: "Development", activity: "Pengembangan Fitur A"}].
4.  **Saran Teknologi**: Buat daftar teknologi atau kerangka kerja yang disarankan.

Dokumen: {{media url=documentDataUri}}
`,
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
