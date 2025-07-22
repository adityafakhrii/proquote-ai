'use client';

import type { EditableAnalysis } from '@/app/page';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, Users, Wallet, Cpu, GanttChartSquare, Landmark, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Logo } from './logo';
import { id } from 'date-fns/locale';

interface ProposalStepProps {
  analysisResult: EditableAnalysis;
  fileName: string;
  onPrint: () => void;
  onBack: () => void;
  manpowerCost: number;
}

export function ProposalStep({
  analysisResult,
  fileName,
  onPrint,
  onBack,
  manpowerCost
}: ProposalStepProps) {
  const {
    estimatedRoles,
    costDetails,
    estimatedTimeline,
    suggestedTechnologies,
    projectSummary,
    requiredFeatures
  } = analysisResult;

  const projectDuration = estimatedTimeline.length > 0 
    ? Math.max(...estimatedTimeline.map(t => t.month)) 
    : 0;
  const today = format(new Date(), 'd MMMM yyyy', { locale: id });
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const subtotalCost = costDetails.technicalModal + manpowerCost + costDetails.development;
  const profitAmount = subtotalCost * (costDetails.profitMargin / 100);
  const grandTotal = subtotalCost + profitAmount;

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
        </CardHeader>
        <CardContent className="px-8 space-y-8">
          {/* Project Summary */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
                <FileText className="mr-3 h-6 w-6 text-accent" />
                Ringkasan Proyek
            </h3>
            <p className="text-muted-foreground">
                {projectSummary}
            </p>
          </section>

          <Separator/>
          
          {/* Required Features */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
                <CheckCircle className="mr-3 h-6 w-6 text-accent" />
                Fitur-fitur Wajib
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-inside">
                {requiredFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
          </section>

          <Separator />

          {/* Roles */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Users className="mr-3 h-6 w-6 text-accent" />
              Estimasi Tim / Manpower
            </h3>
             <ul className="list-disc list-inside space-y-1 pl-2">
              {estimatedRoles.map((role, index) => (
                <li key={index}>{role.count}x {role.role}</li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Costs */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Wallet className="mr-3 h-6 w-6 text-accent" />
              Estimasi Biaya Proyek
            </h3>
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Rincian Komponen Biaya</h4>
                <div className="border rounded-lg">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Modal Teknis</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(costDetails.technicalModal)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Tenaga Kerja (Manpower)</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(manpowerCost)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Pengembangan Tambahan</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(costDetails.development)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="text-muted-foreground">Subtotal Biaya</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(subtotalCost)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="text-muted-foreground">Profit/Margin ({costDetails.profitMargin}%)</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(profitAmount)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center">
                    <h4 className="font-semibold text-lg text-primary">Total Biaya Proyek</h4>
                    <p className="text-2xl font-bold font-headline text-primary">
                        {formatCurrency(grandTotal)}
                    </p>
                </div>
            </div>
            <div className="mt-8 space-y-4">
                <h4 className="font-semibold text-lg">Rincian Biaya Tenaga Kerja (Manpower)</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peran</TableHead>
                        <TableHead className="text-center">Jumlah</TableHead>
                        <TableHead className="text-right">Gaji/Bulan</TableHead>
                        <TableHead className="text-center">Durasi</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimatedRoles.map((role, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{role.role}</TableCell>
                          <TableCell className="text-center">{role.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(role.monthlySalary)}</TableCell>
                          <TableCell className="text-center">{projectDuration} bulan</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(role.count * role.monthlySalary * projectDuration)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            </div>
            <div className="mt-8 bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-semibold flex items-center"><Landmark className="mr-2 h-5 w-5"/>Skema Pembayaran Bertahap</h4>
                <ul className="list-decimal list-inside mt-2 text-sm text-muted-foreground pl-4">
                    <li><span className="font-semibold text-foreground">DP (50%):</span> {formatCurrency(grandTotal * 0.5)} di awal proyek.</li>
                    <li><span className="font-semibold text-foreground">Progress (30%):</span> {formatCurrency(grandTotal * 0.3)} setelah penyelesaian tahap pengembangan.</li>
                    <li><span className="font-semibold text-foreground">Pelunasan (20%):</span> {formatCurrency(grandTotal * 0.2)} setelah serah terima proyek.</li>
                </ul>
            </div>
             <p className="text-sm text-muted-foreground text-center mt-6">
                Ini adalah perkiraan dan dapat berubah berdasarkan ruang lingkup akhir.
            </p>
          </section>

          <Separator />

          {/* Timeline */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <GanttChartSquare className="mr-3 h-6 w-6 text-accent" />
              Estimasi Linimasa Proyek
            </h3>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Bulan ke-</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Aktivitas Utama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimatedTimeline.sort((a,b) => a.month - b.month).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.month}</TableCell>
                    <TableCell>{item.phase}</TableCell>
                    <TableCell>{item.activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <Separator />

          {/* Tech Stack */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Cpu className="mr-3 h-6 w-6 text-accent" />
              Tech Stack yang Digunakan
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
