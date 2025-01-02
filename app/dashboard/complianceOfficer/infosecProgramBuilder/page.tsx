'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-picker';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoaderCircleIcon, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label'; // Import Label component

const InfosecProgramBuilder: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [versionControl, setVersionControl] = useState<any>({});
  const [permissions, setPermissions] = useState<any>({});
  const [selectedDates, setSelectedDates] = useState<{ start: Date | undefined, end: Date | undefined }>({ start: undefined, end: undefined });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session?.user.id}/infosecPrograms`);
        setTemplates(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [session]);

  const createInfosecProgram = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        template: selectedTemplate,
        customization: customizations,
        versionControl,
        permissions,
      };

      const response = await api.post(`/api/users/${session?.user.id}/infosecPrograms`, payload);

      if (response.data.success) {
        toast.success('Infosec program created successfully');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Create Information Security Program</h2>
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Select onValueChange={(value) => setSelectedTemplate(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template: any) => (
                  <SelectItem key={template?.id} value={template?.template}>
                    {template?.template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="customization">
              <AccordionTrigger>Customization</AccordionTrigger>
              <AccordionContent>
                <Button variant="outline" onClick={() => setCustomizations([...customizations, {}])}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customization
                </Button>
                {customizations?.map((customization: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter customization"
                      className="border p-2 rounded"
                      onChange={(e) => {
                        const newCustomizations = [...customizations];
                        newCustomizations[index] = e.target.value;
                        setCustomizations(newCustomizations);
                      }}
                    />
                    <Button variant="ghost" onClick={() => setCustomizations(customizations.filter((_, i) => i !== index))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2">
            <Label>Version Control</Label>
            <input
              type="text"
              placeholder="Enter version control details"
              className="border p-2 rounded w-full"
              onChange={(e) => setVersionControl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <input
              type="text"
              placeholder="Enter permissions"
              className="border p-2 rounded w-full"
              onChange={(e) => setPermissions(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Program Dates</Label>
            <DateTimePicker
              date={selectedDates.start}
              setDate={(date: any) => setSelectedDates({ ...selectedDates, start: date })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={createInfosecProgram} disabled={loading}>
            {loading ? <LoaderCircleIcon className="animate-spin" /> : 'Create Program'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InfosecProgramBuilder;