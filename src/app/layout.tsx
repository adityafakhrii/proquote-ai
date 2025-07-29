import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Logo } from '@/components/proquote/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'ProQuoteAI',
  description: 'Hasilkan Proposal Proyek dengan AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&family=Sacramento&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex flex-col min-h-screen bg-secondary/50">
              <header className="p-4 border-b bg-card sticky top-0 z-20 no-print">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-primary">
                      ProQuoteAI
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              {children}
              <footer className="text-center p-4 text-sm text-muted-foreground no-print">
                Didukung oleh AI. Verifikasi semua perkiraan sebelum mengirim ke klien.
              </footer>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
