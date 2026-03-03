"use client"

import { useState, useRef } from 'react'
import { API_BASE } from '@/lib/api'
import {
    FileText,
    Upload,
    Brain,
    ZoomIn,
    Share2,
    Download,
    Terminal,
    Cpu,
    ScanText
} from 'lucide-react'

const MindMapNode = ({ node, level = 0 }: { node: any, level?: number }) => {
    if (!node) return null;
    const colors = ['bg-[#001b5e]', 'bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
    const bColor = colors[level % colors.length];

    return (
        <div className="flex flex-col items-center">
            <div className={`px-6 py-2.5 rounded-full text-white font-black shadow-xl ${bColor} border-2 border-white z-10 whitespace-nowrap text-sm mt-4 hover:scale-105 transition-transform cursor-default`}>
                {node.name}
            </div>
            {node.children && node.children.length > 0 && (
                <div className="flex flex-col items-center w-full">
                    {level === 0 ? <div className="w-0.5 h-10 bg-slate-300"></div> : <div className="w-0.5 h-6 bg-slate-200"></div>}
                    <div className="flex gap-4 sm:gap-12 relative w-full justify-center">
                        {/* Horizontal connector line */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 h-0.5 bg-slate-200" style={{ left: '10%', right: '10%' }}></div>
                        )}
                        {node.children.map((child: any, idx: number) => (
                            <div key={idx} className="relative flex flex-col items-center">
                                <div className="absolute top-0 w-0.5 h-4 bg-slate-200"></div>
                                <MindMapNode node={child} level={level + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function MindMapNLP() {
    const [processing, setProcessing] = useState(false)
    const [complete, setComplete] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [results, setResults] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setComplete(false)
            setResults(null)
        }
    }

    const handleUploadProcess = async () => {
        if (!file) return;
        setProcessing(true)

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/api/mindmap/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!res.ok) {
                setProcessing(false);
                alert("Server error uploading PDF. Please check backend requirements.");
                return;
            }
            const data = await res.json();


            // To provide visual effect of NLP taking some time to cluster
            setTimeout(() => {
                setResults(data)
                setProcessing(false)
                setComplete(true)
            }, 2500)

        } catch (err) {
            console.error(err)
            setProcessing(false)
        }
    }

    return (
        <div className="space-y-8 fade-in pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <ScanText className="w-4 h-4 text-emerald-500" /> AI OCR • NLP Pipeline
                    </p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Syllabus Mind Map NLP</h1>
                </div>
                <div className="flex gap-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        {file ? file.name.substring(0, 15) + '...' : 'Upload PDF'}
                    </button>
                    <button
                        onClick={handleUploadProcess}
                        disabled={!file || processing}
                        className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        Analyze Context
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="vantage-card p-8 bg-slate-900 text-white border-none min-h-[300px] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between text-blue-400 mb-6 font-bold text-xs uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Terminal className="w-4 h-4" /> OCR Log</span>
                            {processing && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>}
                        </div>
                        <div className="space-y-3 font-mono text-[10px] text-slate-400">
                            <p>{`> System ready.`}</p>
                            {file && <p className="text-blue-300">{`> File loaded: ${file.name}`}</p>}
                            {processing && (
                                <>
                                    <p className="text-amber-400">{`> Running OCR parsing...`}</p>
                                    <p className="animate-pulse">{`> Extracting text segments...`}</p>
                                </>
                            )}
                            {complete && (
                                <>
                                    <p className="text-emerald-400">{`> OCR complete. Loaded into spaCy model.`}</p>
                                    <p className="text-blue-400">{`> Extracting entities via BERT...`}</p>
                                    <p className="text-emerald-400">{`> Found semantic links.`}</p>
                                    <p className="text-white font-bold">{`> Graph generated.`}</p>
                                </>
                            )}
                        </div>
                        <div className="mt-auto pt-6">
                            <div className="flex justify-between text-[10px] font-bold mb-2">
                                <span>Engine Activity</span>
                                <span>{processing ? '94%' : (complete ? '0%' : '2%')}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full">
                                <div className={`h-full bg-blue-500 transition-all duration-1000 ${processing ? 'w-[94%] shadow-[0_0_10px_#3b82f6]' : (complete ? 'w-[100%] bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'w-[2%]')}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="vantage-card p-8">
                        <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            Extracted Entities
                        </h2>
                        {complete && results ? (
                            <div className="flex flex-wrap gap-2">
                                {(results?.concepts || []).map((tag: string, i: number) => (
                                    <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Core concepts extracted by OCR and NLP will populate here.</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="vantage-card p-8 min-h-[600px] flex flex-col relative overflow-hidden bg-slate-50 overflow-x-auto">
                        <div className="flex items-center justify-between mb-8 relative z-10 sticky left-0 top-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#001b5e] uppercase">{(results && results.filename) ? results.filename : (file ? file.name : "VANTAGE Knowledge Graph")}</h3>
                                    <p className="text-xs font-bold text-slate-400">Semantic Node Trees</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"><ZoomIn className="w-5 h-5" /></button>
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"><Share2 className="w-5 h-5" /></button>
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"><Download className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {processing ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <Cpu className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-[#001b5e]">Evaluating Neural Semantics...</h4>
                                    <p className="max-w-xs text-slate-400 text-sm font-medium">Running OCR to extract text from PDF and using NLP to cluster topics into a mapped hierarchy.</p>
                                </div>
                            </div>
                        ) : complete && results ? (
                            <div className="flex-1 flex flex-col min-w-[700px] p-10 pt-4 relative group">
                                <div className="absolute top-0 bottom-0 left-1/2 w-full bg-[radial-gradient(circle_at_50%_50%,#3b82f605,transparent)] -translate-x-1/2"></div>
                                <MindMapNode node={results.graph} />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                        Rendered visually via layout engine
                                    </p>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50/80 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                                        Data Extracted via Optical Character Recognition
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[2rem] flex items-center justify-center">
                                    <Brain className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-slate-600">No Document Uploaded</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload a PDF Syllabus document. VANTAGE will scan it using AI OCR and map the most critical concepts into a structure.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
