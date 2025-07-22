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
  projectSummary: z.string().describe('Deskripsi singkat dan ringkasan umum dari proyek.'),
  requiredFeatures: z.array(z.string()).describe('Daftar fitur-fitur wajib yang harus ada di dalam proyek berdasarkan dokumen.'),
  estimatedRoles: z
    .array(z.object({ 
        role: z.string().describe('Jabatan atau peran yang dibutuhkan.'), 
        count: z.number().describe('Jumlah orang untuk peran tersebut.'),
        monthlySalary: z.number().describe('Estimasi gaji bulanan per orang untuk peran ini dalam IDR, berdasarkan data UMR atau standar industri.'),
    }))
    .describe('Estimasi peran, jumlah orang, dan gaji bulanan per peran.'),
  costDetails: z.object({
      technicalModal: z.number().describe('Estimasi biaya untuk modal teknis (tools, software, lisensi, dll).'),
      profitMargin: z.number().describe('Profit margin dalam bentuk persentase untuk proyek (misal: 20 untuk 20%).'),
  }),
  estimatedTimeline: z
    .array(z.object({
        month: z.number(),
        phase: z.string(),
        activity: z.string(),
    }))
    .describe('Estimasi linimasa proyek, dipecah per bulan, fase, dan aktivitas utama.'),
  suggestedTechnologies: z
    .array(z.string())
    .describe('Saran teknologi atau framework yang akan digunakan untuk proyek.'),
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
  prompt: `Anda adalah seorang manajer proyek dan analis bisnis ahli. Analisis dokumen persyaratan proyek berikut dan berikan data dalam format JSON yang terstruktur.

Dokumen: {{media url=documentDataUri}}

Tugas Anda:
1.  **Ringkasan Proyek**: Tulis deskripsi singkat dan ringkasan umum dari proyek ini.
2.  **Fitur Wajib**: Ekstrak dan buat daftar fitur-fitur utama yang wajib ada sesuai dokumen.
3.  **Estimasi Tim & Gaji**: Buat daftar peran yang dibutuhkan, jumlah orang per peran, dan estimasi gaji bulanan (dalam IDR) untuk setiap peran. Gunakan data gaji yang wajar untuk pasar Indonesia (misalnya, merujuk pada data UMR atau situs seperti Glassdoor). Contoh: [{role: "Frontend Developer", count: 2, monthlySalary: 8000000}].
4.  **Estimasi Biaya Awal**: Berikan estimasi awal untuk 'Modal Teknis' (meliputi biaya tools, software, server, domain, dll.). Set profit margin default ke 20%. Biaya manpower akan dihitung nanti.
5.  **Estimasi Linimasa**: Buat linimasa bulanan. Setiap baris berisi bulan (angka), fase, dan aktivitas utama. Tentukan durasi total proyek dari linimasa ini.
6.  **Saran Teknologi**: Sarankan tumpukan teknologi (tech stack) yang relevan.
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
