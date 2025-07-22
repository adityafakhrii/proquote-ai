'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-technologies.ts';
import '@/ai/flows/analyze-project-requirements.ts';
import '@/ai/flows/get-salary-suggestion.ts';
