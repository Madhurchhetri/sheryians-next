"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Cpu, 
  Gauge, 
  FileCheck, 
  Download, 
  Award, 
  ShieldCheck, 
  MessageSquare,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data?.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      router.push("/resume");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen flex flex-col selection:bg-violet-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              CV.AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-violet-600 transition">Features</a>
            <a href="#benefits" className="hover:text-violet-600 transition">AI Benefits</a>
            <a href="#ats" className="hover:text-violet-600 transition">ATS Optimization</a>
            <a href="#testimonials" className="hover:text-violet-600 transition">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated === null ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <Link
                href="/resume"
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:text-violet-600 transition">
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-28 bg-gradient-to-b from-violet-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-violet-100/80 shadow-sm animate-fade-in">
            <Cpu size={14} className="animate-spin-slow" /> Powered by Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Build a Resume That Lands <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              3x More Interviews
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Create professional, ATS-optimized, and visually stunning resumes in minutes. Let artificial intelligence write summary descriptions, format details, and audit your ATS scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStartBuilding}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer text-base"
            >
              Start Building Now
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer text-base"
            >
              See How It Works
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400 tracking-wider uppercase">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-violet-500" /> 100% ATS Friendly</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-violet-500" /> AI-Driven Bullet Points</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-violet-500" /> Professional Templates</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              State-of-the-Art Features
            </h2>
            <p className="text-slate-500">
              A comprehensive toolkit engineered to design professional resumes that attract recruiter attention.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Cpu size={24} className="text-violet-600" />}
              title="AI Generation Engine"
              description="Instantly generate optimized summaries, rich project briefs, and detailed work descriptions with Gemini."
            />
            <FeatureCard 
              icon={<Gauge size={24} className="text-violet-600" />}
              title="Real-Time ATS Auditing"
              description="Check your resume directly against ATS parser standard rules. Retrieve lists of missing keywords and scoring metrics."
            />
            <FeatureCard 
              icon={<Download size={24} className="text-violet-600" />}
              title="One-Click PDF Export"
              description="Download print-friendly, pixel-perfect A4 resumes formatted to global standards instantly."
            />
          </div>
        </div>
      </section>

      {/* AI Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-violet-600 font-bold text-sm tracking-wider uppercase">AI ADVANTAGES</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight">
                Leverage Intelligent AI to Standardize Your Experience
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Writing descriptions of your daily tasks is challenging. CV.AI takes inputs of your technologies and roles, turning them into high-impact, professional action bullet points.
              </p>
              <ul className="space-y-3 font-medium text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Overcomes writer's block</li>
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Replaces weak verbs with action-driven terms</li>
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Auto-selects critical industry-standard tags</li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200/60 shadow-inner relative">
              <div className="bg-white rounded-2xl p-6 border shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-slate-800 text-sm">AI Assist: Work Description</span>
                  <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">Gemini</span>
                </div>
                <div className="text-xs text-slate-400 italic">User Input: "React developer, did frontend updates"</div>
                <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100 text-xs text-slate-700 leading-relaxed">
                  "Engineered scalable client-side architectures using React.js and Next.js, optimizing component re-rendering to boost page speeds by 30%. Integrated REST APIs and implemented responsive styling layouts."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ATS Friendly Resume Section */}
      <section id="ats" className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileCheck className="text-green-500" />
                  <span className="font-bold text-slate-800 text-sm">ATS Scan Report</span>
                </div>
                <span className="text-2xl font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">89%</span>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Strengths</div>
                  <div className="text-slate-500">Strong action verbs used in experiences; solid tech stack keyword match.</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Missing Keywords</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-medium">CI/CD</span>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-medium">Docker</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <span className="text-violet-600 font-bold text-sm tracking-wider uppercase">ATS COMPATIBLE</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight">
                Evaluate Your Score Before Applying
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Most hiring firms use Applicant Tracking Systems (ATS) to filter CVs. CV.AI scans your layout, syntax, and keywords to tell you exactly how parsers will score your application.
              </p>
              <ul className="space-y-3 font-medium text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Multi-page ATS compliance audits</li>
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Actionable keyword optimization checklists</li>
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-violet-500" /> Instant readability metric reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Loved by Global Developers</h2>
            <p className="text-slate-500">Discover how engineers landed roles at leading technology companies.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="I generated my React Hook Developer resume using this tool, optimized the ATS keywords, and secured an interview at Stripe within a week!"
              author="Aarav Sharma"
              role="Software Engineer"
            />
            <TestimonialCard 
              quote="The PDF download maintains layout formatting perfectly. The AI descriptions are amazing; they make complex technical details sound simple."
              author="Sarah Jenkins"
              role="DevOps Specialist"
            />
            <TestimonialCard 
              quote="Filing in my profile in standard builders is usually annoying. The multi-step builder here is fast, cohesive, and auto-saves everything."
              author="Miguel Torres"
              role="Full Stack Developer"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">Ready to Land Your Dream Job?</h2>
          <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto leading-relaxed">
            Create an account in 10 seconds. Join over 50,000+ candidates who secured careers using CV.AI.
          </p>
          <div className="pt-4">
            <button
              onClick={handleStartBuilding}
              className="bg-white hover:bg-slate-50 text-violet-600 font-extrabold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer text-lg inline-flex items-center gap-2"
            >
              Build Your Resume Free
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">CV.AI</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CV.AI Resume Builder. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Triggered when not logged in) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 border border-slate-100 shadow-2xl relative animate-scale-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 border-4 border-violet-50">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Authentication Required</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                You need to login first to create a resume. Join us today to save and export your AI resume drafts.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/auth/login");
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl transition shadow-md hover:shadow-lg cursor-pointer"
              >
                Sign In / Login
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full border border-slate-300 hover:border-slate-400 bg-white text-slate-600 font-semibold py-3.5 rounded-2xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group">
      <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div className="space-y-4">
        <div className="flex text-violet-500 gap-1">
          <MessageSquare size={16} />
        </div>
        <p className="text-slate-600 italic leading-relaxed text-sm">"{quote}"</p>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-violet-100 border flex items-center justify-center font-bold text-violet-700 text-sm">
          {author.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div className="font-bold text-slate-800 text-sm">{author}</div>
          <div className="text-xs text-slate-400 font-medium">{role}</div>
        </div>
      </div>
    </div>
  );
}