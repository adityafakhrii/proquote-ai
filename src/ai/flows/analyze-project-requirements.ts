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
    .optional()
    .describe(
      "A project requirements document (PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  projectDescription: z
    .string()
    .optional()
    .describe('A text description of the project requirements.'),
  clientProfile: z.string().describe("Profil singkat klien, misal: 'Startup kecil', 'Perusahaan multinasional', 'Lembaga pemerintah'. Ini akan mempengaruhi estimasi biaya dan durasi."),
});
export type AnalyzeProjectRequirementsInput = z.infer<typeof AnalyzeProjectRequirementsInputSchema>;

const AnalyzeProjectRequirementsOutputSchema = z.object({
  isProjectRequirementDocument: z.boolean().describe('Benar jika input ini adalah deskripsi atau dokumen persyaratan proyek, salah jika bukan.'),
  projectSummary: z.string().optional().describe('Deskripsi singkat dan ringkasan umum dari proyek.'),
  requiredFeatures: z.array(z.string()).optional().describe('Daftar fitur-fitur wajib yang harus ada di dalam proyek berdasarkan input.'),
  estimatedRoles: z
    .array(z.object({ 
        role: z.string().describe('Jabatan atau peran yang dibutuhkan.'), 
        count: z.number().describe('Jumlah orang untuk peran tersebut.'),
        monthlySalary: z.number().describe('Estimasi gaji bulanan per orang untuk peran ini dalam IDR, berdasarkan data UMR atau standar industri.'),
        salarySource: z.string().describe('Sumber data gaji, setel ke "Estimasi AI".'),
    }))
    .optional()
    .describe('Estimasi peran, jumlah orang, dan gaji bulanan per peran.'),
  costDetails: z.object({
      technicalModal: z.number().describe('Estimasi biaya untuk modal teknis (tools, software, lisensi, dll).'),
      profitMargin: z.number().describe('Profit margin dalam bentuk persentase untuk proyek (misal: 20 untuk 20%).'),
  }).optional(),
  estimatedTimeline: z
    .array(z.object({
        month: z.number(),
        phase: z.string(),
        activity: z.string(),
    }))
    .optional()
    .describe('Estimasi linimasa proyek, dipecah per bulan, fase, dan aktivitas utama.'),
  suggestedTechnologies: z
    .array(z.string())
    .optional()
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
  prompt: `Anda adalah seorang manajer proyek dan analis bisnis ahli di Indonesia. Analisis persyaratan proyek berikut dan berikan data dalam format JSON yang terstruktur.

Profil Klien: {{{clientProfile}}}

{{#if documentDataUri}}
Dokumen: {{media url=documentDataUri}}
{{/if}}

{{#if projectDescription}}
Deskripsi Proyek:
{{{projectDescription}}}
{{/if}}


TUGAS UTAMA:
1.  **Validasi Input (SANGAT KETAT)**: Pertama, tentukan apakah input yang diberikan (baik dokumen atau teks deskripsi) adalah **Persyaratan Proyek**, **Proposal Proyek**, atau deskripsi sejenis yang secara eksplisit menjabarkan kebutuhan untuk pembuatan sebuah produk atau layanan perangkat lunak.
    -   Jika YA, setel 'isProjectRequirementDocument' ke 'true' dan lanjutkan ke tugas berikutnya.
    -   Jika TIDAK (misalnya ini adalah **sertifikat**, **CV**, **ijazah**, menu restoran, artikel, tagihan, atau teks/dokumen acak lainnya yang tidak berhubungan dengan ruang lingkup proyek), setel 'isProjectRequirementDocument' ke 'false' dan **JANGAN ISI FIELD LAINNYA SAMA SEKALI**. Ini sangat penting.

2.  **Ringkasan Proyek**: Jika input valid, tulis deskripsi singkat dan ringkasan umum dari proyek ini.
3.  **Fitur Wajib**: Ekstrak dan buat daftar fitur-fitur utama yang wajib ada sesuai input.
4.  **Estimasi Tim & Gaji**: Buat daftar peran yang dibutuhkan dan jumlah orang per peran. Untuk **gaji bulanan**, berikan estimasi yang wajar dan realistis untuk setiap peran dalam IDR, berdasarkan pengetahuan Anda tentang standar industri dan pasar kerja di Indonesia. Untuk **sumber gaji**, selalu setel nilainya ke "Estimasi AI". **SANGAT PENTING: Setiap peran harus memiliki estimasi gaji yang berbeda sesuai dengan tanggung jawab dan tingkat senioritasnya.** Jangan samakan semua gaji. Contoh: Gaji "Backend Developer" harus lebih tinggi dari "UI/UX Designer", dan "Project Manager" harus memiliki gaji yang berbeda pula.
5.  **Estimasi Biaya Awal**: Berikan estimasi awal untuk 'Modal Teknis' (meliputi biaya tools, software, server, domain, dll.). Set profit margin default ke 20%.
6.  **Estimasi Linimasa**: Buat linimasa bulanan. Setiap baris berisi bulan (angka), fase, dan aktivitas utama. Tentukan durasi total proyek dari linimasa ini. **Sesuaikan durasi proyek berdasarkan profil klien**. Untuk 'Perusahaan Multinasional', mungkin bisa lebih cepat. Untuk 'Startup Kecil', berikan durasi yang sedikit lebih panjang.
7.  **Saran Teknologi**: Sarankan tumpukan teknologi (tech stack) yang relevan.
`,
});

const analyzeProjectRequirementsFlow = ai.defineFlow(
  {
    name: 'analyzeProjectRequirementsFlow',
    inputSchema: AnalyzeProjectRequirementsInputSchema,
    outputSchema: AnalyzeProjectRequirementsOutputSchema,
  },
  async input => {
    if (!input.documentDataUri && !input.projectDescription) {
        throw new Error("Either documentDataUri or projectDescription must be provided.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
