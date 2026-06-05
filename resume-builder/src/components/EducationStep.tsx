"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { GraduationCap, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface EducationForm {
  education: {
    institute: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
}

export default function EducationStep({ resumeId, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<EducationForm>({
    defaultValues: {
      education: [
        {
          institute: "",
          degree: "",
          startDate: "",
          endDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
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
        if (res.data.education && res.data.education.length > 0) {
          reset({
            education: res.data.education,
          });
        }
      } else {
        toast.error(res?.message || "Failed to load education details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching education data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: EducationForm) => {
    try {
      const res = await updateResumeApi(resumeId, {
        education: values.education,
      });

      if (res?.success) {
        toast.success("Education background saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save education details");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "An error occurred while saving");
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
        <StepHeader step={2} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8 border-b pb-4">
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <GraduationCap className="text-violet-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">Education</h1>
              <p className="text-slate-500 mt-1">Add your educational background.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-slate-200 rounded-2xl p-6 relative bg-slate-50/50"
              >
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Institute */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Institute
                    </label>
                    <input
                      {...register(`education.${index}.institute`, { required: "Institute name is required" })}
                      placeholder="Lakshmi Narain College of Technology"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.education?.[index]?.institute && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.education[index]?.institute?.message}
                      </p>
                    )}
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Degree
                    </label>
                    <input
                      {...register(`education.${index}.degree`, { required: "Degree/Field of study is required" })}
                      placeholder="B.Tech Computer Science"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.education?.[index]?.degree && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.education[index]?.degree?.message}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`education.${index}.startDate`, { required: "Start date is required" })}
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.education?.[index]?.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.education[index]?.startDate?.message}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date (or Expected)
                    </label>
                    <input
                      type="date"
                      {...register(`education.${index}.endDate`)}
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Education */}
            <button
              type="button"
              onClick={() =>
                append({
                  institute: "",
                  degree: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="flex items-center gap-2 border border-violet-300 text-violet-600 px-5 py-3 rounded-xl hover:bg-violet-50 transition font-medium cursor-pointer"
            >
              <Plus size={18} />
              Add Education
            </button>

            {/* Footer */}
            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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