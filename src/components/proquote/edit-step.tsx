'use client';

import type { EditableAnalysis, ProposalDetails } from '@/app/page';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Wallet, Plus, Trash2, Users, Cpu, GanttChartSquare, Percent, Info, Sparkles, Loader2, Wand2, ChevronsUpDown, Check, Banknote, Signature, FileImage, Type, Bot } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getSalarySuggestion } from '@/ai/flows/get-salary-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestTechnologies } from '@/ai/flows/suggest-technologies';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EditStepProps {
  analysisResult: EditableAnalysis;
  proposalDetails: ProposalDetails;
  onUpdate: (updates: Partial<EditableAnalysis>) => void;
  onUpdateProposalDetails: (updates: Partial<ProposalDetails>) => void;
  onSignatureImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
  manpowerCost: number;
  assistantCommand: string;
  setAssistantCommand: (command: string) => void;
  onRunAssistant: () => void;
  isAssistantLoading: boolean;
}

type SalarySuggestion = {
    source: string;
    salary: number;
};

const commonRoles = [
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Frontend Developer', label: 'Frontend Developer' },
    { value: 'Backend Developer', label: 'Backend Developer' },
    { value: 'Full Stack Developer', label: 'Full Stack Developer' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'QA Engineer', label: 'QA Engineer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Business Analyst', label: 'Business Analyst' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'Mobile Developer (iOS)', label: 'Mobile Developer (iOS)' },
    { value: 'Mobile Developer (Android)', label: 'Mobile Developer (Android)' },
  ];

export function EditStep({
  analysisResult,
  proposalDetails,
  onUpdate,
  onUpdateProposalDetails,
  onSignatureImageChange,
  onNext,
  onBack,
  manpowerCost,
  assistantCommand,
  setAssistantCommand,
  onRunAssistant,
  isAssistantLoading,
}: EditStepProps) {
  const {
    estimatedRoles,
    costDetails,
    estimatedTimeline,
    suggestedTechnologies,
    projectSummary,
    requiredFeatures
  } = analysisResult;

  const [salarySuggestions, setSalarySuggestions] = useState<SalarySuggestion[]>([]);
  const [isSuggestingSalary, setIsSuggestingSalary] = useState<number | null>(null);
  const [isSuggestingTech, setIsSuggestingTech] = useState(false);
  const [openRoleCombobox, setOpenRoleCombobox] = useState<number | null>(null);
  const { toast } = useToast();
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value);

  const parseFormattedNumber = (value: string): number => {
    const cleanedValue = value.replace(/[^\d]/g, '');
    return Number(cleanedValue);
  };

  const projectDuration = useMemo(() => {
    if (estimatedTimeline.length === 0) return 0;
    return Math.max(...estimatedTimeline.map(t => t.month));
  }, [estimatedTimeline]);

  const handleRoleChange = (
    index: number,
    field: 'role' | 'count' | 'monthlySalary' | 'salarySource',
    value: string | number
  ) => {
    const newRoles = [...estimatedRoles];
    const roleToUpdate = { ...newRoles[index] };
  
    if (field === 'role' || field === 'salarySource') {
      roleToUpdate[field] = value as string;
    } else if (field === 'monthlySalary') {
      const parsedValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
      roleToUpdate.monthlySalary = parsedValue;
      if (roleToUpdate.salarySource !== 'Manual') {
        const isSuggestion = salarySuggestions.some(s => s.salary === parsedValue);
        if (!isSuggestion) {
            roleToUpdate.salarySource = 'Manual';
        }
      }
    } else { // count
      roleToUpdate.count = Number(value);
    }
  
    newRoles[index] = roleToUpdate;
    onUpdate({ estimatedRoles: newRoles });
  };
  
  const handleAddRole = () => {
    onUpdate({ estimatedRoles: [...estimatedRoles, { role: '', count: 1, monthlySalary: 0, salarySource: 'Manual' }] });
  };

  const handleRemoveRole = (index: number) => {
    onUpdate({ estimatedRoles: estimatedRoles.filter((_, i) => i !== index) });
  };

  const handleCostChange = (field: keyof typeof costDetails, value: string) => {
    const parsedValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10);
    if (!isNaN(parsedValue)) {
      onUpdate({ costDetails: { ...costDetails, [field]: parsedValue } });
    } else if (value === '') {
       onUpdate({ costDetails: { ...costDetails, [field]: 0 } });
    }
  };

  const handleTimelineChange = (
    index: number,
    field: 'activity',
    value: string
  ) => {
    const newTimeline = [...estimatedTimeline];
    const itemToUpdate = { ...newTimeline[index] };
    itemToUpdate[field] = value;
    newTimeline[index] = itemToUpdate;
    onUpdate({ estimatedTimeline: newTimeline });
  };

  const handleAddTimelineItem = () => {
    const newMonth = estimatedTimeline.length > 0 ? Math.max(...estimatedTimeline.map(t => t.month)) + 1 : 1;
    onUpdate({
      estimatedTimeline: [
        ...estimatedTimeline,
        { month: newMonth, phase: 'New Phase', activity: '' },
      ],
    });
  };

  const handleRemoveTimelineItem = (index: number) => {
    const newTimeline = estimatedTimeline.filter((_, i) => i !== index);
    onUpdate({
      estimatedTimeline: newTimeline,
    });
  };

  const handleTechChange = (index: number, value: string) => {
    const newTech = [...suggestedTechnologies];
    newTech[index] = value;
    onUpdate({ suggestedTechnologies: newTech });
  };

  const handleAddTech = () => {
    onUpdate({ suggestedTechnologies: [...suggestedTechnologies, ''] });
  };

  const handleRemoveTech = (index: number) => {
    onUpdate({
      suggestedTechnologies: suggestedTechnologies.filter((_, i) => i !== index),
    });
  };

  const handleProjectSummaryChange = (value: string) => {
    onUpdate({ projectSummary: value });
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...requiredFeatures];
    newFeatures[index] = value;
    onUpdate({ requiredFeatures: newFeatures });
  };

  const handleAddFeature = () => {
    onUpdate({ requiredFeatures: [...requiredFeatures, ''] });
  };
  
  const handleRemoveFeature = (index: number) => {
    onUpdate({ requiredFeatures: requiredFeatures.filter((_, i) => i !== index) });
  };

  const onSuggestSalary = async (index: number, role: string) => {
    if (!role) return;
    setIsSuggestingSalary(index);
    setSalarySuggestions([]);
    try {
        const result = await getSalarySuggestion({ role });
        setSalarySuggestions(result.suggestions);
    } catch (error) {
        console.error("Failed to get salary suggestions", error);
    } finally {
        setIsSuggestingSalary(null);
    }
  };

  const onSelectSuggestion = (index: number, suggestion: SalarySuggestion) => {
    const newRoles = [...estimatedRoles];
    newRoles[index] = {
      ...newRoles[index],
      monthlySalary: suggestion.salary,
      salarySource: suggestion.source,
    };
    onUpdate({ estimatedRoles: newRoles });
    setSalarySuggestions([]);
  };

  const onRegenerateTech = async () => {
    setIsSuggestingTech(true);
    try {
      const result = await suggestTechnologies({ projectRequirements: projectSummary });
      onUpdate({ suggestedTechnologies: result.suggestedTechnologies });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghasilkan Saran',
        description: 'Terjadi kesalahan saat menyarankan teknologi baru.',
      });
      console.error("Failed to suggest technologies", error);
    } finally {
      setIsSuggestingTech(false);
    }
  };


  return (
    <Card className="w-full animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Tinjau &amp; Sesuaikan Estimasi
        </CardTitle>
        <CardDescription>
          Sempurnakan perkiraan yang dihasilkan AI agar sesuai dengan keahlian dan kekhususan proyek Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="project" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="project"><Info className="mr-2"/>Proyek</TabsTrigger>
            <TabsTrigger value="roles"><Users className="mr-2"/>Tim</TabsTrigger>
            <TabsTrigger value="costs"><Wallet className="mr-2"/>Biaya</TabsTrigger>
            <TabsTrigger value="timeline"><GanttChartSquare className="mr-2"/>Linimasa</TabsTrigger>
            <TabsTrigger value="tech"><Cpu className="mr-2"/>Teknologi</TabsTrigger>
            <TabsTrigger value="payment"><Banknote className="mr-2"/>Info Lain</TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            <TabsContent value="project">
               <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="project-summary" className="text-lg font-semibold">Ringkasan Proyek</Label>
                    <Textarea 
                        id="project-summary"
                        value={projectSummary} 
                        onChange={(e) => handleProjectSummaryChange(e.target.value)} 
                        rows={4}
                        placeholder="Deskripsi singkat mengenai proyek..."
                    />
                </div>
                 <div className="space-y-4">
                  <Label className="text-lg font-semibold">Fitur Wajib</Label>
                  <div className="space-y-2">
                    {requiredFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="cth., Autentikasi Pengguna"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFeature(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={handleAddFeature}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Fitur
                  </Button>
                </div>
               </div>
            </TabsContent>

            <TabsContent value="roles">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Gaji default adalah estimasi AI. Klik tombol ✨ untuk melihat perbandingan dari sumber lain atau isi manual. Sumber akan tercatat di proposal.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-[1fr_auto_1.5fr_auto] items-center gap-2 font-medium pt-2">
                  <Label>Peran</Label>
                  <Label className="text-center">Jumlah</Label>
                  <Label>Gaji/Bulan (IDR)</Label>
                  <div/>
                </div>
                <div className="space-y-2">
                  {estimatedRoles.map((role, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_1.5fr_auto] items-center gap-2">
                      <Popover open={openRoleCombobox === index} onOpenChange={(isOpen) => setOpenRoleCombobox(isOpen ? index : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openRoleCombobox === index}
                            className="w-full justify-between font-normal"
                          >
                            {role.role
                              ? commonRoles.find(
                                  (r) => r.value.toLowerCase() === role.role.toLowerCase()
                                )?.label || role.role
                              : "Pilih atau ketik peran..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                           <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Cari atau buat peran baru..."
                              value={role.role}
                              onValueChange={(value) => handleRoleChange(index, 'role', value)}
                            />
                            <CommandList>
                              <CommandEmpty>Tidak ada peran ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {commonRoles.filter(r => r.label.toLowerCase().includes(role.role.toLowerCase())).map((r) => (
                                  <CommandItem
                                    key={r.value}
                                    value={r.value}
                                    onSelect={(currentValue) => {
                                      handleRoleChange(index, 'role', currentValue === role.role ? '' : currentValue);
                                      setOpenRoleCombobox(null);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        role.role.toLowerCase() === r.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {r.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                       <Input
                        type="number"
                        value={role.count}
                        onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                        className="w-20 text-center"
                        min={1}
                      />
                      <div className="flex items-center gap-1">
                         <Input
                          type="text"
                          value={formatNumber(role.monthlySalary)}
                          onChange={(e) => handleRoleChange(index, 'monthlySalary', e.target.value)}
                          onBlur={(e) => {
                            const numericValue = parseFormattedNumber(e.target.value);
                            e.target.value = formatNumber(numericValue);
                          }}
                          placeholder="cth., 8.000.000"
                        />
                        <Popover onOpenChange={() => setSalarySuggestions([])}>
                          <PopoverTrigger asChild>
                             <Button variant="outline" size="icon" onClick={() => onSuggestSalary(index, role.role)} disabled={!role.role || isSuggestingSalary === index}>
                                {isSuggestingSalary === index ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="end">
                            <Command>
                                <CommandInput placeholder="Filter sumber..." />
                                <CommandList>
                                <CommandEmpty>
                                  {isSuggestingSalary === index ? "Sedang mencari saran..." : "Tidak ada saran ditemukan."}
                                </CommandEmpty>
                                {salarySuggestions.length > 0 && <CommandGroup heading="Saran Gaji">
                                    {salarySuggestions.map((suggestion) => (
                                    <CommandItem
                                        key={suggestion.source}
                                        onSelect={() => onSelectSuggestion(index, suggestion)}
                                        className="flex justify-between"
                                    >
                                        <span>{suggestion.source}</span>
                                        <span className="font-mono">{formatCurrency(suggestion.salary)}</span>
                                    </CommandItem>
                                    ))}
                                </CommandGroup>}
                                </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRole(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={handleAddRole}>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Peran
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="costs">
              <div className="space-y-4">
                 <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Info Biaya Tenaga Kerja</p>
                    <p>Biaya tenaga kerja dihitung otomatis berdasarkan: <span className="font-semibold">{formatCurrency(manpowerCost)}</span> (Peran Tim &times; Durasi Linimasa). Anda dapat menyesuaikannya di tab "Tim" atau "Linimasa".</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="technical-modal">Modal Teknis (IDR)</Label>
                     <p className="text-xs text-muted-foreground">Termasuk biaya untuk lisensi software, sewa server, domain, dll.</p>
                      <Input
                        id="technical-modal"
                        type="text"
                        value={formatNumber(costDetails.technicalModal)}
                        onChange={(e) => handleCostChange('technicalModal', e.target.value)}
                        onBlur={(e) => {
                          const numericValue = parseFormattedNumber(e.target.value);
                          e.target.value = formatNumber(numericValue);
                        }}
                        placeholder="cth., 5.000.000"
                      />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="profit-margin">Margin Keuntungan (%)</Label>
                    <div className="flex items-center max-w-xs">
                        <Input
                          id="profit-margin"
                          type="number"
                          value={costDetails.profitMargin === 0 ? '' : costDetails.profitMargin}
                          onChange={(e) => handleCostChange('profitMargin', e.target.value)}
                          placeholder="cth., 20"
                          className="rounded-r-none"
                        />
                        <span className="flex items-center justify-center bg-muted text-muted-foreground h-10 w-10 rounded-r-md border border-l-0 border-input">
                            <Percent className="h-4 w-4"/>
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
               <div className="space-y-4">
                <div className="grid grid-cols-[auto_1fr_2fr_auto] items-center gap-2 font-medium">
                    <Label>Bulan</Label>
                    <Label>Fase</Label>
                    <Label>Aktivitas Utama</Label>
                    <div/>
                </div>
                <div className="space-y-2">
                  {estimatedTimeline.map((item, index) => (
                    <div key={index} className="grid grid-cols-[auto_1fr_2fr_auto] items-center gap-2">
                      <Input
                        type="number"
                        value={item.month}
                        className="w-20 text-center"
                        disabled
                      />
                      <Input
                        value={item.phase}
                        placeholder="cth., Perencanaan"
                        disabled
                      />
                       <Input
                        value={item.activity}
                        onChange={(e) => handleTimelineChange(index, 'activity', e.target.value)}
                        placeholder="cth., Wawancara stakeholder"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTimelineItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={handleAddTimelineItem}>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Baris
                </Button>
                 <Alert variant="default" className="bg-amber-50 border-amber-500 text-amber-700">
                    <AlertTitle className='font-bold'>Informasi Durasi Proyek</AlertTitle>
                    <AlertDescription>
                        Total durasi proyek saat ini adalah <span className="font-semibold">{projectDuration} bulan</span>. Mengubah linimasa akan mempengaruhi perhitungan biaya tenaga kerja.
                    </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="tech">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Tech Stack yang Digunakan</Label>
                    <Button variant="outline" size="sm" onClick={onRegenerateTech} disabled={isSuggestingTech}>
                        {isSuggestingTech ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                        Saran Ulang
                    </Button>
                </div>
                <div className="space-y-2">
                  {suggestedTechnologies.map((tech, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={tech}
                        onChange={(e) =>
                          handleTechChange(index, e.target.value)
                        }
                        placeholder="cth., React, Next.js"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTech(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddTech()}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Teknologi
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Detail Proposal</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subjek Proposal</Label>
                            <Input id="subject" value={proposalDetails.subject} onChange={(e) => onUpdateProposalDetails({ subject: e.target.value })}/>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="from">Nama Pengirim/Perusahaan Anda</Label>
                           <Input id="from" value={proposalDetails.from} onChange={(e) => onUpdateProposalDetails({ from: e.target.value })}/>
                        </div>
                     </div>
                 </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-2">Informasi Pembayaran</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment-bank">Nama Bank</Label>
                            <Input id="payment-bank" value={proposalDetails.paymentBank} onChange={(e) => onUpdateProposalDetails({ paymentBank: e.target.value })} placeholder="cth., Bank Central Asia (BCA)"/>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="payment-account-name">Atas Nama</Label>
                           <Input id="payment-account-name" value={proposalDetails.paymentAccountName} onChange={(e) => onUpdateProposalDetails({ paymentAccountName: e.target.value })} placeholder="cth., PT Teknologi Bersama"/>
                        </div>
                         <div className="space-y-2 md:col-span-2">
                           <Label htmlFor="payment-account-number">Nomor Rekening</Label>
                           <Input id="payment-account-number" value={proposalDetails.paymentAccountNumber} onChange={(e) => onUpdateProposalDetails({ paymentAccountNumber: e.target.value })} placeholder="cth., 1234567890"/>
                        </div>
                     </div>
                 </div>
                 
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tanda Tangan Digital</h3>
                   <div className="space-y-4">
                      <RadioGroup
                        value={proposalDetails.signatureType}
                        onValueChange={(value) => onUpdateProposalDetails({ signatureType: value as 'font' | 'image' })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="font" id="sig-font" />
                          <Label htmlFor="sig-font" className="font-normal flex items-center gap-2 cursor-pointer"><Type/> Gaya Font</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="image" id="sig-image" />
                          <Label htmlFor="sig-image" className="font-normal flex items-center gap-2 cursor-pointer"><FileImage/> Unggah Gambar</Label>
                        </div>
                      </RadioGroup>

                      {proposalDetails.signatureType === 'font' && (
                         <div className="grid md:grid-cols-2 gap-4 pt-2 animate-in fade-in-50">
                            <div className="space-y-2">
                               <Label htmlFor="signature-name">Nama untuk Tanda Tangan</Label>
                               <Input id="signature-name" value={proposalDetails.signatureName} onChange={(e) => onUpdateProposalDetails({ signatureName: e.target.value })} placeholder="Nama lengkap Anda"/>
                            </div>
                            <div className="space-y-2">
                                 <Label>Gaya Tanda Tangan</Label>
                                 <RadioGroup
                                    value={proposalDetails.signatureFont}
                                    onValueChange={(value) => onUpdateProposalDetails({ signatureFont: value as ProposalDetails['signatureFont'] })}
                                    className="flex flex-wrap gap-4 pt-2"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="dancing-script" id="font1" />
                                      <Label htmlFor="font1" className="font-normal cursor-pointer font-dancing-script text-lg">Gaya 1</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="pacifico" id="font2" />
                                      <Label htmlFor="font2" className="font-normal cursor-pointer font-pacifico text-base">Gaya 2</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="sacramento" id="font3" />
                                      <Label htmlFor="font3" className="font-normal cursor-pointer font-sacramento text-xl">Gaya 3</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="great-vibes" id="font4" />
                                      <Label htmlFor="font4" className="font-normal cursor-pointer font-great-vibes text-xl">Gaya 4</Label>
                                    </div>
                                  </RadioGroup>
                            </div>
                         </div>
                      )}
                      
                      {proposalDetails.signatureType === 'image' && (
                        <div className="pt-2 animate-in fade-in-50">
                            <Label htmlFor="signature-upload">Unggah Tanda Tangan (PNG)</Label>
                            <Input id="signature-upload" type="file" accept="image/png" onChange={onSignatureImageChange} className="mt-2" />
                            {proposalDetails.signatureImage && (
                                <div className="mt-4 p-4 border rounded-md flex justify-center bg-muted/50">
                                    <img src={proposalDetails.signatureImage} alt="Pratinjau Tanda Tangan" className="max-h-24" />
                                </div>
                            )}
                        </div>
                      )}

                   </div>
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <div className="relative rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary"/>
                <h3 className="text-lg font-semibold font-headline">Asisten AI</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Beri perintah dalam bahasa alami untuk mengedit proposal. Contoh: "tambah 2 frontend developer" atau "ubah margin jadi 25%".
            </p>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Ketik perintah Anda di sini..."
                value={assistantCommand}
                onChange={(e) => setAssistantCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onRunAssistant()}
                disabled={isAssistantLoading}
              />
              <Button onClick={onRunAssistant} disabled={isAssistantLoading || !assistantCommand}>
                {isAssistantLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                <span className="sr-only">Kirim</span>
              </Button>
            </div>
        </div>
        <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Button onClick={onNext} variant="default">
              Buat Proposal <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
