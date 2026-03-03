"use client"

import { useState } from 'react'
import {
    FileText,
    Search,
    Upload,
    Brain,
    ZoomIn,
    Share2,
    Download,
    Terminal,
    Cpu
} from 'lucide-react'

export default function MindMapNLP() {
    const [processing, setProcessing] = useState(false)
    const [complete, setComplete] = useState(false)

    const handleProcess = () => {
        setProcessing(true)
        setTimeout(() => {
            setProcessing(false)
            setComplete(true)
<<<<<<< HEAD
        }, 1200)
=======
        }, 4000)
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">NLP Pipeline</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Syllabus Mind Map NLP</h1>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Upload className="w-4 h-4" />
                        Upload PDF
                    </button>
                    <button
                        onClick={handleProcess}
                        className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        Analyze Syllabus
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="vantage-card p-8 bg-slate-900 text-white border-none min-h-[300px] flex flex-col">
                        <div className="flex items-center gap-2 text-blue-400 mb-6 font-bold text-xs uppercase tracking-widest">
                            <Terminal className="w-4 h-4" />
                            Processing Log
                        </div>
                        <div className="space-y-3 font-mono text-[10px] text-slate-400">
                            <p>{`> Initializing spaCy model...`}</p>
                            {processing && (
                                <>
                                    <p className="text-blue-400">{`> Extracting entities (BERT)...`}</p>
                                    <p className="text-emerald-400">{`> Found 12 units, 45 concepts.`}</p>
                                    <p>{`> Generating TF-IDF clusters...`}</p>
                                </>
                            )}
                            {complete && (
                                <p className="text-emerald-400 font-bold">{`> Graph JSON generated successfully.`}</p>
                            )}
                        </div>
                        <div className="mt-auto pt-6">
                            <div className="flex justify-between text-[10px] font-bold mb-2">
                                <span>Resource Utilization</span>
                                <span>{processing ? '82%' : '2%'}</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full">
                                <div className={`h-full bg-blue-500 transition-all duration-1000 ${processing ? 'w-[82%]' : 'w-[2%]'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="vantage-card p-8">
                        <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            Core Concepts
                        </h2>
                        {complete ? (
                            <div className="flex flex-wrap gap-2">
                                {['Data Structures', 'XGBoost', 'Gradient Descent', 'Backpropagation', 'CNN', 'NLP', 'BERT', 'Transformers'].map((tag, i) => (
                                    <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Concept extraction will appear here after analysis.</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="vantage-card p-8 min-h-[600px] flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#001b5e]">CS304_Advanced_AI.pdf</h3>
                                    <p className="text-xs font-bold text-slate-400">Integrated Syllabus Analysis</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"><ZoomIn className="w-5 h-5" /></button>
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"><Share2 className="w-5 h-5" /></button>
                                <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"><Download className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {processing ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <Cpu className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-[#001b5e]">Neural Concept Mapping</h4>
                                    <p className="max-w-xs text-slate-400 text-sm font-medium">Using BERT semantics to cluster related course materials into a navigable knowledge graph.</p>
                                </div>
                            </div>
                        ) : complete ? (
                            <div className="flex-1 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3b82f610,transparent)]"></div>
                                <div className="flex flex-col items-center gap-4 relative z-10">
                                    <div className="flex gap-20">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">AI</div>
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg mt-20">ML</div>
                                    </div>
                                    <div className="w-20 h-20 bg-[#001b5e] rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl border-4 border-white">ROOT</div>
                                    <div className="flex gap-24">
                                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg -mt-10">NLP</div>
                                        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg -mt-20">CV</div>
                                    </div>
                                </div>
                                <p className="absolute bottom-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive D3.js Visualization Engine Active</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center animate-pulse">
                                    <Brain className="w-10 h-10 text-blue-200" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-[#001b5e]">No Active Map</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload a syllabus document and start the analysis to generate a visual hierarchy of course topics.</p>
                                </div>
                                <button onClick={handleProcess} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all">
                                    Run Demonstration
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
