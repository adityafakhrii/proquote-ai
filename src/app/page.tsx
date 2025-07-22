'use client';

import { useState, type ChangeEvent } from 'react';
import {
  analyzeProjectRequirements,
  type AnalyzeProjectRequirementsOutput,
} from '@/ai/flows/analyze-project-requirements';
import { useToast } from '@/hooks/use-toast';
import { UploadStep } from '@/components/proquote/upload-step';
import { EditStep } from '@/components/proquote/edit-step';
import { ProposalStep } from '@/components/proquote/proposal-step';
import { Logo } from '@/components/proquote/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export type EditableAnalysis = AnalyzeProjectRequirementsOutput;

export default function Home() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<EditableAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        toast({
          variant: 'destructive',
          title: 'Jenis File Tidak Valid',
          description: 'Silakan unggah file PDF.',
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File yang Dipilih',
        description: 'Silakan pilih PDF persyaratan proyek untuk dianalisis.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await analyzeProjectRequirements({
          documentDataUri: dataUri,
        });
        setAnalysisResult(result);
        setStep(2);
        setIsLoading(false);
      };
      reader.onerror = () => {
        throw new Error('Gagal membaca file.');
      };
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analisis Gagal',
        description:
          'Terjadi kesalahan saat menganalisis dokumen Anda. Silakan coba lagi.',
      });
      setIsLoading(false);
    }
  };

  const handleUpdate = (updates: Partial<EditableAnalysis>) => {
    if (analysisResult) {
      setAnalysisResult({ ...analysisResult, ...updates });
    }
  };

  const handleGenerateProposal = () => {
    setStep(3);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setFile(null);
    setFileName('');
    setAnalysisResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="p-4 border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-primary">
              ProQuoteAI
            </h1>
          </div>
          {step > 1 && (
             <Button variant="ghost" onClick={handleStartOver}>Mulai dari Awal</Button>
          )}
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl transition-all duration-300">
          {step === 1 && (
            <UploadStep
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              fileName={fileName}
            />
          )}
          {step === 2 && analysisResult && (
            <EditStep
              analysisResult={analysisResult}
              onUpdate={handleUpdate}
              onNext={handleGenerateProposal}
              onBack={handleBack}
            />
          )}
          {step === 3 && analysisResult && (
            <ProposalStep
              analysisResult={analysisResult}
              fileName={fileName}
              onPrint={handlePrint}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Didukung oleh AI. Verifikasi semua perkiraan sebelum mengirim ke klien.
      </footer>
    </div>
  );
}
