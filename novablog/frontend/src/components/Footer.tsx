import React from 'react';
import { Sparkles } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-base">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>NovaBlog Enterprise 2026</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Full-Stack Showcase
              </span>
            </div>
            <p className="text-slate-400 max-w-md">
              Spring Boot 4.1.1, Java 22 Virtual Threads, Spring AI Vektör Arama & Next.js 16 ile geliştirilmiş
              kurumsal portfolyo projesi.
            </p>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              Java 22 Loom
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              Spring AI Vektör
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              Next.js 16
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              184 Test (%100 Pass)
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p className="flex items-center gap-1">
            Geliştirici:{' '}
            <a
              href="https://github.com/abdullahberkeozder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white font-medium underline underline-offset-4"
            >
              Abdullah Berke Özder
            </a>
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/abdullahberkeozder/my-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
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
