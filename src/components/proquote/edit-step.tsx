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
import { ArrowLeft, ArrowRight, DollarSign, Plus, Trash2, Users, Cpu, Calendar } from 'lucide-react';

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
    estimatedLaborCosts,
    estimatedTimeline,
    suggestedTechnologies,
  } = analysisResult;

  const handleListChange = (
    listName: 'estimatedRoles' | 'suggestedTechnologies',
    index: number,
    value: string
  ) => {
    const newList = [...analysisResult[listName]];
    newList[index] = value;
    onUpdate({ [listName]: newList });
  };

  const handleAddItem = (
    listName: 'estimatedRoles' | 'suggestedTechnologies'
  ) => {
    const newList = [...analysisResult[listName], ''];
    onUpdate({ [listName]: newList });
  };

  const handleRemoveItem = (
    listName: 'estimatedRoles' | 'suggestedTechnologies',
    index: number
  ) => {
    const newList = analysisResult[listName].filter((_, i) => i !== index);
    onUpdate({ [listName]: newList });
  };

  return (
    <Card className="w-full animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Review & Adjust Estimates
        </CardTitle>
        <CardDescription>
          Fine-tune the AI-generated estimates to match your expertise and project
          specifics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="roles"><Users className="mr-2"/>Roles</TabsTrigger>
            <TabsTrigger value="costs"><DollarSign className="mr-2"/>Costs</TabsTrigger>
            <TabsTrigger value="timeline"><Calendar className="mr-2"/>Timeline</TabsTrigger>
            <TabsTrigger value="tech"><Cpu className="mr-2"/>Tech</TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            <TabsContent value="roles">
              <div className="space-y-4">
                <Label>Required Roles</Label>
                <div className="space-y-2">
                  {estimatedRoles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={role}
                        onChange={(e) =>
                          handleListChange('estimatedRoles', index, e.target.value)
                        }
                        placeholder="e.g., Project Manager"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem('estimatedRoles', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddItem('estimatedRoles')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="costs">
              <div className="space-y-2">
                <Label htmlFor="labor-costs">Estimated Labor Costs (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="labor-costs"
                    type="number"
                    value={estimatedLaborCosts}
                    onChange={(e) =>
                      onUpdate({ estimatedLaborCosts: Number(e.target.value) })
                    }
                    className="pl-8"
                    placeholder="50000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-2">
                <Label htmlFor="timeline">Estimated Timeline (Gantt Chart Format)</Label>
                <Textarea
                  id="timeline"
                  value={estimatedTimeline}
                  onChange={(e) => onUpdate({ estimatedTimeline: e.target.value })}
                  rows={10}
                  placeholder="Task Name - YYYY-MM-DD to YYYY-MM-DD"
                  className="font-code"
                />
                <p className="text-sm text-muted-foreground">
                  Each task should be on a new line. Format: Task - YYYY-MM-DD to YYYY-MM-DD
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tech">
              <div className="space-y-4">
                <Label>Suggested Technologies</Label>
                <div className="space-y-2">
                  {suggestedTechnologies.map((tech, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={tech}
                        onChange={(e) =>
                          handleListChange('suggestedTechnologies', index, e.target.value)
                        }
                        placeholder="e.g., React, Next.js"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem('suggestedTechnologies', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddItem('suggestedTechnologies')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Technology
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Generate Proposal <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
