"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles, Briefcase } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { generateExperienceApi } from "@/apis/ai.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface FormValues {
  workExperience: ExperienceItem[];
}

export default function ExperienceStep({ resumeId, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      workExperience: [
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperience",
  });

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
        if (res.data.workExperience?.length) {
          reset({
            workExperience: res.data.workExperience,
          });
        }
      } else {
        toast.error(res?.message || "Failed to load experience details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching experience data");
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async (index: number) => {
    try {
      const exp = watch(`workExperience.${index}`);
      if (!exp.position) {
        toast.warning("Please enter a Job Title/Position first to generate a description.");
        return;
      }

      setGeneratingIndex(index);
      toast.info("Generating description using AI...");

      const experienceLevel = resumeData?.experienceLevel || "Mid-Level";
      const techStack = resumeData?.skills || ["React", "Node.js"]; // fallback if skills are empty

      const res = await generateExperienceApi({
        jobRole: exp.position,
        experienceLevel,
        techStack,
      });

      if (res?.success && res.data?.workExperienceDescription) {
        setValue(`workExperience.${index}.description`, res.data.workExperienceDescription);
        toast.success("AI Experience description generated!");
      } else {
        toast.error(res?.message || "Failed to generate description");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during description generation");
    } finally {
      setGeneratingIndex(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await updateResumeApi(resumeId, {
        workExperience: values.workExperience,
      });

      if (res?.success) {
        toast.success("Work experience saved successfully");
        onNext(); // Advance to Step 6
      } else {
        toast.error(res?.message || "Failed to save work experience");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong while saving");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-6 w-1/3 bg-slate-200" />
          <Skeleton className="h-2 w-full bg-slate-200" />
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <Skeleton className="h-10 w-1/4 bg-slate-200" />
            <Skeleton className="h-48 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <StepHeader step={5} />

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Briefcase className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Work Experience</h1>
                <p className="text-slate-500 mt-1">
                  Showcase your professional work history.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 font-medium cursor-pointer"
            >
              <Plus size={18} />
              Add Experience
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-slate-200 rounded-2xl p-6 relative bg-slate-50/50">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                    <input
                      {...register(`workExperience.${index}.company`, { required: "Company name is required" })}
                      placeholder="Google Inc."
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.workExperience?.[index]?.company && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperience[index]?.company?.message}
                      </p>
                    )}
                  </div>

                  {/* Job Title / Position */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Job Title / Position</label>
                    <input
                      {...register(`workExperience.${index}.position`, { required: "Position is required" })}
                      placeholder="Senior Full Stack Engineer"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.workExperience?.[index]?.position && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperience[index]?.position?.message}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      {...register(`workExperience.${index}.startDate`, { required: "Start date is required" })}
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.workExperience?.[index]?.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperience[index]?.startDate?.message}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date (leave blank if current)</label>
                    <input
                      type="date"
                      {...register(`workExperience.${index}.endDate`)}
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">Role Description & Accomplishments</label>
                    <button
                      type="button"
                      disabled={generatingIndex !== null}
                      onClick={() => generateDescription(index)}
                      className="flex items-center gap-2 bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-xl transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Sparkles size={16} />
                      {generatingIndex === index ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    {...register(`workExperience.${index}.description`)}
                    placeholder="Describe your primary responsibilities, key achievements, and metrics of success..."
                    className="w-full border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="flex justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="border px-6 py-3 rounded-xl border-slate-300 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting || generatingIndex !== null}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Continue"}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}