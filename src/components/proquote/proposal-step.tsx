'use client';

import type { EditableAnalysis } from '@/app/page';
import { GanttChart } from './gantt-chart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Users, DollarSign, Cpu, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Logo } from './logo';
import { id } from 'date-fns/locale';

interface ProposalStepProps {
  analysisResult: EditableAnalysis;
  fileName: string;
  onPrint: () => void;
  onBack: () => void;
}

export function ProposalStep({
  analysisResult,
  fileName,
  onPrint,
  onBack,
}: ProposalStepProps) {
  const {
    estimatedRoles,
    estimatedLaborCosts,
    estimatedTimeline,
    suggestedTechnologies,
  } = analysisResult;

  const today = format(new Date(), 'd MMMM yyyy', { locale: id });

  return (
    <div className="space-y-4">
      <Card
        id="proposal-preview"
        className="w-full animate-in fade-in-50 printable-area"
      >
        <CardHeader className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-4xl text-primary">
                Proposal Proyek
              </CardTitle>
              <CardDescription className="pt-2">
                Disiapkan pada: {today}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-primary no-print">
               <Logo className="h-10 w-10" />
               <span className="text-xl font-bold font-headline">ProQuoteAI</span>
            </div>
          </div>
          <Separator className="my-6" />
          <h2 className="text-2xl font-headline font-semibold">
            Tinjauan Proyek untuk: {fileName.replace('.pdf', '')}
          </h2>
          <p className="text-muted-foreground">
            Dokumen ini menguraikan perkiraan ruang lingkup, sumber daya, linimasa, dan tumpukan teknologi untuk proyek yang diusulkan berdasarkan persyaratan yang diberikan.
          </p>
        </CardHeader>
        <CardContent className="px-8 space-y-8">
          {/* Roles */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Users className="mr-3 h-6 w-6 text-accent" />
              Peran yang Dibutuhkan
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {estimatedRoles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Costs */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <DollarSign className="mr-3 h-6 w-6 text-accent" />
              Estimasi Biaya Tenaga Kerja
            </h3>
            <p className="text-4xl font-bold font-headline text-primary">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(estimatedLaborCosts)}
            </p>
            <p className="text-sm text-muted-foreground">
              Ini adalah perkiraan dan dapat berubah berdasarkan ruang lingkup akhir.
            </p>
          </section>

          <Separator />

          {/* Timeline */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Calendar className="mr-3 h-6 w-6 text-accent" />
              Estimasi Linimasa Proyek
            </h3>
            <div className="w-full">
                <GanttChart timeline={estimatedTimeline} />
            </div>
          </section>

          <Separator />

          {/* Tech Stack */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Cpu className="mr-3 h-6 w-6 text-accent" />
              Tumpukan Teknologi yang Disarankan
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedTechnologies.map((tech, index) => (
                <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                  {tech}
                </div>
              ))}
            </div>
          </section>
        </CardContent>
        <CardFooter className="p-8">
            <p className="text-xs text-muted-foreground italic">
                Proposal ini dibuat dengan bantuan AI. Semua perkiraan adalah untuk tujuan perencanaan dan harus divalidasi oleh para pemangku kepentingan proyek.
            </p>
        </CardFooter>
      </Card>
      
      <div className="flex justify-between no-print">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali untuk Mengedit
        </Button>
        <Button onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> Ekspor ke PDF
        </Button>
      </div>
    </div>
  );
}
