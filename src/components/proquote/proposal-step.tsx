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

  const today = format(new Date(), 'MMMM d, yyyy');

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
                Project Proposal
              </CardTitle>
              <CardDescription className="pt-2">
                Prepared on: {today}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-primary no-print">
               <Logo className="h-10 w-10" />
               <span className="text-xl font-bold font-headline">ProQuoteAI</span>
            </div>
          </div>
          <Separator className="my-6" />
          <h2 className="text-2xl font-headline font-semibold">
            Project Overview for: {fileName.replace('.pdf', '')}
          </h2>
          <p className="text-muted-foreground">
            This document outlines the estimated scope, resources, timeline, and
            technology stack for the proposed project based on the provided

            requirements.
          </p>
        </CardHeader>
        <CardContent className="px-8 space-y-8">
          {/* Roles */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Users className="mr-3 h-6 w-6 text-accent" />
              Required Roles
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
              Estimated Labor Costs
            </h3>
            <p className="text-4xl font-bold font-headline text-primary">
              ${new Intl.NumberFormat().format(estimatedLaborCosts)}
            </p>
            <p className="text-sm text-muted-foreground">
              This is an estimate and may be subject to change based on final
              scope.
            </p>
          </section>

          <Separator />

          {/* Timeline */}
          <section>
            <h3 className="flex items-center text-xl font-headline font-semibold mb-4">
              <Calendar className="mr-3 h-6 w-6 text-accent" />
              Estimated Project Timeline
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
              Suggested Technology Stack
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
                This proposal was generated with the assistance of AI. All estimates are for planning purposes and should be validated by project stakeholders.
            </p>
        </CardFooter>
      </Card>
      
      <div className="flex justify-between no-print">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
        </Button>
        <Button onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> Export to PDF
        </Button>
      </div>
    </div>
  );
}
