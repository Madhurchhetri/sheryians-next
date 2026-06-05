"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, FileText } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { generateSummaryApi } from "@/apis/ai.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function SummaryStep({ resumeId, onNext, onBack }: Props) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    fetchResume();
  }, [resumeId]);

  const fetchResume = async () => {
    if (!resumeId) return;
    try {
      setLoading(true);
      const res = await getResumeApi(resumeId);
      if (res?.success && res.data) {
        setResumeData(res.data);
        setSummary(res.data.summary || "");
      } else {
        toast.error(res?.message || "Failed to load summary details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching summary details");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!resumeData) return;
    try {
      setAiLoading(true);
      const jobTitle = resumeData.jobTitle || "Software Engineer";
      const experienceLevel = resumeData.experienceLevel || "Mid-Level";
      const skills = resumeData.skills || [];

      if (skills.length === 0) {
        toast.warning("Adding some skills in Step 3 will help the AI write a much better summary.");
      }

      toast.info("Generating professional summary...");

      const res = await generateSummaryApi({
        jobTitle,
        experienceLevel,
        skills,
      });

      if (res?.success && res.data?.summary) {
        setSummary(res.data.summary);
        toast.success("AI Summary generated successfully!");
      } else {
        toast.error(res?.message || "Failed to generate summary");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating summary");
    } finally {
      setAiLoading(false);
    }
  };

  const saveSummary = async () => {
    try {
      setSaveLoading(true);
      const res = await updateResumeApi(resumeId, {
        summary,
      });

      if (res?.success) {
        toast.success("Summary saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save summary");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving summary");
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
            <Skeleton className="h-32 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <StepHeader step={7} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <FileText className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Professional Summary</h1>
                <p className="text-slate-500 mt-1">
                  Introduce yourself to hiring managers and outline your key skills/ambitions.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              <Sparkles size={18} />
              {aiLoading ? "Generating..." : "Generate with AI"}
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <textarea
              rows={8}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="E.g., Results-driven Software Engineer with 4 years of experience building secure, scalable web platforms. Proficient in TypeScript, React, and Node.js, with a proven track record of optimizing database queries and boosting application performance by 30%..."
              className="w-full border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white leading-relaxed"
            />
            <div className="flex justify-end text-xs text-slate-400">
              Word count: {summary.trim() ? summary.trim().split(/\s+/).length : 0} (Recommended: 50-80 words)
            </div>
          </div>

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
              onClick={saveSummary}
              disabled={saveLoading || aiLoading}
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
