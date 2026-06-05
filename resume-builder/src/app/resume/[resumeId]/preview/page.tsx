"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, Download, Sparkles, ArrowLeft, CheckCircle, AlertCircle, X, ExternalLink } from "lucide-react";
import { getResumeApi } from "@/apis/resume.api";
import { getATSScoreApi } from "@/apis/ai.api";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";

interface Resume {
  title: string;
  summary: string;
  jobTitle: string;
  experienceLevel: string;
  personalInfo: {
    fullname: string;
    email: string;
    mobile: string;
    location: string;
    github: string;
    linkedIn: string;
    portfolio: string;
  };
  education: {
    institute: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    githubUrl: string;
    liveUrl: string;
  }[];
  workExperience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  certifications: string[];
}

interface AtsReport {
  atsScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export default function ResumePreviewPage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [atsLoading, setAtsLoading] = useState(false);
  const [showAtsPanel, setShowAtsPanel] = useState(false);
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const { resumeId } = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchResume();
  }, [resumeId]);

  const fetchResume = async () => {
    if (!resumeId) return;
    try {
      setLoading(true);
      const res = await getResumeApi(resumeId as string);
      if (res?.success && res.data) {
        setResume(res.data);
      } else {
        toast.error(res?.message || "Failed to load resume preview");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching the resume");
    } finally {
      setLoading(false);
    }
  };

  const serializeResumeText = (res: Resume) => {
    return `
      FULL NAME: ${res.personalInfo?.fullname || ""}
      EMAIL: ${res.personalInfo?.email || ""}
      PHONE: ${res.personalInfo?.mobile || ""}
      LOCATION: ${res.personalInfo?.location || ""}
      GITHUB: ${res.personalInfo?.github || ""}
      LINKEDIN: ${res.personalInfo?.linkedIn || ""}
      PORTFOLIO: ${res.personalInfo?.portfolio || ""}
      
      JOB TITLE: ${res.jobTitle || ""}
      EXPERIENCE LEVEL: ${res.experienceLevel || ""}
      
      PROFESSIONAL SUMMARY:
      ${res.summary || ""}
      
      SKILLS:
      ${res.skills?.join(", ") || ""}
      
      WORK EXPERIENCE:
      ${res.workExperience?.map(w => `
        - Company: ${w.company}
          Position: ${w.position}
          Dates: ${w.startDate} to ${w.endDate}
          Description: ${w.description}
      `).join("\n") || ""}
      
      PROJECTS:
      ${res.projects?.map(p => `
        - Title: ${p.title}
          Tech Stack: ${p.techStack?.join(", ")}
          Description: ${p.description}
          GitHub: ${p.githubUrl}
          Demo: ${p.liveUrl}
      `).join("\n") || ""}
      
      EDUCATION:
      ${res.education?.map(e => `
        - Institute: ${e.institute}
          Degree: ${e.degree}
          Dates: ${e.startDate} to ${e.endDate}
      `).join("\n") || ""}
      
      CERTIFICATIONS:
      ${res.certifications?.join(", ") || ""}
    `;
  };

  const handleCalculateAts = async () => {
    if (!resume) return;
    try {
      setAtsLoading(true);
      setShowAtsPanel(true);
      toast.info("AI is evaluating your resume ATS score...");

      const resumeText = serializeResumeText(resume);
      const res = await getATSScoreApi({ resumeText });

      if (res?.success && res.data?.AtsScore) {
        let cleanText = res.data.AtsScore;
        // Strip out code block wrappers if any
        if (cleanText.includes("```")) {
          cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();
        }
        const parsed = JSON.parse(cleanText) as AtsReport;
        setAtsReport(parsed);
        toast.success("ATS Audit report completed!");
      } else {
        toast.error(res?.message || "Failed to calculate ATS score");
        setShowAtsPanel(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse ATS report details");
      setShowAtsPanel(false);
    } finally {
      setAtsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("resume-preview-sheet");
    if (!element || !resume) return;

    try {
      setPdfGenerating(true);
      toast.info("Generating your PDF file...");

      // --- Fix for html2canvas: convert oklch() to rgb() ---
      // html2canvas parses raw CSS stylesheets and chokes on oklch() colors
      // from Tailwind v4. Strategy:
      //   1. Inline ALL computed styles as rgb() on every element
      //   2. Disable all stylesheets so html2canvas never sees oklch()
      //   3. Render with html2canvas (sees only inline rgb styles)
      //   4. Restore everything

      const allElements = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];
      const savedCssText: string[] = [];

      allElements.forEach((el) => {
        savedCssText.push(el.style.cssText);
        const computed = window.getComputedStyle(el);

        // Inline every color-related property as browser-computed rgb()
        el.style.color = computed.color;
        el.style.backgroundColor = computed.backgroundColor;
        el.style.borderColor = computed.borderColor;
        el.style.borderTopColor = computed.borderTopColor;
        el.style.borderRightColor = computed.borderRightColor;
        el.style.borderBottomColor = computed.borderBottomColor;
        el.style.borderLeftColor = computed.borderLeftColor;
        el.style.outlineColor = computed.outlineColor;
        el.style.textDecorationColor = computed.textDecorationColor;
        el.style.boxShadow = computed.boxShadow;
        el.style.caretColor = computed.caretColor;
      });

      // Remove outer shadow/border for clean PDF
      element.style.boxShadow = "none";
      element.style.border = "none";

      // Disable ALL stylesheets so html2canvas can't find oklch() in them
      const stylesheets = Array.from(document.styleSheets);
      const sheetDisabledState = stylesheets.map((s) => s.disabled);
      stylesheets.forEach((s) => { s.disabled = true; });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Re-enable stylesheets immediately
      stylesheets.forEach((s, i) => { s.disabled = sheetDisabledState[i]; });

      // Restore all original inline styles
      allElements.forEach((el, i) => {
        el.style.cssText = savedCssText[i];
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${resume.personalInfo?.fullname.replace(/\s+/g, "_") || "resume"}_CV.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while compiling the PDF");
    } finally {
      setPdfGenerating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-6 flex justify-center items-center">
        <div className="max-w-4xl w-full space-y-6">
          <Skeleton className="h-10 w-1/4 bg-slate-200" />
          <div className="grid lg:grid-cols-4 gap-8">
            <Skeleton className="h-64 lg:col-span-1 bg-slate-200 rounded-3xl" />
            <Skeleton className="h-[800px] lg:col-span-3 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="text-2xl font-bold text-slate-800">Resume Not Found</h2>
        <Link href="/resume" className="text-violet-600 font-semibold underline">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans relative overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Top Bar */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => router.push("/resume")}
          className="flex items-center gap-2 text-slate-600 hover:text-violet-600 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <span className="font-bold text-slate-700">{resume.title}</span>
        <div className="w-10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Actions sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
              <h2 className="font-bold text-xl text-slate-800 border-b pb-3 mb-4">Resume Actions</h2>

              <button
                onClick={handleCalculateAts}
                disabled={atsLoading}
                className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3.5 rounded-xl font-semibold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={18} />
                <span>ATS Score Scan</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className="w-full flex items-center justify-center gap-3 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3.5 rounded-xl font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <Download size={18} />
                <span>{pdfGenerating ? "Generating PDF..." : "Download PDF"}</span>
              </button>

              <button
                onClick={() => router.push(`/resume/${resumeId}`)}
                className="w-full flex items-center justify-center gap-3 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3.5 rounded-xl font-semibold transition cursor-pointer"
              >
                <Eye size={18} />
                <span>Edit Resume</span>
              </button>
            </div>
          </div>

          {/* Resume Preview Sheet */}
          <div className="lg:col-span-3">
            <div
              id="resume-preview-sheet"
              className="bg-white shadow-xl border border-slate-200/60 rounded-xl p-12 max-w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col justify-between"
              style={{ contentVisibility: "auto" }}
            >
              <div>
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-6 text-center lg:text-left">
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {resume.personalInfo?.fullname || "Full Name"}
                  </h1>
                  <div className="mt-3 text-slate-600 text-sm flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2">
                    {resume.personalInfo?.email && <span>{resume.personalInfo.email}</span>}
                    {resume.personalInfo?.mobile && <span>{resume.personalInfo.mobile}</span>}
                    {resume.personalInfo?.location && <span>{resume.personalInfo.location}</span>}
                  </div>

                  <div className="mt-2 text-slate-500 text-xs flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 font-medium">
                    {resume.personalInfo?.github && (
                      <span className="flex items-center gap-1">
                        GitHub: {resume.personalInfo.github}
                      </span>
                    )}
                    {resume.personalInfo?.linkedIn && (
                      <span className="flex items-center gap-1">
                        LinkedIn: {resume.personalInfo.linkedIn}
                      </span>
                    )}
                    {resume.personalInfo?.portfolio && (
                      <span className="flex items-center gap-1">
                        Portfolio: {resume.personalInfo.portfolio}
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Professional Summary
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-sm mt-3">{resume.summary}</p>
                  </section>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {resume.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-xs font-semibold border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experience */}
                {resume.workExperience && resume.workExperience.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Work Experience
                    </h2>

                    <div className="mt-4 space-y-6">
                      {resume.workExperience.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                            <span className="text-xs text-slate-500 font-semibold uppercase">
                              {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                            </span>
                          </div>
                          <div className="text-slate-600 font-bold text-xs uppercase tracking-wide">{exp.company}</div>
                          <p className="text-slate-700 text-sm leading-relaxed mt-2 whitespace-pre-line">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {resume.projects && resume.projects.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Academic & Engineering Projects
                    </h2>

                    <div className="mt-4 space-y-6">
                      {resume.projects.map((project, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                              {project.title}
                            </h3>
                            <div className="flex gap-4 text-xs">
                              {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline inline-flex items-center gap-0.5 font-semibold">
                                  GitHub <ExternalLink size={10} />
                                </a>
                              )}
                              {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline inline-flex items-center gap-0.5 font-semibold">
                                  Demo <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.techStack?.map((tech) => (
                              <span
                                key={tech}
                                className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold border border-violet-100"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Education
                    </h2>

                    <div className="mt-4 space-y-4">
                      {resume.education.map((edu, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                            <p className="text-slate-600 text-xs font-medium">{edu.institute}</p>
                          </div>
                          <span className="text-xs text-slate-500 font-semibold">
                            {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Expected"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {resume.certifications && resume.certifications.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-bold text-lg text-slate-900 border-b border-slate-300 pb-1 uppercase tracking-wider">
                      Certifications & Awards
                    </h2>
                    <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-700">
                      {resume.certifications.map((cert, index) => (
                        <li key={index} className="leading-relaxed">{cert}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATS SCORE SLIDING DRAWER / PANEL */}
      {showAtsPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => {
              if (!atsLoading) setShowAtsPanel(false);
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 z-10 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-violet-600" />
                <h3 className="text-xl font-bold text-slate-800">ATS Audit Report</h3>
              </div>
              <button
                onClick={() => setShowAtsPanel(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {atsLoading ? (
                <div className="space-y-6 py-10 flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin mb-4" />
                  <p className="font-medium text-slate-600 text-center animate-pulse">
                    Evaluating parsing parameters... <br />
                    Calculating ATS keyword weights...
                  </p>
                </div>
              ) : atsReport ? (
                <div className="space-y-6">
                  {/* Overall score radial/badge */}
                  <div className="bg-slate-50 border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Overall ATS Score</div>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xs">
                        This score estimates how successfully Applicant Tracking Systems will parse and filter your resume.
                      </p>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full border-8 border-slate-200 flex items-center justify-center">
                        <span className="text-2xl font-black text-violet-600">{atsReport.atsScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">Executive Assessment</h4>
                    <p className="bg-violet-50/50 border border-violet-100/50 text-slate-700 text-sm leading-relaxed p-4 rounded-xl">
                      {atsReport.summary}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Strengths
                    </h4>
                    <div className="space-y-2">
                      {atsReport.strengths?.map((strength, i) => (
                        <div key={i} className="flex gap-2.5 items-start text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-500" />
                      Areas for Improvement
                    </h4>
                    <div className="space-y-2">
                      {atsReport.improvements?.map((improvement, i) => (
                        <div key={i} className="flex gap-2.5 items-start text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <span>{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3">Actionable Optimization Tips</h4>
                    <div className="space-y-2">
                      {atsReport.recommendations?.map((rec, i) => (
                        <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 text-sm text-slate-700 leading-relaxed font-medium">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Report failed to load.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowAtsPanel(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}