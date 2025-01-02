'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-picker';
import { Loader } from 'lucide-react'; // Assuming Loader is the correct icon from lucid-react

const ComplianceAuditManagement: React.FC = () => {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [auditForm, setAuditForm] = useState({
    auditType: '',
    requirements: '',
    documentation: '',
    status: '',
    reminders: '',
  });

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session?.user.id}/complianceAudits`);
        setAudits(res.data.data);
      } catch (error: any) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message ?? 'Something went wrong');
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, [session]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setAuditForm({ ...auditForm, [name]: value });
  };

  const createAudit = async () => {
    try {
      setLoading(true);
      const payload = {
        auditType: auditForm.auditType,
        requirements: JSON.parse(auditForm.requirements),
        documentation: JSON.parse(auditForm.documentation),
        status: auditForm.status,
        reminders: JSON.parse(auditForm.reminders),
      };

      const response = await api.post(`/api/users/${session?.user.id}/complianceAudits`, payload);

      if (response.data.success) {
        toast.success('Compliance audit created successfully!');
        setAuditForm({
          auditType: '',
          requirements: '',
          documentation: '',
          status: '',
          reminders: '',
        });
        setAudits([...audits, response.data.data]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Compliance Audit Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audits?.map((audit) => (
          <Card key={audit?.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{audit?.auditType}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Status: {audit?.status}</p>
              <p className="text-sm text-muted-foreground">Created At: {new Date(audit?.createdAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setSelectedAudit(audit as any)}>
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>{selectedAudit?.auditType}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requirement</TableHead>
                          <TableHead>Documentation</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedAudit?.requirements?.map((requirement: any, index: any) => (
                          <TableRow key={index}>
                            <TableCell>{requirement}</TableCell>
                            <TableCell>{selectedAudit?.documentation[index]}</TableCell>
                            <TableCell>{selectedAudit?.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Add New Audit</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="auditType">Audit Type</label>
            <input
              id="auditType"
              name="auditType"
              value={auditForm.auditType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter audit type"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements">Requirements (JSON)</label>
            <textarea
              id="requirements"
              name="requirements"
              value={auditForm.requirements}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder='Enter requirements as JSON, e.g. ["requirement1", "requirement2"]'
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="documentation">Documentation (JSON)</label>
            <textarea
              id="documentation"
              name="documentation"
              value={auditForm.documentation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder='Enter documentation as JSON, e.g. ["doc1", "doc2"]'
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status">Status</label>
            <input
              id="status"
              name="status"
              value={auditForm.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter status"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reminders">Reminders (JSON)</label>
            <textarea
              id="reminders"
              name="reminders"
              value={auditForm.reminders}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder='Enter reminders as JSON, e.g. ["reminder1", "reminder2"]'
            />
          </div>

          <Button className="w-full" onClick={createAudit}>
            {loading ? <Loader className="animate-spin" /> : 'Add Audit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceAuditManagement;