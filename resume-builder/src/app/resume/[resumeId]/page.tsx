"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PersonalInfoStep from "@/components/PersonalInfoStep";
import EducationStep from "@/components/EducationStep";
import SkillsStep from "@/components/SkillsStep";
import ProjectsStep from "@/components/ProjectSetup";
import ExperienceStep from "@/components/ExperienceStep";
import CertificationsStep from "@/components/CertificationsStep";
import SummaryStep from "@/components/SummaryStep";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const resumeId = params.resumeId as string;
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step === 8) {
      router.push(`/resume/${resumeId}/preview`);
    }
  }, [step, resumeId, router]);

  return (
    <>
      {step === 1 && (
        <PersonalInfoStep resumeId={resumeId} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <EducationStep
          resumeId={resumeId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <SkillsStep
          resumeId={resumeId}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <ProjectsStep
          resumeId={resumeId}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <ExperienceStep
          resumeId={resumeId}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
        />
      )}

      {step === 6 && (
        <CertificationsStep
          resumeId={resumeId}
          onBack={() => setStep(5)}
          onNext={() => setStep(7)}
        />
      )}

      {step === 7 && (
        <SummaryStep
          resumeId={resumeId}
          onBack={() => setStep(6)}
          onNext={() => setStep(8)}
        />
      )}

      {step === 8 && (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-slate-200 animate-spin border-4 border-t-violet-600" />
          <h2 className="text-xl font-semibold text-slate-700">Loading Resume Preview...</h2>
        </div>
      )}
    </>
  );
}