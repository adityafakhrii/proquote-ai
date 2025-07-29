'use client';

import type { ClientProfile, EditableAnalysis, ProposalDetails } from '@/app/page';
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
import { ArrowLeft, Printer, Users, Wallet, Cpu, GanttChartSquare, Landmark, FileText, CheckCircle, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { Logo } from './logo';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProposalStepProps {
  analysisResult: EditableAnalysis;
  clientProfile: ClientProfile;
  proposalDetails: ProposalDetails;
  onPrint: () => void;
  onBack: () => void;
  manpowerCost: number;
}

const fontMap = {
    'dancing-script': 'font-dancing-script',
    'pacifico': 'font-pacifico',
    'sacramento': 'font-sacramento',
    'great-vibes': 'font-great-vibes',
};

export function ProposalStep({
  analysisResult,
  clientProfile,
  proposalDetails,
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

  const subtotalCost = costDetails.technicalModal + manpowerCost;
  const profitAmount = subtotalCost * (costDetails.profitMargin / 100);
  const grandTotal = subtotalCost + profitAmount;
  
  const signatureFontClass = fontMap[proposalDetails.signatureFont] || 'font-dancing-script';

  return (
    <div className="space-y-4">
      <Card
        id="proposal-preview"
        className="w-full animate-in fade-in-50 printable-area"
      >
        <CardHeader className="p-8">
          <div className="flex justify-between items-start">
            <div className='flex items-center gap-3 text-primary'>
               <Logo className="h-10 w-10" />
               <span className="text-xl font-bold font-headline">ProQuoteAI</span>
            </div>
            <div className="text-right">
              <h2 className="font-headline text-4xl text-primary font-bold">
                Proposal Proyek
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 space-y-8">
            {/* Header Details */}
            <section className='text-sm'>
                <div className='grid grid-cols-2 gap-x-8 gap-y-2'>
                    <div>
                        <p className='text-muted-foreground'>Tanggal:</p>
                        <p className='font-semibold'>{today}</p>
                    </div>
                     <div>
                        <p className='text-muted-foreground'>Subjek:</p>
                        <p className='font-semibold'>{proposalDetails.subject}</p>
                    </div>
                     <div>
                        <p className='text-muted-foreground'>Dari:</p>
                        <p className='font-semibold'>{proposalDetails.from}</p>
                    </div>
                     <div>
                        <p className='text-muted-foreground'>Untuk:</p>
                        <p className='font-semibold'>{clientProfile.recipientName}, {clientProfile.companyName}</p>
                    </div>
                </div>
            </section>
            
            <Separator/>
            
            {/* Formal Opening */}
            <section>
                <p className='mb-2'>Kepada Yth.,</p>
                <p className='font-semibold'>{clientProfile.recipientName}</p>
                <p className='font-semibold'>{clientProfile.companyName}</p>
                <p className='mt-4'>Dengan hormat,</p>
                <p className='mt-2 text-muted-foreground'>
                    Bersama dengan surat ini, kami, {proposalDetails.from}, mengajukan proposal penawaran untuk proyek pengembangan perangkat lunak sebagaimana yang tercantum dalam dokumen persyaratan yang telah kami terima. Berikut adalah rincian dari analisis dan estimasi yang telah kami siapkan.
                </p>
            </section>
            

          {/* Project Summary */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
                Ringkasan Proyek
            </h3>
            <p className="text-muted-foreground">
                {projectSummary}
            </p>
          </section>
          
          {/* Required Features */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
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

          {/* Roles */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
              Estimasi Tim / Manpower
            </h3>
             <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
              {estimatedRoles.map((role, index) => (
                <li key={index}><span className='text-foreground'>{role.count}x {role.role}</span></li>
              ))}
            </ul>
          </section>

          {/* Costs */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
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
                <p className='text-xs text-muted-foreground italic text-center pt-2'>*Estimasi gaji bulanan didasarkan pada standar industri dan dapat dinegosiasikan.</p>
            </div>
          </section>

          {/* Payment Scheme */}
          <section>
             <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
                Skema Pembayaran
            </h3>
            <div className="bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-semibold flex items-center mb-2">Termin Pembayaran Bertahap</h4>
                <ul className="list-decimal list-inside text-sm text-muted-foreground pl-4">
                    <li><span className="font-semibold text-foreground">DP (50%):</span> {formatCurrency(grandTotal * 0.5)} di awal proyek.</li>
                    <li><span className="font-semibold text-foreground">Progress (30%):</span> {formatCurrency(grandTotal * 0.3)} setelah penyelesaian tahap pengembangan.</li>
                    <li><span className="font-semibold text-foreground">Pelunasan (20%):</span> {formatCurrency(grandTotal * 0.2)} setelah serah terima proyek.</li>
                </ul>
                {proposalDetails.paymentBank && (
                    <div className='mt-4 pt-4 border-t'>
                        <h4 className='font-semibold flex items-center mb-2'>Informasi Rekening Pembayaran</h4>
                        <div className='text-sm text-muted-foreground'>
                            <p>Mohon lakukan pembayaran ke rekening berikut:</p>
                            <p className='mt-1'><span className='font-semibold text-foreground'>Bank:</span> {proposalDetails.paymentBank}</p>
                            <p><span className='font-semibold text-foreground'>No. Rekening:</span> {proposalDetails.paymentAccountNumber}</p>
                            <p><span className='font-semibold text-foreground'>Atas Nama:</span> {proposalDetails.paymentAccountName}</p>
                        </div>
                    </div>
                )}
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
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

          {/* Tech Stack */}
          <section>
            <h3 className="text-xl font-headline font-semibold mb-4 border-b pb-2">
              Tech Stack yang Disarankan
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedTechnologies.map((tech, index) => (
                <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                  {tech}
                </div>
              ))}
            </div>
          </section>

            {/* Closing */}
            <section className='pt-8'>
                <p className='text-muted-foreground'>
                    Demikian proposal ini kami sampaikan. Kami sangat antusias dengan kemungkinan untuk bekerja sama dengan {clientProfile.companyName}. Jangan ragu untuk menghubungi kami jika ada pertanyaan lebih lanjut.
                </p>
                <div className='mt-12 flex justify-end'>
                    <div className='text-center'>
                        <p>Hormat kami,</p>
                        {proposalDetails.signatureName ? (
                            <>
                                <p className={cn("text-4xl my-8", signatureFontClass)}>{proposalDetails.signatureName}</p>
                                <p className='font-semibold'>{proposalDetails.signatureName}</p>
                                <p className='text-sm text-muted-foreground'>{proposalDetails.from}</p>
                            </>
                        ) : (
                            <div className='h-32'></div>
                        )}
                    </div>
                </div>
            </section>
        </CardContent>
        <CardFooter className="p-8 mt-16">
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
