"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Globe, ArrowRight } from "lucide-react";
import { getResumeApi, updateResumeApi } from "@/apis/resume.api";
import { toast } from "sonner";
import StepHeader from "./StepHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  resumeId: string;
  onNext: () => void;
}

interface PersonalInfoForm {
  fullname: string;
  email: string;
  mobile: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

export default function PersonalInfoStep({ resumeId, onNext }: Props) {
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PersonalInfoForm>({
    defaultValues: {
      fullname: "",
      email: "",
      mobile: "",
      location: "",
      linkedIn: "",
      github: "",
      portfolio: "",
    }
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
        reset(res.data.personalInfo || {});
      } else {
        toast.error(res?.message || "Failed to load resume details");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while fetching resume data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: PersonalInfoForm) => {
    try {
      const res = await updateResumeApi(resumeId, {
        personalInfo: values,
      });

      if (res?.success) {
        toast.success("Personal Information saved successfully");
        onNext();
      } else {
        toast.error(res?.message || "Failed to save personal information");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong while saving");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-6 w-1/3 bg-slate-200" />
          <Skeleton className="h-2 w-full bg-slate-200" />
          <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <Skeleton className="h-10 w-1/4 bg-slate-200" />
            <Skeleton className="h-16 w-full bg-slate-200" />
            <Skeleton className="h-16 w-full bg-slate-200" />
            <Skeleton className="h-16 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <StepHeader step={1} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold text-slate-800">
              Personal Information
            </h1>
            <p className="text-slate-500 mt-2">
              Tell recruiters how they can reach you.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <InputField
                icon={<User size={18} />}
                placeholder="John Doe"
                label="Full Name"
                error={errors.fullname?.message}
                register={register("fullname", { required: "Full name is required" })}
              />

              {/* Email */}
              <InputField
                icon={<Mail size={18} />}
                placeholder="john@example.com"
                label="Email Address"
                error={errors.email?.message}
                register={register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />

              {/* Phone */}
              <InputField
                icon={<Phone size={18} />}
                placeholder="+91 9876543210"
                label="Phone Number"
                error={errors.mobile?.message}
                register={register("mobile", { required: "Phone number is required" })}
              />

              {/* Location */}
              <InputField
                icon={<MapPin size={18} />}
                placeholder="Bhopal, India"
                label="Location"
                error={errors.location?.message}
                register={register("location", { required: "Location is required" })}
              />

              {/* LinkedIn */}
              <InputField
                icon={<Globe size={18} />}
                placeholder="https://linkedin.com/in/..."
                label="LinkedIn Profile URL"
                error={errors.linkedIn?.message}
                register={register("linkedIn")}
              />

              {/* Github */}
              <InputField
                icon={<Globe size={18} />}
                placeholder="https://github.com/..."
                label="GitHub Profile URL"
                error={errors.github?.message}
                register={register("github")}
              />

              {/* Portfolio */}
              <div className="md:col-span-2">
                <InputField
                  icon={<Globe size={18} />}
                  placeholder="https://portfolio.com"
                  label="Portfolio Website URL"
                  error={errors.portfolio?.message}
                  register={register("portfolio")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

function InputField({ label, placeholder, icon, register, error }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          {...register}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}