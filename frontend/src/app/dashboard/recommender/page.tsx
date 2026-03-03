"use client"

import { useState } from 'react'
import {
    BookOpen,
    Search,
    Star,
    Clock,
    Download,
    ExternalLink,
    Play,
    Bookmark,
    Sparkles,
    Zap
} from 'lucide-react'

export default function StudyRecommender() {
    const [query, setQuery] = useState('')

    const recommendations = [
        { title: 'Intro to XGBoost Paradigms', type: 'Video', duration: '45m', rating: 4.8, relevance: '95%', author: 'Prof. Harrison' },
        { title: 'Advanced Gradient Boosting', type: 'PDF', pages: '12', rating: 4.9, relevance: '92%', author: 'Vantage Research' },
        { title: 'Hyperparameter Tuning Basics', type: 'Interactive', duration: '20m', rating: 4.7, relevance: '88%', author: 'OpenSource ML' },
        { title: 'Feature Engineering Mastery', type: 'Video', duration: '1h 12m', rating: 4.6, relevance: '85%', author: 'Data Academy' },
    ]

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Learning Engine</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Study Resource Recommender</h1>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Bookmark className="w-4 h-4" />
                        Saved Items
                    </button>
                </div>
            </div>

            <div className="vantage-card p-10 bg-[#001b5e] text-white border-none shadow-blue-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-400 fill-current" />
                        <h2 className="text-2xl font-black">AI-Powered Content Match</h2>
                    </div>
                    <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                        Our Collaborative Filtering algorithm analyzes your performance gaps (XGBoost scores) and suggests high-precision resources to bridge them.
                    </p>
                    <div className="flex gap-4 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 py-5 pl-14 pr-6 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold placeholder:text-white/30"
                                placeholder="What subject are we mastering today?"
                            />
                        </div>
                        <button className="bg-blue-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-400 transition-all shadow-xl shadow-blue-950/50">
                            Match
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-[#001b5e]">Personalized Recommendations</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Based on Prediction Results</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((res, i) => (
                        <div key={i} className="vantage-card p-6 flex gap-6 hover:shadow-xl hover:border-blue-100 transition-all group">
                            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 relative overflow-hidden">
                                {res.type === 'Video' ? <Play className="w-8 h-8 text-blue-600 fill-current" /> : <BookOpen className="w-8 h-8 text-indigo-600" />}
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-black text-[#001b5e] leading-tight">{res.title}</h4>
                                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{res.relevance}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mb-2">{res.author} • {res.type} • {res.duration || `${res.pages} pages`}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                                        <span className="text-xs font-black text-[#001b5e]">{res.rating}</span>
                                    </div>
                                    <button className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline">
                                        Access Resource
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="vantage-card p-8 border-none bg-emerald-50/50">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-[#001b5e]">Learning Path Optimized</h4>
                        <p className="text-sm text-slate-500 font-medium italic">"Your current focus is on Neural Networks. We've prioritize these to boost your predicted 92% accuracy."</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
