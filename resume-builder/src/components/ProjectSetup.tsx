"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles, FolderGit2 } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { generateProjectDescriptionApi } from "@/apis/ai.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface Project {
  title: string;
  techStack: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
}

interface FormValues {
  projects: Project[];
}

export default function ProjectsStep({ resumeId, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const {
    register,
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      projects: [
        {
          title: "",
          techStack: "",
          description: "",
          githubUrl: "",
          liveUrl: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
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
        if (res.data.projects?.length) {
          reset({
            projects: res.data.projects.map((project: any) => ({
              ...project,
              techStack: Array.isArray(project.techStack)
                ? project.techStack.join(", ")
                : "",
            })),
          });
        }
      } else {
        toast.error(res?.message || "Failed to load project details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async (index: number) => {
    try {
      const project = watch(`projects.${index}`);
      if (!project.title) {
        toast.warning("Please enter a Project Title first to generate a description.");
        return;
      }
      if (!project.techStack) {
        toast.warning("Please add some Tech Stack (e.g. React, Next.js) to guide the AI.");
        return;
      }

      setGeneratingIndex(index);
      toast.info("Generating project description using AI...");

      const jobTitle = resumeData?.jobTitle || "Software Engineer";
      const experienceLevel = resumeData?.experienceLevel || "Mid-Level";
      const techStackArr = project.techStack.split(",").map((tech) => tech.trim());

      const res = await generateProjectDescriptionApi({
        jobTitle,
        experienceLevel,
        techStack: techStackArr,
      });

      if (res?.success && res.data?.projectDescription) {
        setValue(`projects.${index}.description`, res.data.projectDescription);
        toast.success("AI Project description generated!");
      } else {
        toast.error(res?.message || "Failed to generate project description");
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
      const formattedProjects = values.projects.map((project) => ({
        ...project,
        techStack: project.techStack
          ? project.techStack.split(",").map((tech) => tech.trim())
          : [],
      }));

      const res = await updateResumeApi(resumeId, {
        projects: formattedProjects,
      });

      if (res?.success) {
        toast.success("Projects saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save projects");
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
        <StepHeader step={4} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <FolderGit2 className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Projects</h1>
                <p className="text-slate-500 mt-1">Showcase your best engineering work.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  techStack: "",
                  description: "",
                  githubUrl: "",
                  liveUrl: "",
                })
              }
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl shadow-md transition font-medium cursor-pointer"
            >
              <Plus size={18} />
              Add Project
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
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                    <input
                      {...register(`projects.${index}.title`, { required: "Project title is required" })}
                      placeholder="E-Commerce API Platform"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                    {errors.projects?.[index]?.title && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.projects[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tech Stack (comma separated)</label>
                    <input
                      {...register(`projects.${index}.techStack`)}
                      placeholder="React, Next.js, Node.js, MongoDB"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">GitHub URL</label>
                    <input
                      {...register(`projects.${index}.githubUrl`)}
                      placeholder="https://github.com/yourusername/project"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>

                  {/* Live URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Live Demo URL</label>
                    <input
                      {...register(`projects.${index}.liveUrl`)}
                      placeholder="https://myproject.com"
                      className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">Project Description</label>
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
                    rows={5}
                    {...register(`projects.${index}.description`)}
                    placeholder="Describe what you built, the key features, and your engineering impact..."
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
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting || generatingIndex !== null}
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