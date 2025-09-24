'use client';

import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, ArrowRight, Loader2, FileUp, FileSignature } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

export type InputMode = 'upload' | 'describe';

interface UploadStepProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onNext: () => void;
  fileName: string;
  projectDescription: string;
  isLoading: boolean;
}

export function UploadStep({
  inputMode,
  setInputMode,
  onFileChange,
  onDescriptionChange,
  onNext,
  fileName,
  projectDescription,
  isLoading
}: UploadStepProps) {
  
  const isNextDisabled = 
    (inputMode === 'upload' && !fileName) ||
    (inputMode === 'describe' && !projectDescription) ||
    isLoading;

  return (
    <Card className="w-full animate-in fade-in-50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">
          Hasilkan Proposal Proyek dengan AI
        </CardTitle>
        <CardDescription className="pt-2">
          Mulai dengan mengunggah dokumen persyaratan (PDF) atau mendeskripsikan proyek Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" disabled={isLoading}><FileUp className="mr-2 h-4 w-4"/> Unggah PDF</TabsTrigger>
                <TabsTrigger value="describe" disabled={isLoading}><FileSignature className="mr-2 h-4 w-4"/> Deskripsikan Proyek</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
                 <Label htmlFor="pdf-upload" className="sr-only">Unggah PDF</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors duration-300">
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">
                        Seret &amp; lepas PDF Anda di sini atau klik untuk menelusuri
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ukuran file maksimum: 10MB
                    </p>
                    <Input
                        id="pdf-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={onFileChange}
                        accept="application/pdf"
                        disabled={isLoading}
                    />
                </div>
                {fileName && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{fileName}</span>
                </div>
                )}
            </TabsContent>
            <TabsContent value="describe" className="pt-4">
                <Label htmlFor="project-description" className="sr-only">Deskripsi Proyek</Label>
                <Textarea
                    id="project-description"
                    placeholder="Jelaskan kebutuhan proyek Anda di sini. Sertakan fitur utama, tujuan, dan detail lain yang relevan. Contoh: 'Saya butuh aplikasi e-commerce untuk menjual produk fashion. Fitur harus ada: pendaftaran user, katalog produk, keranjang belanja, dan pembayaran online...'"
                    rows={8}
                    value={projectDescription}
                    onChange={onDescriptionChange}
                    disabled={isLoading}
                />
            </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full text-lg py-6"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memvalidasi Input...
            </>
          ) : (
            <>
              Lanjutkan <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
