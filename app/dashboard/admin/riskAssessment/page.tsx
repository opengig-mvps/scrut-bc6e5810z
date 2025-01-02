"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RiskData {
  id: number;
  riskStatus: string;
  riskTrends: any;
  alerts: any;
  createdAt: string;
}

const RiskAssessmentPage: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskData | null>(null);
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({ start: undefined, end: undefined });

  useEffect(() => {
    if (!session) return;
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session.user.id}/riskMonitors`);
        setRiskData(res.data.data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRiskData();
  }, [session]);

  const handleCreateRiskAssessment = async () => {
    try {
      setLoading(true);
      const payload = {
        riskData: {},
        assessmentParams: {},
      };

      const response = await api.post(
        `/api/users/${session?.user.id}/riskAssessments`,
        payload
      );

      if (response.data.success) {
        toast.success("Risk assessment created successfully!");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Risk Assessment</h2>
      <Card>
        <CardHeader>
          <CardTitle>Configure Assessment Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <DateTimePicker
              date={selectedDates.start}
              setDate={(date: any) =>
                setSelectedDates({ ...selectedDates, start: date })
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCreateRiskAssessment}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Creating Risk Assessment...
              </>
            ) : (
              "Create Risk Assessment"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Identified Risks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riskData?.map((risk) => (
            <Card key={risk?.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>Risk ID: {risk?.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Status: {risk?.riskStatus}
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRisk(risk)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Risk Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Trend</TableHead>
                            <TableHead>Alerts</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{risk?.riskTrends}</TableCell>
                            <TableCell>{risk?.alerts}</TableCell>
                            <TableCell>{risk?.createdAt}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentPage;