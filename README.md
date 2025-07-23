# ProQuoteAI: Hasilkan Proposal Proyek dengan AI

ProQuoteAI adalah aplikasi web inovatif yang dirancang untuk menyederhanakan dan mempercepat proses pembuatan proposal proyek perangkat lunak. Dengan memanfaatkan kekuatan AI generatif, aplikasi ini menganalisis dokumen persyaratan proyek (dalam format PDF) dan secara otomatis menghasilkan estimasi terperinci yang mencakup semua aspek penting proyek.

## ✨ Fitur Utama

- **Analisis Dokumen PDF**: Unggah dokumen persyaratan proyek Anda, dan biarkan AI kami yang bekerja.
- **Estimasi Cerdas Berbasis AI**: Dapatkan draf proposal instan yang berisi:
    - Ringkasan Proyek
    - Daftar Fitur Wajib
    - Estimasi Tim & Peran yang Dibutuhkan
    - Perkiraan Biaya (Modal Teknis & Tenaga Kerja)
    - Linimasa Proyek (Timeline)
    - Saran Tumpukan Teknologi (Tech Stack)
- **Validasi Dokumen Cerdas**: AI secara otomatis memvalidasi apakah dokumen yang diunggah relevan dengan persyaratan proyek.
- **Saran Gaji Berbasis Data**: Dapatkan saran gaji yang realistis untuk setiap peran berdasarkan berbagai sumber data industri (UMR, Glassdoor, laporan konsultan, dll.).
- **Antarmuka Editing Interaktif**: Jangan hanya menerima hasil AI begitu saja. Sesuaikan dan sempurnakan setiap detail estimasi—mulai dari peran tim, gaji, biaya, hingga linimasa—agar sesuai dengan keahlian dan kebutuhan spesifik Anda.
- **Pembuatan Proposal Profesional**: Hasilkan dokumen proposal yang rapi, terstruktur, dan siap untuk disajikan kepada klien.
- **Ekspor ke PDF**: Cetak atau simpan proposal Anda sebagai file PDF dengan mudah.

## 🚀 Tumpukan Teknologi (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (dengan App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [Shadcn/ui](https://ui.shadcn.com/)
- **AI & GenAI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Manajemen State**: React Hooks & Context API

## 🛠️ Menjalankan Secara Lokal

Untuk menjalankan ProQuoteAI di mesin lokal Anda, ikuti langkah-langkah berikut:

### Prasyarat

- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- npm, yarn, atau pnpm

### Instalasi

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/your-username/proquote-ai.git
    cd proquote-ai
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Siapkan variabel lingkungan:**
    - Salin file `.env.example` menjadi `.env`.
      ```bash
      cp .env.example .env
      ```
    - Buka file `.env` dan tambahkan kunci API [Google AI (Gemini)](https://aistudio.google.com/app/apikey) Anda.
      ```
      GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
      ```

4.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```

5.  Buka [http://localhost:9002](http://localhost:9002) di browser Anda untuk melihat hasilnya.

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.
