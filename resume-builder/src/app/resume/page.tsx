"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Briefcase, 
  Sparkles,
  Layers,
  LineChart,
  Calendar,
  LogOut,
  User,
  Compass
} from "lucide-react";
import {
  createResumeApi,
  deleteResumeApi,
  getAllResumesApi,
} from "@/apis/resume.api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface Resume {
  _id: string;
  title: string;
  jobTitle: string;
  experienceLevel: string;
  updatedAt?: string;
}

export default function ResumePage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");

  const [formData, setFormData] = useState({
    title: "",
    jobTitle: "",
    experienceLevel: "Fresher",
  });

  useEffect(() => {
    fetchResumes();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data?.success && res.data.data?.name) {
        setUserName(res.data.data.name);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...");
        router.push("/auth/login");
        return;
      }
      console.error(error);
    }
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getAllResumesApi();
      if (data?.success) {
        setResumes(data.data || []);
      } else {
        toast.error(data?.message || "Failed to load resumes");
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...");
        router.push("/auth/login");
        return;
      }
      console.error(error);
      toast.error("An error occurred while fetching resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.jobTitle.trim()) {
      toast.warning("Please fill in all fields to create a resume.");
      return;
    }

    try {
      setCreateLoading(true);
      toast.info("Initializing AI-Powered resume draft...");
      const response = await createResumeApi({
        title: formData.title,
        jobTitle: formData.jobTitle,
        experienceLevel: formData.experienceLevel,
      });

      if (response?.success && response.data?._id) {
        toast.success("Resume draft created successfully!");
        setShowModal(false);
        setFormData({ title: "", jobTitle: "", experienceLevel: "Fresher" });
        router.push(`/resume/${response.data._id}`);
      } else {
        toast.error(response?.message || "Failed to create resume");
      }
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...");
        router.push("/auth/login");
        return;
      }
      toast.error(error?.response?.data?.message || "An error occurred while creating resume");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;
    try {
      setDeletingId(resumeId);
      const res = await deleteResumeApi(resumeId);
      if (res?.success) {
        toast.success("Resume deleted successfully");
        setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      } else {
        toast.error(res?.message || "Failed to delete resume");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the resume");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">CV.AI</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <div className="text-sm text-slate-500 font-medium hidden md:block">
            Dashboard
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700">
            <User size={16} className="text-violet-600" />
            <span>{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border text-slate-600 border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col">
        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Resumes</h1>
            <p className="text-slate-500 mt-2">
              Create, customize, and analyze ATS-friendly resume drafts with Gemini AI.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus size={18} />
            Create Resume
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Drafts</div>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{loading ? "..." : resumes.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
              <LineChart size={20} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg ATS Score</div>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{loading ? "..." : resumes.length > 0 ? "88%" : "N/A"}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Compass size={20} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Industry Target</div>
              <div className="text-2xl font-black text-slate-800 mt-0.5">Software Eng.</div>
            </div>
          </div>
        </div>

        {/* List of resumes */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-3xl border p-16 text-center max-w-2xl mx-auto w-full my-auto flex flex-col items-center justify-center shadow-sm">
            <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Resumes Found</h2>
            <p className="text-slate-500 mt-2 max-w-sm">
              You haven't created any AI-powered resumes yet. Get started now!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition cursor-pointer"
            >
              Create First Resume
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition duration-300 flex flex-col justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h2 className="font-bold text-xl text-slate-800 line-clamp-1 group-hover:text-violet-600 transition">
                      {resume.title}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Briefcase size={14} />
                      <span className="line-clamp-1">{resume.jobTitle}</span>
                    </div>
                  </div>

                  <button
                    disabled={deletingId === resume._id}
                    onClick={() => handleDelete(resume._id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-block bg-violet-50 text-violet-700 px-3 py-1 rounded-full font-semibold border border-violet-100">
                    {resume.experienceLevel}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(resume.updatedAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/resume/${resume._id}`)}
                  className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition cursor-pointer shadow-sm"
                >
                  Continue Building
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateResume}
            className="bg-white w-full max-w-lg rounded-3xl p-8 border shadow-2xl relative animate-scale-in"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3">Create Resume Draft</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resume Title</label>
                <input
                  required
                  placeholder="E.g., Full Stack Engineer Draft"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Title</label>
                <input
                  required
                  placeholder="E.g., Senior React Developer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobTitle: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceLevel: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option>Fresher</option>
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t pt-4">
              <button
                type="button"
                disabled={createLoading}
                onClick={() => setShowModal(false)}
                className="px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer text-slate-600 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createLoading}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {createLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Resume"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
      <Skeleton className="h-6 w-3/4 bg-slate-200" />
      <Skeleton className="h-4 w-1/2 bg-slate-200" />
      <Skeleton className="h-8 w-full bg-slate-200 rounded-xl" />
      <Skeleton className="h-10 w-full bg-slate-200 rounded-xl" />
    </div>
  );
}