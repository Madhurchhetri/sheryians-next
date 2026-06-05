"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Award } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function CertificationsStep({ resumeId, onNext, onBack }: Props) {
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [resumeId]);

  const fetchResume = async () => {
    if (!resumeId) return;
    try {
      setLoading(true);
      const res = await getResumeApi(resumeId);
      if (res?.success && res.data) {
        setCertifications(res.data.certifications || []);
      } else {
        toast.error(res?.message || "Failed to load certifications");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching certifications");
    } finally {
      setLoading(false);
    }
  };

  const addCert = () => {
    const trimmed = certInput.trim();
    if (!trimmed) return;

    if (certifications.includes(trimmed)) {
      toast.warning(`${trimmed} has already been added!`);
      return;
    }

    setCertifications((prev) => [...prev, trimmed]);
    setCertInput("");
  };

  const removeCert = (index: number) => {
    setCertifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveCertifications = async () => {
    try {
      setSaveLoading(true);
      const res = await updateResumeApi(resumeId, {
        certifications,
      });

      if (res?.success) {
        toast.success("Certifications saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save certifications");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving certifications");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-6 w-1/3 bg-slate-200" />
          <Skeleton className="h-2 w-full bg-slate-200" />
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <Skeleton className="h-10 w-1/4 bg-slate-200" />
            <Skeleton className="h-12 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <StepHeader step={6} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 border-b pb-4">
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Award className="text-violet-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">Certifications & Achievements</h1>
              <p className="text-slate-500 mt-1">
                List relevant industry certifications, awards, or personal achievements.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCert();
                }
              }}
              placeholder="E.g., AWS Certified Solutions Architect, Hackathon Winner 2025"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />

            <button
              onClick={addCert}
              type="button"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* List of Certifications */}
          {certifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed rounded-xl mt-6">
              No certifications or achievements added yet. Use the input above to add them.
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4 transition hover:bg-slate-100/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span className="font-medium text-slate-700">{cert}</span>
                  </div>
                  <button
                    onClick={() => removeCert(index)}
                    className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between mt-12 border-t border-slate-100 pt-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              onClick={saveCertifications}
              disabled={saveLoading}
              className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saveLoading ? "Saving..." : "Continue"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
