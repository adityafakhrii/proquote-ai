'use client';

import type { ClientProfile } from '@/app/page';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Wand2 } from 'lucide-react';

interface ClientProfileStepProps {
  clientProfile: ClientProfile;
  setClientProfile: (profile: ClientProfile) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ClientProfileStep({
  clientProfile,
  setClientProfile,
  onNext,
  onBack,
}: ClientProfileStepProps) {
  
  const handleProfileChange = (field: keyof ClientProfile, value: string) => {
    setClientProfile({ ...clientProfile, [field]: value });
  };
  
  const isFormValid = clientProfile.recipientName && clientProfile.companyName;

  return (
    <Card className="w-full animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Profil Klien</CardTitle>
        <CardDescription>
          Jelaskan siapa klien Anda. AI akan menyesuaikan estimasi proposal berdasarkan informasi ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="recipient-name">Nama Penerima/PIC</Label>
                <Input
                    id="recipient-name"
                    placeholder="cth., Bapak Budi"
                    value={clientProfile.recipientName}
                    onChange={(e) => handleProfileChange('recipientName', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-name">Nama Perusahaan Klien</Label>
                <Input
                    id="company-name"
                    placeholder="cth., PT. Jaya Abadi"
                    value={clientProfile.companyName}
                    onChange={(e) => handleProfileChange('companyName', e.target.value)}
                />
            </div>
        </div>
        <div className="space-y-3">
          <Label>Jenis/Skala Perusahaan</Label>
          <RadioGroup
            value={clientProfile.profileType}
            onValueChange={(value) => handleProfileChange('profileType', value)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="startup" id="startup" />
              <Label htmlFor="startup" className="font-normal cursor-pointer">Startup / UKM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multinational" id="multinational" />
              <Label htmlFor="multinational" className="font-normal cursor-pointer">Korporat / Multinasional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="government" id="government" />
              <Label htmlFor="government" className="font-normal cursor-pointer">Pemerintah / BUMN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">Lainnya</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
         <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Button
          onClick={onNext}
          disabled={!isFormValid}
        >
            <Wand2 className="mr-2 h-5 w-5" />
            Analisis & Buat Estimasi
        </Button>
      </CardFooter>
    </Card>
  );
}
