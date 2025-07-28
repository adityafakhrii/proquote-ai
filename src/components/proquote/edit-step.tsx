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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Wallet, Plus, Trash2, Users, Cpu, GanttChartSquare, Percent, Info, Sparkles, Loader2, Wand2, ChevronsUpDown, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getSalarySuggestion } from '@/ai/flows/get-salary-suggestion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestTechnologies } from '@/ai/flows/suggest-technologies';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditStepProps {
  analysisResult: EditableAnalysis;
  onUpdate: (updates: Partial<EditableAnalysis>) => void;
  onNext: () => void;
  onBack: () => void;
  manpowerCost: number;
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
  onUpdate,
  onNext,
  onBack,
  manpowerCost,
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
    field: 'role' | 'count' | 'monthlySalary',
    value: string | number
  ) => {
    const newRoles = [...estimatedRoles];
    const roleToUpdate = { ...newRoles[index] };
    if (field === 'role') {
      roleToUpdate.role = value as string;
    } else if (field === 'monthlySalary') {
      const parsedValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
      roleToUpdate.monthlySalary = parsedValue;
    }
     else {
      roleToUpdate[field] = Number(value);
    }
    newRoles[index] = roleToUpdate;
    onUpdate({ estimatedRoles: newRoles });
  };
  
  const handleAddRole = () => {
    onUpdate({ estimatedRoles: [...estimatedRoles, { role: '', count: 1, monthlySalary: 0 }] });
  };

  const handleRemoveRole = (index: number) => {
    onUpdate({ estimatedRoles: estimatedRoles.filter((_, i) => i !== index) });
  };

  const handleCostChange = (field: keyof typeof costDetails, value: string) => {
    const parsedValue = parseFormattedNumber(value);
    onUpdate({ costDetails: { ...costDetails, [field]: Number(parsedValue) } });
  };

  const handleTimelineChange = (
    index: number,
    field: 'phase' | 'activity' | 'month',
    value: string | number
  ) => {
    const newTimeline = [...estimatedTimeline];
    const itemToUpdate = { ...newTimeline[index] };
    if (field === 'month') {
        itemToUpdate.month = Number(value);
    } else {
      itemToUpdate[field] = value as string;
    }
    newTimeline[index] = itemToUpdate;
    onUpdate({ estimatedTimeline: newTimeline });
  };

  const handleAddTimelineItem = () => {
    const newMonth = estimatedTimeline.length > 0 ? Math.max(...estimatedTimeline.map(t => t.month)) + 1 : 1;
    onUpdate({
      estimatedTimeline: [
        ...estimatedTimeline,
        { month: newMonth, phase: '', activity: '' },
      ],
    });
  };

  const handleRemoveTimelineItem = (index: number) => {
    const newTimeline = estimatedTimeline.filter((_, i) => i !== index);
    const reindexedTimeline = newTimeline.map((item, idx) => ({...item, month: idx + 1}));
    onUpdate({
      estimatedTimeline: reindexedTimeline,
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

  const onSelectSuggestion = (index: number, salary: number) => {
    handleRoleChange(index, 'monthlySalary', salary);
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
          Tinjau & Sesuaikan Estimasi
        </CardTitle>
        <CardDescription>
          Sempurnakan perkiraan yang dihasilkan AI agar sesuai dengan keahlian dan kekhususan proyek Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="project" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="project"><Info className="mr-2"/>Proyek</TabsTrigger>
            <TabsTrigger value="roles"><Users className="mr-2"/>Tim</TabsTrigger>
            <TabsTrigger value="costs"><Wallet className="mr-2"/>Biaya</TabsTrigger>
            <TabsTrigger value="timeline"><GanttChartSquare className="mr-2"/>Linimasa</TabsTrigger>
            <TabsTrigger value="tech"><Cpu className="mr-2"/>Teknologi</TabsTrigger>
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
                    Gaji default adalah estimasi AI berdasarkan standar industri di Indonesia. Klik tombol ✨ untuk melihat perbandingan dari sumber lain.
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
                                        onSelect={() => onSelectSuggestion(index, suggestion.salary)}
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
                        <Input id="profit-margin" type="number" value={costDetails.profitMargin} onChange={(e) => handleCostChange('profitMargin', e.target.value)} placeholder="cth., 20" className="rounded-r-none"/>
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
                        onChange={(e) => handleTimelineChange(index, 'month', e.target.value)}
                        className="w-20 text-center"
                        readOnly
                        disabled
                      />
                      <Input
                        value={item.phase}
                        onChange={(e) => handleTimelineChange(index, 'phase', e.target.value)}
                        placeholder="cth., Perencanaan"
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
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Button onClick={onNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Buat Proposal <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
