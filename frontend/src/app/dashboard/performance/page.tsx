"use client"

import { useState } from 'react'
import {
    Search,
    Brain,
    ChevronRight,
    Download,
    ExternalLink,
    Target,
    Sparkles,
    TrendingUp,
    AlertCircle
} from 'lucide-react'

export default function PerformancePredictor() {
    const [prediction, setPrediction] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handlePredict = () => {
        setLoading(true)
        // Simulate API call to backend ML service
        setTimeout(() => {
            setPrediction({
                score: 17.4,
                status: 'High Performance',
                confidence: 0.94,
                insights: [
                    'High study efficiency detected (4.2h/failure)',
                    'Strong correlation with G1 and G2 scores',
                    'Low absence impact'
                ]
            })
            setLoading(false)
<<<<<<< HEAD
        }, 500)
=======
        }, 1500)
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analytics</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Student Performance Predictor</h1>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
                    <button className="px-6 py-2 rounded-xl text-sm font-bold bg-[#001b5e] text-white shadow-lg shadow-blue-900/20">Regression</button>
                    <button className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-[#001b5e]">Classification</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="vantage-card p-8">
                        <h2 className="text-xl font-black text-[#001b5e] mb-8 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            Input Features (XGBoost Input)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'G1 Score', val: '15.0' },
                                { label: 'G2 Score', val: '16.0' },
                                { label: 'Study Time Weekly', val: '3 (5-10h)' },
                                { label: 'Past Failures', val: '0' },
                                { label: 'Absences', val: '2' },
                                { label: 'Internet Access', val: 'Yes' },
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-[#001b5e]">
                                        {field.val}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full mt-10 bg-[#001b5e] text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? "Running AI Inference..." : (
                                <>
                                    <Brain className="w-6 h-6" />
                                    Generate Prediction Now
                                </>
                            )}
                        </button>
                    </div>

                    <div className="vantage-card p-8 bg-slate-900 text-white border-none">
                        <h2 className="text-xl font-black mb-8">Model Explainability (SHAP)</h2>
                        <div className="h-48 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5 text-slate-500 font-bold">
                            Feature Influence Chart Loading...
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="vantage-card p-8 border-blue-100 bg-blue-50/30">
                        <h2 className="text-xl font-black text-[#001b5e] mb-8">Prediction Results</h2>

                        {prediction ? (
                            <div className="space-y-8 fade-in">
                                <div className="text-center space-y-2">
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Predicted Final Grade (G3)</p>
                                    <h3 className="text-7xl font-black text-[#001b5e]">{prediction.score}</h3>
                                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">
                                        <TrendingUp className="w-3 h-3" />
                                        {prediction.status}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-blue-100">
                                    <p className="text-xs font-black text-[#001b5e] uppercase tracking-wider">AI Insights</p>
                                    {prediction.insights.map((insight: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <Target className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                            <p className="text-sm font-medium text-slate-700">{insight}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500">Confidence Score</span>
                                        <span className="text-blue-600">{(prediction.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${prediction.confidence * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-slate-500 font-medium text-sm">Please trigger the AI inference to view predicted performance metrics.</p>
                            </div>
                        )}
                    </div>

                    <div className="vantage-card p-8">
                        <h2 className="text-xl font-black text-[#001b5e] mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Intervention Strategy
                        </h2>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Based on current projections, the student should focus on maintaining study hours and attending the upcoming Database mock exams.
                        </p>
                        <button className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Analytical Case
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
