import React from 'react';
import { GithubIcon } from './GithubIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-[#07080a]/90 text-zinc-500 dark:text-zinc-400 text-xs py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4f933] shadow-[0_0_8px_#d4f933]" />
              <span className="font-mono font-black text-sm text-zinc-950 dark:text-white uppercase tracking-tight">
                NOVA // BLOG &bull; ARCHITECTURE MANIFEST
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 border border-black/10 dark:border-white/10">
                2026 EDITION
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed font-sans text-xs">
              Spring Boot 4.1.1, Java 22 Virtual Threads (Loom), 128D Vektör Anlamsal Arama, 
              Redis Write-Behind Buffer ve Next.js 16 ile inşa edilmiş endüstriyel portfolyo platformu.
            </p>
          </div>

          {/* Quick Hardware Spec Badges (Ride Also Style) */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-300">
              JAVA 22 LOOM
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-300">
              128D VECTOR COSINE
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-300">
              REDIS WRITE-BEHIND
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              195/195 TESTS (%100 PASS)
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 font-mono text-[11px]">
          <p className="flex items-center gap-1.5">
            <span>ENGINEER //</span>
            <a
              href="https://github.com/abdullahberkeozder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 dark:text-white font-bold hover:underline"
            >
              Abdullah Berke Özder
            </a>
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>my-portfolio Repository</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
