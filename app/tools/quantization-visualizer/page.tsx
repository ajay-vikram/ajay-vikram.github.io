"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Settings2, Info, Calculator, Ruler } from "lucide-react";
import 'katex/dist/katex.min.css';

type Scheme = "symmetric" | "asymmetric";

export default function QuantizationVisualizerPage() {
  const [scheme, setScheme] = useState<Scheme>("asymmetric");
  
  // Tensor distribution params
  const [minVal, setMinVal] = useState(-10.0);
  const [maxVal, setMaxVal] = useState(10.0);
  
  // Specific value to quantize
  const [currentVal, setCurrentVal] = useState(2.5);

  // --- Calculations ---

  // Determine Q params based on scheme
  const { qMin, qMax, qRange, scale, zeroPoint } = useMemo(() => {
    let qMin, qMax, qRange, s, z;

    if (scheme === "symmetric") {
      // Symmetric: Signed Int4 [-8, 7]
      // Formula: s = max(|r_min|, |r_max|) / q_max
      // z = 0
      qMin = -8;
      qMax = 7;
      qRange = 15; // Not used for scale calc in symmetric, but for grid

      const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal));
      s = maxAbs / qMax; // Maps max value to 7
      if (s === 0) s = 0.0001;
      z = 0;

    } else {
      // Asymmetric: Unsigned Int4 [0, 15]
      // Formula: s = (r_max - r_min) / (q_max - q_min)
      // z = round(q_min - r_min / s)
      qMin = 0;
      qMax = 15;
      qRange = 15;

      s = (maxVal - minVal) / (qMax - qMin);
      if (s === 0) s = 0.0001;
      
      z = Math.round(qMin - minVal / s);
      
      // Standard clipping of Z to ensure it fits in range is good practice, 
      // though mathematically z corresponds to real 0.
      z = Math.max(qMin, Math.min(qMax, z));
    }

    return { qMin, qMax, qRange, scale: s, zeroPoint: z };
  }, [minVal, maxVal, scheme]);

  const quantize = (val: number) => {
    // q = round(x / s) + z
    // symmetric: z is 0, so round(x/s)
    // asymmetric: round(x/s) + z  (equivalent to round(x/s + z) if z is integer)
    
    // Note: The prompt formula for Asymmetric is q = round(x/s) + z
    // For Symmetric it's q = round(x/s)
    // Since z=0 for symmetric, we can use the unified formula:
    const q = Math.round(val / scale) + zeroPoint;
    return Math.max(qMin, Math.min(qMax, q));
  };

  const dequantize = (q: number) => {
    // x = (q - z) * s
    return (q - zeroPoint) * scale;
  };

  const quantizedInt = quantize(currentVal);
  const dequantizedFloat = dequantize(quantizedInt);
  const error = currentVal - dequantizedFloat;

  // --- Visualization Data ---
  
  const gridPoints = useMemo(() => {
    const points = [];
    for (let q = qMin; q <= qMax; q++) { 
       const r = dequantize(q);
       points.push({ q, r });
    }
    return points;
  }, [scale, zeroPoint, qMin, qMax]);


  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <Link 
          href="/tools"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 pb-2">
            FP32 to INT4 Quantization
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize how floating point ranges are compressed into 4-bit integers.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 size={18} /> Configuration
              </h3>

              {/* Scheme Toggle */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Quantization Scheme</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["symmetric", "asymmetric"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScheme(s)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        scheme === s
                          ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/50"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                 <p className="text-[10px] text-muted-foreground mt-2">
                  {scheme === "symmetric" ? "Signed Int4 [-8, 7]" : "Unsigned Int4 [0, 15]"}
                </p>
              </div>

              {/* Range Inputs */}
              <div className="space-y-4 pt-2">
                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dynamic Range</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Min Value</label>
                      <input
                        type="number"
                        value={minVal}
                        onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             if (!isNaN(val)) setMinVal(val);
                        }}
                        className="w-full bg-muted/50 border border-input rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs text-muted-foreground">Max Value</label>
                       <input
                        type="number"
                        value={maxVal}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setMaxVal(val);
                        }}
                        className="w-full bg-muted/50 border border-input rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                 </div>
              </div>
            </div>

            {/* Calculated Parameters */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calculator size={18} /> Model Parameters
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded border border-border/50">
                  <span className="text-muted-foreground font-medium">Scale (s)</span>
                  <span className="font-mono text-blue-400 font-bold">{scale.toExponential(4)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded border border-border/50">
                  <span className="text-muted-foreground font-medium">Zero Point (z)</span>
                  <span className="font-mono text-purple-400 font-bold">{zeroPoint}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                 {/* Main Formula */}
                 <div className="bg-neutral-950/50 p-3 rounded-md border border-neutral-800 text-sm text-center font-mono text-muted-foreground">
                     <span className="text-foreground">q</span> = clamp(round(x/s) + z, {qMin}, {qMax})
                 </div>

                 {/* Derivation Formulas */}
                 <div className="p-3 rounded-md border border-border/50 text-xs space-y-2 bg-muted/10">
                     <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-1">Derivation ({scheme})</p>
                     
                     {scheme === "asymmetric" ? (
                        <>
                          <div className="flex items-center gap-2">
                              <span className="font-mono text-blue-400 font-bold">s</span> 
                              <span className="font-mono">= (r_max - r_min) / (15 - 0)</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="font-mono text-purple-400 font-bold">z</span>
                              <span className="font-mono">= round(0 - r_min / s)</span>
                          </div>
                        </>
                     ) : (
                        <>
                           <div className="flex items-center gap-2">
                              <span className="font-mono text-blue-400 font-bold">s</span> 
                              <span className="font-mono">= max(|r_min|, |r_max|) / 7</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="font-mono text-purple-400 font-bold">z</span>
                              <span className="font-mono">= 0</span>
                          </div>
                        </>
                     )}
                 </div>
              </div>
            </div>

          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 space-y-6">
             
             <div className="bg-card rounded-xl border border-border shadow-md p-8 min-h-[500px] flex flex-col relative">
                
                {/* Value Input */}
                <div className="w-full mb-12 space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-muted-foreground mb-1">Input Value (x)</label>
                        <input 
                            type="number" 
                            step={scale / 10} 
                            value={currentVal}
                            onChange={(e) => setCurrentVal(parseFloat(e.target.value))}
                            className="bg-transparent text-3xl font-bold font-mono text-blue-400 focus:outline-none border-b border-dashed border-blue-400/30 w-48"
                        />
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            {scheme === "symmetric" ? "Signed Int4" : "Unsigned Int4"}
                         </div>
                         <div className="text-3xl font-mono font-bold text-green-400">{quantizedInt}</div>
                      </div>
                   </div>

                   {/* Slider */}
                   <div className="relative h-12 flex items-center">
                       <div className="absolute w-full h-2 bg-muted rounded-full overflow-hidden">
                           <div className="w-full h-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"></div>
                       </div>
                       
                       <input
                          type="range" 
                          min={minVal} 
                          max={maxVal} 
                          step={(maxVal - minVal) / 2000}
                          value={currentVal}
                          onChange={(e) => setCurrentVal(parseFloat(e.target.value))}
                          className="w-full h-2 bg-transparent appearance-none cursor-pointer absolute z-20 opacity-0"
                       />
                       
                       {/* Handles */}
                       <div 
                           className="absolute h-6 w-1 bg-blue-500 z-10 pointer-events-none transition-all duration-75"
                           style={{ left: `${((currentVal - minVal) / (maxVal - minVal)) * 100}%` }}
                       >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded font-mono">x</div>
                       </div>

                       <div 
                           className="absolute h-4 w-4 border-2 border-purple-500 rounded-full z-0 pointer-events-none transition-all duration-300 ml-[-6px]"
                           style={{ left: `${((dequantizedFloat - minVal) / (maxVal - minVal)) * 100}%` }}
                       >
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-purple-400 text-[10px] font-mono whitespace-nowrap">x̂ ≈ {dequantizedFloat.toFixed(2)}</div>
                       </div>
                   </div>
                </div>

                {/* Flow Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center">
                        <span className="text-xs text-muted-foreground mb-2">1. Scale & Shift</span>
                        <div className="font-mono text-sm mb-1 text-foreground/80">
                             {scheme === "asymmetric" 
                               ? `${currentVal.toFixed(2)} / ${scale.toPrecision(3)} + ${zeroPoint}`
                               : `${currentVal.toFixed(2)} / ${scale.toPrecision(3)}`
                             }
                        </div>
                        <div className="text-xl font-bold text-foreground mt-auto">
                            = {(currentVal / scale + (scheme === "asymmetric" ? zeroPoint : 0)).toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center relative">
                        <ArrowLeft className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-180" />
                        <span className="text-xs text-muted-foreground mb-2">2. Round & Clamp</span>
                        <div className="font-mono text-sm mb-1 text-foreground/80">
                            round(...)
                        </div>
                        <div className="text-xl font-bold text-green-400 mt-auto">
                            {quantizedInt} <span className="text-xs font-normal text-muted-foreground">(int4)</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center relative">
                        <ArrowLeft className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-180" />
                        <span className="text-xs text-muted-foreground mb-2">3. Dequantize</span>
                        <div className="font-mono text-sm mb-1 text-foreground/80">
                             ({quantizedInt} - {zeroPoint}) * {scale.toPrecision(3)}
                        </div>
                        <div className="text-xl font-bold text-purple-400 mt-auto">
                            ≈ {dequantizedFloat.toFixed(3)}
                        </div>
                    </div>
                </div>

                {/* Grid Visualizer */}
                <div className="mt-auto pt-6 border-t border-border/50">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                        <Ruler size={16}/> Quantization Grid
                    </h4>
                    
                    <div className="relative w-full h-16 bg-neutral-950/30 rounded-lg border border-border/30 overflow-hidden">
                        <div className="absolute inset-0 flex items-center">
                             <div className="w-full h-px bg-border"></div>
                        </div>

                        {gridPoints.map((pt, i) => {
                            const pct = ((pt.r - minVal) / (maxVal - minVal)) * 100;
                            if (pct < -2 || pct > 102) return null;

                            return (
                                <div 
                                    key={i}
                                    className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-neutral-600"
                                    style={{ left: `${pct}%` }}
                                >
                                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground font-mono">
                                        {pt.q}
                                    </span>
                                </div>
                            )
                        })}

                        <div 
                            className="absolute top-0 bottom-0 bg-green-500/10 border-x border-green-500/30 transition-all duration-300"
                            style={{ 
                                left: `${((dequantizedFloat - scale/2 - minVal) / (maxVal - minVal)) * 100}%`,
                                width: `${(scale / (maxVal - minVal)) * 100}%` 
                            }}
                        ></div>
                    </div>
                </div>

                {/* Error Metrics */}
                <div className="absolute top-8 right-8">
                    <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm text-right">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Error</div>
                        <div className={`text-xl font-mono font-bold ${Math.abs(error) > scale/2 ? "text-red-400" : "text-foreground"}`}>
                            {error > 0 ? "+" : ""}{error.toExponential(2)}
                        </div>
                    </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}