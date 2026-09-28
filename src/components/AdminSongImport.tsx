import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from '@e965/xlsx';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Upload, XCircle } from 'lucide-react';
import { insertSongs } from '../services/songs/songService';
import type { UnifiedUser } from '../services/auth/authService';
import { subscribeToAuthChanges, isUserAdmin } from '../services/auth/authService';

type ImportRow = {
  song_title: string;
  artist: string;
  composer: string;
  album: string;
  genre: string;
  image_url: string;
  tutorial_url: string;
  lyrics: string;
  tags: string[];
  status: 'draft' | 'approved';
  is_watermarked: boolean;
};

const requiredHeaders = ['song_title', 'artist', 'lyrics'];
const allowedHeaders = new Set(['song_title','artist','composer','album','genre','image_url','tutorial_url','lyrics','tags','status','is_watermarked']);

function text(value: unknown): string { return value == null ? '' : String(value).trim(); }
function toBoolean(value: unknown): boolean {
  const v = text(value).toLowerCase();
  return v === 'true' || v === '1' || v === 'yes' || v === 'y';
}
function normalizeRow(row: Record<string, unknown>): ImportRow {
  const status = text(row.status).toLowerCase() === 'approved' ? 'approved' : 'draft';
  return {
    song_title: text(row.song_title),
    artist: text(row.artist),
    composer: text(row.composer),
    album: text(row.album),
    genre: text(row.genre),
    image_url: text(row.image_url),
    tutorial_url: text(row.tutorial_url),
    lyrics: text(row.lyrics),
    tags: text(row.tags).split(',').map(t => t.trim()).filter(Boolean),
    status,
    is_watermarked: toBoolean(row.is_watermarked),
  };
}

export function AdminSongImport() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UnifiedUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [status, setStatus] = useState('');
  const [importing, setImporting] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
      setAuthReady(true);
      if (!user || !isUserAdmin(user)) navigate('/admin');
    });
    return () => unsubscribe();
  }, [navigate]);

  const errors = useMemo(() => rows.map((row, index) => {
    const missing: string[] = [];
    if (!row.song_title) missing.push('song_title');
    if (!row.artist) missing.push('artist');
    if (!row.lyrics) missing.push('lyrics');
    return missing.length ? `Row ${index + 2}: missing ${missing.join(', ')}` : '';
  }).filter(Boolean), [rows]);

  const validRows = useMemo(() => rows.filter(r => r.song_title && r.artist && r.lyrics), [rows]);

  const handleFile = async (file: File) => {
    setFileName(file.name); setParseError(''); setStatus(''); setRows([]);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('No worksheet found.');
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      if (!rawRows.length) throw new Error('The first sheet is empty.');
      const headers = Object.keys(rawRows[0]).map(h => h.trim().toLowerCase());
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length) throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      const unknownHeaders = headers.filter(h => !allowedHeaders.has(h));
      if (unknownHeaders.length) throw new Error(`Unknown columns: ${unknownHeaders.join(', ')}`);
      setRows(rawRows.map(normalizeRow));
      setStatus(`Read ${rawRows.length} song row${rawRows.length === 1 ? '' : 's'}.`);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Could not read the spreadsheet.');
    }
  };

  const handleImport = async () => {
    if (!validRows.length || errors.length) return;
        setImporting(true); setParseError('');
    try {
      const payload = validRows.map(row => ({
        songTitle: row.song_title,
        title: row.song_title,
        artist: row.artist,
        composer: row.composer,
        album: row.album,
        genre: row.genre,
        imageURL: row.image_url,
        tutorialURL: row.tutorial_url,
        lyrics: row.lyrics,
        tags: row.tags,
        status: publishImmediately ? 'approved' as const : (row.status === 'approved' ? 'approved' as const : 'pending' as const),
        isWatermarked: row.is_watermarked,
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
      }));
      await insertSongs(payload);
      setStatus(`Imported ${validRows.length} song${validRows.length === 1 ? '' : 's'} successfully. ${publishImmediately ? 'They are now visible in the public library.' : 'They are saved as draft/pending status.'}`);
      setRows([]); setFileName('');
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Import failed.');
    } finally { setImporting(false); }
  };

  if (!authReady) return <div className="min-h-screen bg-black text-white grid place-items-center">Checking admin access…</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin-panel')} className="w-10 h-10 rounded-xl bg-white/5 grid place-items-center"><ArrowLeft size={19}/></button>
            <div><h1 className="text-2xl font-bold">Import Songs</h1><p className="text-xs text-white/40">Excel → Supabase → GuitarCord Library</p></div>
          </div>
          <FileSpreadsheet className="text-[#FFD600]" size={28}/>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <label className="block text-sm font-semibold mb-3">Upload Excel file</label>
            <input id="song-file" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
            <label htmlFor="song-file" className="flex flex-col items-center justify-center min-h-48 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
              <Upload className="text-[#FFD600]" size={28}/><span className="mt-3 font-semibold">Choose spreadsheet</span><span className="mt-1 text-xs text-white/40">.xlsx / .xls / .csv</span>
            </label>
            {fileName && <div className="mt-3 text-sm flex items-center gap-2"><FileSpreadsheet size={16} className="text-[#FFD600]"/><span className="truncate">{fileName}</span></div>}
            <div className="mt-5 rounded-xl bg-[#FFD600]/10 border border-[#FFD600]/20 p-4 text-xs text-white/75 space-y-2"><div className="font-semibold text-[#FFD600]">Required columns</div><div>song_title, artist, lyrics</div><div className="pt-1">Lyrics format: <code>[G] text [Em] text [C] text</code></div></div>
            <label className="mt-5 flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={publishImmediately} onChange={e => setPublishImmediately(e.target.checked)} className="mt-1 accent-yellow-400"/><span><span className="font-semibold text-sm">Publish imported songs immediately</span><span className="block text-xs text-white/40 mt-1">Off = keep the status from Excel.</span></span></label>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4"><div><div className="font-semibold">Preview</div><div className="text-xs text-white/40">{rows.length} rows loaded · {validRows.length} ready</div></div>{rows.length > 0 && errors.length === 0 ? <CheckCircle2 className="text-[#FFD600]" size={21}/> : null}</div>
            {parseError && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300 flex gap-2"><XCircle size={18} className="shrink-0"/>{parseError}</div>}
            {errors.length > 0 && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 space-y-1 max-h-32 overflow-auto">{errors.map(e => <div key={e}>{e}</div>)}</div>}
            {status && <div className="mb-4 rounded-xl bg-[#FFD600]/10 border border-[#FFD600]/20 p-3 text-sm text-[#FFD600]">{status}</div>}
            {rows.length === 0 ? <div className="min-h-72 grid place-items-center text-center text-white/30 text-sm">Upload your completed GuitarCord Excel template to preview songs here.</div> : <div className="overflow-auto rounded-xl border border-white/10 max-h-[430px]"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#111]"><tr><th className="p-3">#</th><th className="p-3">Song</th><th className="p-3">Artist</th><th className="p-3">Status</th></tr></thead><tbody>{rows.map((row, i) => <tr key={`${row.song_title}-${i}`} className="border-t border-white/5"><td className="p-3 text-white/30">{i + 2}</td><td className="p-3 font-medium max-w-[220px] truncate">{row.song_title || '—'}</td><td className="p-3 text-white/60 max-w-[180px] truncate">{row.artist || '—'}</td><td className="p-3"><span className={`px-2 py-1 rounded-full ${publishImmediately || row.status === 'approved' ? 'bg-[#FFD600]/15 text-[#FFD600]' : 'bg-white/10 text-white/50'}`}>{publishImmediately ? 'approved' : row.status}</span></td></tr>)}</tbody></table></div>}
            <button disabled={!validRows.length || errors.length > 0 || importing} onClick={handleImport} className="mt-4 w-full rounded-xl bg-[#FFD600] text-black py-3 font-bold disabled:opacity-30 disabled:cursor-not-allowed">{importing ? 'Importing…' : `Import ${validRows.length || 0} Song${validRows.length === 1 ? '' : 's'}`}</button>
          </section>
        </div>
      </div>
    </div>
  );
}
