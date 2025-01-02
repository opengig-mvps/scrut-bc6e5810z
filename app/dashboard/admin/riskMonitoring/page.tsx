"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Bell } from "lucide-react";

const RiskMonitoringDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!session) return;
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users/${session?.user.id}/riskMonitors`);
        if (response.data.success) {
          setRiskData(response.data.data);
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRiskData();
  }, [session]);

  const filteredRiskData = riskData?.filter((risk) =>
    risk?.riskStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Risk Monitoring Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage risks in real-time</p>
      </header>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search risks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />
        <Button variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="riskStatus" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="riskTrends" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No significant alerts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Status</TableHead>
                <TableHead>Trends</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRiskData?.map((risk) => (
                <TableRow key={risk?.id}>
                  <TableCell>{risk?.riskStatus}</TableCell>
                  <TableCell>{JSON.stringify(risk?.riskTrends)}</TableCell>
                  <TableCell>{JSON.stringify(risk?.alerts)}</TableCell>
                  <TableCell>{new Date(risk?.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogAction>Export Data</AlertDialogAction>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Risk Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to export the risk data? This action will generate a CSV file with the current risk information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Export</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RiskMonitoringDashboard;