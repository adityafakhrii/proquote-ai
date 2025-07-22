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
import { UploadCloud, FileText, Loader2, Wand2 } from 'lucide-react';

interface UploadStepProps {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  fileName: string;
}

export function UploadStep({
  onFileChange,
  onAnalyze,
  isLoading,
  fileName,
}: UploadStepProps) {
  return (
    <Card className="w-full animate-in fade-in-50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">
          Generate a Project Proposal with AI
        </CardTitle>
        <CardDescription className="pt-2">
          Start by uploading your project requirements document (PDF). Our AI
          will analyze it to create a detailed estimate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="pdf-upload" className="sr-only">Upload PDF</Label>
        <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors duration-300">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">
                Drag & drop your PDF here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                Maximum file size: 10MB
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
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary p-3 rounded-md">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium">{fileName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full text-lg py-6"
          onClick={onAnalyze}
          disabled={isLoading || !fileName}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Analyze Project
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
