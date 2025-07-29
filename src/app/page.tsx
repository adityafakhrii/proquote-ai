'use client';

import { useState, type ChangeEvent, useMemo } from 'react';
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
import { ClientProfileStep } from '@/components/proquote/client-profile-step';
import { ThemeToggle } from '@/components/theme-toggle';

export type ClientProfile = {
  recipientName: string;
  companyName: string;
  profileType: 'startup' | 'multinational' | 'government' | 'other';
};

export type ProposalDetails = {
    subject: string;
    from: string;
    paymentBank: string;
    paymentAccountName: string;
    paymentAccountNumber: string;
    signatureType: 'font' | 'image';
    signatureName: string;
    signatureFont: 'dancing-script' | 'pacifico' | 'sacramento' | 'great-vibes';
    signatureImage: string | null;
};

export type EditableAnalysis = Required<Omit<AnalyzeProjectRequirementsOutput, 'isProjectRequirementDocument' | 'costDetails'>> & {
  costDetails: {
    technicalModal: number;
    profitMargin: number;
  };
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<EditableAnalysis | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile>({
      recipientName: '',
      companyName: '',
      profileType: 'startup'
  });
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>({
      subject: 'Proposal Penawaran Proyek Pengembangan Perangkat Lunak',
      from: 'ProQuoteAI Solutions',
      paymentBank: '',
      paymentAccountName: '',
      paymentAccountNumber: '',
      signatureType: 'font',
      signatureName: '',
      signatureFont: 'dancing-script',
      signatureImage: null,
  });
  const { toast } = useToast();

  const manpowerCost = useMemo(() => {
    if (!analysisResult) return 0;
    const { estimatedRoles, estimatedTimeline } = analysisResult;
    const projectDuration = estimatedTimeline.length > 0 
      ? Math.max(...estimatedTimeline.map(t => t.month)) 
      : 0;
    
    return estimatedRoles.reduce((total, role) => {
      return total + (role.count * role.monthlySalary * projectDuration);
    }, 0);
  }, [analysisResult]);


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

  const handleAnalyze = async (profile?: ClientProfile) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada File yang Dipilih',
        description: 'Silakan pilih PDF persyaratan proyek untuk melanjutkan.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        
        const profileToAnalyze = profile || clientProfile;
        const profileMap = {
            'startup': 'Startup kecil',
            'multinational': 'Perusahaan multinasional',
            'government': 'Lembaga pemerintah',
            'other': 'Lainnya'
        };

        // If it's the first analysis (from upload step), just validate the document
        if (step === 1) {
            const result = await analyzeProjectRequirements({
                documentDataUri: dataUri,
                clientProfile: profileMap['startup'], // Use default for initial check
            });

            if (!result.isProjectRequirementDocument) {
              toast({
                variant: 'destructive',
                title: 'Dokumen Tidak Sesuai',
                description: 'Dokumen yang Anda unggah bukan dokumen persyaratan proyek. Silakan coba lagi.',
              });
              setIsLoading(false);
              return;
            }
            setStep(2);
            setIsLoading(false);
            return;
        }


        // If it's the second analysis (from client profile step), populate the data
        const result = await analyzeProjectRequirements({
          documentDataUri: dataUri,
          clientProfile: profileMap[profileToAnalyze.profileType],
        });


        if (!result.projectSummary || !result.requiredFeatures || !result.estimatedRoles || !result.costDetails || !result.estimatedTimeline || !result.suggestedTechnologies) {
          toast({
            variant: 'destructive',
            title: 'Analisis Gagal',
            description: 'AI tidak dapat mengekstrak detail dari dokumen. Pastikan dokumen Anda adalah dokumen persyaratan proyek yang jelas.',
          });
          setIsLoading(false);
          return;
        }
        
        const initialResult: EditableAnalysis = {
          projectSummary: result.projectSummary,
          requiredFeatures: result.requiredFeatures,
          estimatedRoles: result.estimatedRoles,
          estimatedTimeline: result.estimatedTimeline.sort((a, b) => a.month - b.month),
          suggestedTechnologies: result.suggestedTechnologies,
          costDetails: {
            technicalModal: result.costDetails.technicalModal,
            profitMargin: result.costDetails.profitMargin,
          }
        };

        setAnalysisResult(initialResult);
        setStep(3); // Go to Edit Step
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
      let newResult = { ...analysisResult, ...updates };
  
      if (updates.estimatedTimeline) {
        // Sort, then re-index the months to be sequential
        newResult.estimatedTimeline = updates.estimatedTimeline
          .sort((a, b) => a.month - b.month)
          .map((item, index) => ({
            ...item,
            month: index + 1,
          }));
      }
      
      setAnalysisResult(newResult);
    }
  };

  const handleUpdateProposalDetails = (updates: Partial<ProposalDetails>) => {
      setProposalDetails(prev => ({ ...prev, ...updates }));
  };
  
  const handleSignatureImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = () => {
        handleUpdateProposalDetails({ signatureImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'File Tidak Valid',
        description: 'Silakan unggah file gambar dengan format PNG.',
      });
    }
  };

  const handleGenerateProposal = () => {
    setStep(4);
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
    setClientProfile({
        recipientName: '',
        companyName: '',
        profileType: 'startup'
    });
    setProposalDetails({
        subject: 'Proposal Penawaran Proyek Pengembangan Perangkat Lunak',
        from: 'ProQuoteAI Solutions',
        paymentBank: '',
        paymentAccountName: '',
        paymentAccountNumber: '',
        signatureType: 'font',
        signatureName: '',
        signatureFont: 'dancing-script',
        signatureImage: null,
    });
  };

  return (
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
            {step > 1 && (
              <Button variant="ghost" onClick={handleStartOver}>Mulai dari Awal</Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl transition-all duration-300">
          {step === 1 && (
            <UploadStep
              onFileChange={handleFileChange}
              onNext={() => handleAnalyze()}
              fileName={fileName}
              isLoading={isLoading}
            />
          )}
          {step === 2 && (
             <ClientProfileStep 
                clientProfile={clientProfile}
                setClientProfile={(profile) => {
                    setClientProfile(profile);
                }}
                onNext={() => handleAnalyze(clientProfile)}
                onBack={handleBack}
                isLoading={isLoading}
             />
          )}
          {step === 3 && analysisResult && (
            <EditStep
              analysisResult={analysisResult}
              proposalDetails={proposalDetails}
              onUpdate={handleUpdate}
              onUpdateProposalDetails={handleUpdateProposalDetails}
              onSignatureImageChange={handleSignatureImageChange}
              onNext={handleGenerateProposal}
              onBack={handleBack}
              manpowerCost={manpowerCost}
            />
          )}
          {step === 4 && analysisResult && (
            <ProposalStep
              analysisResult={analysisResult}
              clientProfile={clientProfile}
              proposalDetails={proposalDetails}
              onPrint={handlePrint}
              onBack={handleBack}
              manpowerCost={manpowerCost}
            />
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground no-print">
        Didukung oleh AI. Verifikasi semua perkiraan sebelum mengirim ke klien.
      </footer>
    </div>
  );
}
