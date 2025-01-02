"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoaderCircleIcon } from "lucide-react";

const CustomerTrustShowcase: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [certifications, setCertifications] = useState<string>("");
  const [branding, setBranding] = useState<string>("");
  const [testimonials, setTestimonials] = useState<string>("");
  const [seoElements, setSeoElements] = useState<string>("");
  const [accessibility, setAccessibility] = useState<string>("");

  const handleCreateShowcase = async () => {
    try {
      setLoading(true);
      const payload = {
        certifications: JSON.parse(certifications),
        branding: JSON.parse(branding),
        testimonials: JSON.parse(testimonials),
        seoElements: JSON.parse(seoElements),
        accessibility: JSON.parse(accessibility),
      };

      const response = await api.post(
        `/api/users/${session?.user.id}/customerShowcases`,
        payload
      );

      if (response.data.success) {
        toast.success("Customer showcase created successfully!");
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
    <div className="flex flex-col h-screen">
      <header className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Customer Trust Showcase</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Compliance Certifications Showcase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="Enter certifications JSON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branding">Branding</Label>
              <Textarea
                id="branding"
                value={branding}
                onChange={(e) => setBranding(e.target.value)}
                placeholder="Enter branding JSON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonials">Testimonials</Label>
              <Textarea
                id="testimonials"
                value={testimonials}
                onChange={(e) => setTestimonials(e.target.value)}
                placeholder="Enter testimonials JSON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoElements">SEO Elements</Label>
              <Textarea
                id="seoElements"
                value={seoElements}
                onChange={(e) => setSeoElements(e.target.value)}
                placeholder="Enter SEO elements JSON"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessibility">Accessibility</Label>
              <Textarea
                id="accessibility"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="Enter accessibility JSON"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleCreateShowcase}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                "Create Showcase"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="bg-white p-4 shadow-md">
        <p>Footer content goes here.</p>
      </footer>
    </div>
  );
};

export default CustomerTrustShowcase;