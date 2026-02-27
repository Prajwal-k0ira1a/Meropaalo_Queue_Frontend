import DashboardMock from "./DashboardMock";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="hero"
      className="[background-image:radial-gradient(circle,#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] relative min-h-screen pt-24 flex items-center overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] -z-10" />

      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div className="max-w-xl">
          {/* Section label */}
          <div className="animate-fade-up inline-block font-semibold text-[0.7rem] tracking-[0.05em] uppercase text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded mb-4">
            Now Pilot Version is Out
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-up [animation-delay:0.1s]">
            End the Wait,{" "}
            <span className="block mt-2 bg-[linear-gradient(90deg,#0d9488,#2563eb,#0d9488)] [background-size:200%_auto] bg-clip-text text-transparent animate-shimmer">
              Empower Flow
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed animate-fade-up [animation-delay:0.2s] max-w-lg">
            Intelligent digital queuing for modern institutions. Transform chaotic lobbies into streamlined, data-driven customer experiences.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 animate-fade-up [animation-delay:0.3s]">
            <button className="group inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-8 h-12 text-base rounded-lg cursor-pointer transition-all hover:bg-teal-700 hover:-translate-y-px hover:shadow-[0_10px_20px_-10px_#0d9488]">
              Start Free Trial <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
            <button className="group inline-flex items-center gap-2 bg-transparent text-slate-700 font-medium px-8 h-12 text-base rounded-lg border border-slate-200 cursor-pointer transition-all hover:bg-slate-100">
              <Play size={18} className="fill-slate-600" /> Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-6 animate-fade-up [animation-delay:0.4s]">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden">
                  <img
                    src={`https://i.pravatar.cc/150?u=${i + 10}`}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                +40
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-teal-600" /> Trusted by 50+ Institutions
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-tight">Across Nepal and Southeast Asia</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center relative animate-fade-in [animation-delay:0.3s]">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-blue-50 rounded-3xl -rotate-2 -z-10 scale-105" />
          <DashboardMock />
        </div>
      </div>
    </section>
  );
};

export default Hero;
