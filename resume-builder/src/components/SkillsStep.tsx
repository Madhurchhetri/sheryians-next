"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { generateSkillsApi } from "@/apis/ai.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function SkillsStep({ resumeId, onNext, onBack }: Props) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
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
        setSkills(res.data.skills || []);
      } else {
        toast.error(res?.message || "Failed to load skills details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching skills");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (skills.includes(trimmed)) {
      toast.warning(`${trimmed} is already added!`);
      return;
    }

    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const generateSkills = async () => {
    if (!resumeData) return;
    try {
      setAiLoading(true);
      const jobTitle = resumeData.jobTitle || "Software Engineer";
      const experienceLevel = resumeData.experienceLevel || "Mid-Level";

      toast.info(`Generating skills for "${jobTitle}" (${experienceLevel})...`);

      const res = await generateSkillsApi({
        jobTitle,
        experienceLevel,
      });

      if (res?.success && res.data?.skills) {
        setSkills(res.data.skills);
        toast.success("AI Skills generated successfully!");
      } else {
        toast.error(res?.message || "AI failed to generate skills");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating skills");
    } finally {
      setAiLoading(false);
    }
  };

  const saveSkills = async () => {
    try {
      setSaveLoading(true);
      const res = await updateResumeApi(resumeId, {
        skills,
      });

      if (res?.success) {
        toast.success("Skills saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save skills");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving skills");
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
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 bg-slate-200 rounded-full" />
              <Skeleton className="h-8 w-24 bg-slate-200 rounded-full" />
              <Skeleton className="h-8 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <StepHeader step={3} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Skills</h1>
              <p className="text-slate-500 mt-1">
                Add skills relevant to your role (e.g., {resumeData?.jobTitle || "Software Engineer"}).
              </p>
            </div>

            <button
              onClick={generateSkills}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              <Sparkles size={18} />
              {aiLoading ? "Generating..." : "Generate with AI"}
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Enter skill (e.g., JavaScript, React, System Design) and press Enter"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            />

            <button
              onClick={addSkill}
              type="button"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Skills tags */}
          {skills.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed rounded-xl mt-6">
              No skills added yet. Use the input above or generate with AI.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-8">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 px-4 py-2 rounded-full font-medium"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-violet-400 hover:text-violet-600 transition cursor-pointer"
                  >
                    <X size={16} />
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
              onClick={saveSkills}
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