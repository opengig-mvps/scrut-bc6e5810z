"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircleIcon, DollarSign } from "lucide-react";

const PaymentProcessingPage: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  useEffect(() => {
    if (!session) return;

    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session?.user.id}/payments`);
        setPaymentHistory(res.data.data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [session]);

  const createPaymentSession = async () => {
    try {
      setLoading(true);
      const payload = {
        amount,
        paymentMethod,
        subscriptionInfo: {},
        invoice: "Invoice for payment",
      };

      const res = await api.post("/api/payments/stripe/create-session", payload);

      if (res.data.success) {
        toast.success("Payment session created successfully!");
        window.location.href = res.data.data.sessionUrl;
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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Payment Processing</h2>
      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e: any) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`p-4 flex flex-col items-center justify-center rounded-lg border ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              } transition-colors aspect-square`}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod("paypal")}
              className={`p-4 flex flex-col items-center justify-center rounded-lg border ${
                paymentMethod === "paypal"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              } transition-colors aspect-square`}
            >
              <span className="text-2xl mb-2">P</span>
              <span className="text-sm">Paypal</span>
            </button>
            <button
              onClick={() => setPaymentMethod("apple")}
              className={`p-4 flex flex-col items-center justify-center rounded-lg border ${
                paymentMethod === "apple"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              } transition-colors aspect-square`}
            >
              <span className="text-2xl mb-2">⌘</span>
              <span className="text-sm">Apple</span>
            </button>
          </div>

          <Button
            className="w-full"
            onClick={createPaymentSession}
            disabled={loading}
          >
            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Proceed to Payment"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Payment History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory?.map((payment: any) => (
              <TableRow key={payment?.id}>
                <TableCell>{new Date(payment?.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${payment?.amount}</TableCell>
                <TableCell>{payment?.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;