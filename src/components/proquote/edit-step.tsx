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
import { ArrowLeft, ArrowRight, Wallet, Plus, Trash2, Users, Cpu, Calendar, GanttChartSquare } from 'lucide-react';

interface EditStepProps {
  analysisResult: EditableAnalysis;
  onUpdate: (updates: Partial<EditableAnalysis>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EditStep({
  analysisResult,
  onUpdate,
  onNext,
  onBack,
}: EditStepProps) {
  const {
    estimatedRoles,
    costDetails,
    estimatedTimeline,
    suggestedTechnologies,
  } = analysisResult;

  const handleRoleChange = (
    index: number,
    field: 'role' | 'count',
    value: string | number
  ) => {
    const newRoles = [...estimatedRoles];
    const roleToUpdate = { ...newRoles[index] };
    if (field === 'role') {
      roleToUpdate.role = value as string;
    } else {
      roleToUpdate.count = Number(value);
    }
    newRoles[index] = roleToUpdate;
    onUpdate({ estimatedRoles: newRoles });
  };
  
  const handleAddRole = () => {
    onUpdate({ estimatedRoles: [...estimatedRoles, { role: '', count: 1 }] });
  };

  const handleRemoveRole = (index: number) => {
    onUpdate({ estimatedRoles: estimatedRoles.filter((_, i) => i !== index) });
  };

  const handleCostChange = (field: keyof typeof costDetails, value: string) => {
    onUpdate({ costDetails: { ...costDetails, [field]: Number(value) } });
  };

  const handleTimelineChange = (
    index: number,
    field: 'month' | 'phase' | 'activity',
    value: string | number
  ) => {
    const newTimeline = [...estimatedTimeline];
    const itemToUpdate = { ...newTimeline[index] };
     if (field === 'month') {
      itemToUpdate.month = Number(value);
    } else if (field === 'phase') {
        itemToUpdate.phase = value as string;
    } else {
      itemToUpdate.activity = value as string;
    }
    newTimeline[index] = itemToUpdate;
    onUpdate({ estimatedTimeline: newTimeline });
  };

  const handleAddTimelineItem = () => {
    onUpdate({
      estimatedTimeline: [
        ...estimatedTimeline,
        { month: estimatedTimeline.length + 1, phase: '', activity: '' },
      ],
    });
  };

  const handleRemoveTimelineItem = (index: number) => {
    onUpdate({
      estimatedTimeline: estimatedTimeline.filter((_, i) => i !== index),
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
        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="roles"><Users className="mr-2"/>Tim</TabsTrigger>
            <TabsTrigger value="costs"><Wallet className="mr-2"/>Biaya</TabsTrigger>
            <TabsTrigger value="timeline"><GanttChartSquare className="mr-2"/>Linimasa</TabsTrigger>
            <TabsTrigger value="tech"><Cpu className="mr-2"/>Teknologi</TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            <TabsContent value="roles">
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 font-medium">
                  <Label>Peran</Label>
                  <Label>Jumlah</Label>
                  <div/>
                </div>
                <div className="space-y-2">
                  {estimatedRoles.map((role, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                      <Input
                        value={role.role}
                        onChange={(e) => handleRoleChange(index, 'role', e.target.value)}
                        placeholder="cth., Manajer Proyek"
                      />
                       <Input
                        type="number"
                        value={role.count}
                        onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                        className="w-20 text-center"
                        min={1}
                      />
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="technical-modal">Modal Teknis (IDR)</Label>
                    <Input id="technical-modal" type="number" value={costDetails.technicalModal} onChange={(e) => handleCostChange('technicalModal', e.target.value)} placeholder="cth., 5000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manpower">Tenaga Kerja (IDR)</Label>
                    <Input id="manpower" type="number" value={costDetails.manpower} onChange={(e) => handleCostChange('manpower', e.target.value)} placeholder="cth., 25000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="development">Pengembangan (IDR)</Label>
                    <Input id="development" type="number" value={costDetails.development} onChange={(e) => handleCostChange('development', e.target.value)} placeholder="cth., 10000000" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="profit-margin">Margin Keuntungan (IDR)</Label>
                    <Input id="profit-margin" type="number" value={costDetails.profitMargin} onChange={(e) => handleCostChange('profitMargin', e.target.value)} placeholder="cth., 10000000" />
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
              </div>
            </TabsContent>

            <TabsContent value="tech">
              <div className="space-y-4">
                <Label>Teknologi yang Disarankan</Label>
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
