import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X, ChevronDown, ChevronUp } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase/client';
import { SUPABASE_SQL_SETUP } from '../services/supabase/schema';

export function SupabaseBanner() {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isSupabaseConfigured || dismissed) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#121214] border-b border-yellow-500/30 text-white px-4 py-3 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-yellow-400 mr-2">Supabase Ready:</span>
            <span className="text-white/80 text-xs sm:text-sm">
              Add <code className="text-yellow-300 bg-white/5 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-yellow-300 bg-white/5 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in project settings to connect your live Supabase project.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setShowSql(!showSql)}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg text-white/90 transition-colors"
          >
            {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            SQL Schema
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-500 px-2.5 py-1.5 rounded-lg font-medium text-white transition-colors"
          >
            Open Supabase
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white p-1"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSql && (
        <div className="max-w-6xl mx-auto mt-3 p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-white/60">Run this in your Supabase SQL Editor:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <pre className="overflow-x-auto text-yellow-200/90 max-h-48 text-[11px] leading-relaxed p-1">
            {SUPABASE_SQL_SETUP}
          </pre>
        </div>
      )}
    </div>
  );
}
