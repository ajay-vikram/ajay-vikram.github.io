"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Settings2, Info, Calculator, Ruler, Hash } from "lucide-react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

type Scheme = "symmetric" | "asymmetric";

export default function QuantizationVisualizerPage() {
  // --- State ---
  const [scheme, setScheme] = useState<Scheme>("asymmetric");
  
  // Tensor distribution params - allowing large values
  const [minVal, setMinVal] = useState(-100.0);
  const [maxVal, setMaxVal] = useState(100.0);
  
  // Specific value to quantize
  const [currentVal, setCurrentVal] = useState(25.5);

  // Constants for Int8
  const Q_MIN = -128;
  const Q_MAX = 127;
  const Q_RANGE = 255;

  // --- Calculations ---

  const { scale, zeroPoint } = useMemo(() => {
    let s = 1;
    let z = 0;

    if (scheme === "symmetric") {
      // Symmetric: Maximize range while keeping 0->0
      // Often used for weights.
      // Range is [-max_abs, max_abs] mapped to [-127, 127] (sometimes -128 is clipped or used)
      // Standard approach: Scale = max(|min|, |max|) / 127
      // Note: We use 127 to ensure symmetry around 0 if we want to include -127..127.
      // If we use full int8 range [-128, 127], 0 might not be perfectly centered if we strictly map max_abs.
      // Standard PyTorch symmetric for signed int8 uses scale = max_abs / 127.
      const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal));
      s = maxAbs / 127; 
      z = 0;
    } else {
      // Asymmetric: affine mapping
      // s = (max - min) / (q_max - q_min)
      // z = round(q_min - min / s)
      s = (maxVal - minVal) / Q_RANGE;
      // We clamp scale to avoid division by zero
      if (s === 0) s = 0.0001; 
      
      z = Math.round(Q_MIN - minVal / s);
    }
    return { scale: s, zeroPoint: z };
  }, [minVal, maxVal, scheme]);

  const quantize = (val: number) => {
    const q = Math.round(val / scale + zeroPoint);
    return Math.max(Q_MIN, Math.min(Q_MAX, q));
  };

  const dequantize = (q: number) => {
    return (q - zeroPoint) * scale;
  };

  const quantizedInt = quantize(currentVal);
  const dequantizedFloat = dequantize(quantizedInt);
  const error = currentVal - dequantizedFloat;

  // --- Visualization Data ---

  // Generate representative grid points for the visualizer
  // Since we have 256 points max, we can render all of them if they fit in the range, 
  // or subsample if they are too dense visually (though 256 is manageable on desktop).
  // We want to show which "bin" the current value falls into.
  
  const gridPoints = useMemo(() => {
    const points = [];
    // We only care about points that map back to the visible range [minVal, maxVal]
    // Actually, the quantization range is defined BY minVal/maxVal (mostly).
    // So let's generate all 256 theoretical points and filter for display.
    
    // Optimization: Only generate points that are within [minVal - margin, maxVal + margin]
    // For asymmetric, that's roughly Q_MIN to Q_MAX.
    // For symmetric, it might be different if minVal/maxVal are not symmetric.
    
    for (let q = Q_MIN; q <= Q_MAX; q += 4) { // Plot every 4th point to avoid clutter
       const r = dequantize(q);
       points.push({ q, r });
    }
    return points;
  }, [scale, zeroPoint]);


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
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-500 pb-2">
            FP32 to INT8 Quantization
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize how large floating point ranges are compressed into 8-bit integers using affine mapping.
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
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${scheme === s
                          ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/50"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Inputs */}
              <div className="space-y-4 pt-2">
                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dynamic Range (Float)</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Min Value</label>
                      <div className="relative">
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
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs text-muted-foreground">Max Value</label>
                       <div className="relative">
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
                 <p className="text-[10px] text-muted-foreground">
                    Try large values (e.g., -1000 to 1000) to see how precision drops (step size increases).
                 </p>
              </div>
            </div>

            {/* Calculated Parameters */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calculator size={18} /> Model Parameters
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded border border-border/50">
                  <span className="text-muted-foreground font-medium">Scale (<Latex>$S$</Latex>)</span>
                  <span className="font-mono text-blue-400 font-bold">{scale.toExponential(4)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded border border-border/50">
                  <span className="text-muted-foreground font-medium">Zero Point (<Latex>$Z$</Latex>)</span>
                  <span className="font-mono text-purple-400 font-bold">{zeroPoint}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded border border-border/50">
                  <span className="text-muted-foreground font-medium">Precision (Step)</span>
                  <span className="font-mono text-green-400 font-bold">{scale.toPrecision(4)}</span>
                </div>
              </div>

              <div className="pt-2">
                 <div className="bg-neutral-950/50 p-4 rounded-md border border-neutral-800 text-xs text-center overflow-x-auto">
                     <Latex>{`$$x_{int} = \text{clamp}\left(\text{round}\left(\frac{x_{float}}{S} + Z\right), -128, 127\right)$$`}</Latex>
                 </div>
              </div>
            </div>

          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Interactive Display */}
             <div className="bg-card rounded-xl border border-border shadow-md p-8 min-h-[500px] flex flex-col relative">
                
                {/* Value Input Slider/Field */}
                <div className="w-full mb-12 space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-muted-foreground mb-1">Input Float Value (<Latex>$x$</Latex>)</label>
                        <input 
                            type="number" 
                            step={scale / 10} // allow fine grain
                            value={currentVal}
                            onChange={(e) => setCurrentVal(parseFloat(e.target.value))}
                            className="bg-transparent text-3xl font-bold font-mono text-blue-400 focus:outline-none border-b border-dashed border-blue-400/30 w-48"
                        />
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Int8 Representation</div>
                         <div className="text-3xl font-mono font-bold text-green-400">{quantizedInt}</div>
                      </div>
                   </div>

                   {/* Main Slider */}
                   <div className="relative h-12 flex items-center">
                       {/* Background Track */}
                       <div className="absolute w-full h-2 bg-muted rounded-full overflow-hidden">
                           <div className="w-full h-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"></div>
                       </div>
                       
                       <input
                          type="range" 
                          min={minVal} 
                          max={maxVal} 
                          step={(maxVal - minVal) / 2000} // High res slider
                          value={currentVal}
                          onChange={(e) => setCurrentVal(parseFloat(e.target.value))}
                          className="w-full h-2 bg-transparent appearance-none cursor-pointer absolute z-20 opacity-0" // Invisible interactive layer
                       />
                       
                       {/* Custom Thumb handle for visualization */}
                       <div 
                           className="absolute h-6 w-1 bg-blue-500 z-10 pointer-events-none transition-all duration-75"
                           style={{ left: `${((currentVal - minVal) / (maxVal - minVal)) * 100}%` }}
                       >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                               x
                           </div>
                       </div>

                       {/* Reconstructed Value handle */}
                       <div 
                           className="absolute h-4 w-4 border-2 border-purple-500 rounded-full z-0 pointer-events-none transition-all duration-300 ml-[-6px]" // Centering adjustment
                           style={{ left: `${((dequantizedFloat - minVal) / (maxVal - minVal)) * 100}%` }}
                       >
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-purple-400 text-[10px] font-mono whitespace-nowrap">
                               x̂ ≈ {dequantizedFloat.toFixed(2)}
                           </div>
                       </div>
                   </div>
                </div>

                {/* Conversion Flow Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Step 1: Normalize & Scale */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center">
                        <span className="text-xs text-muted-foreground mb-2">1. Scale & Shift</span>
                        <div className="font-mono text-sm mb-1">
                             <Latex>{`$${currentVal.toFixed(2)} / ${scale.toPrecision(3)} + ${zeroPoint}$`}</Latex>
                        </div>
                        <div className="text-xl font-bold text-foreground mt-auto">
                            = {(currentVal / scale + zeroPoint).toFixed(2)}
                        </div>
                    </div>

                    {/* Step 2: Round & Clamp */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center relative">
                        <ArrowLeft className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-180" />
                        <span className="text-xs text-muted-foreground mb-2">2. Round & Clamp</span>
                        <div className="font-mono text-sm mb-1">
                             round(...)
                        </div>
                        <div className="text-xl font-bold text-green-400 mt-auto">
                            {quantizedInt} <span className="text-xs font-normal text-muted-foreground">(int8)</span>
                        </div>
                    </div>

                    {/* Step 3: Dequantize */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 flex flex-col items-center text-center relative">
                        <ArrowLeft className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 text-muted-foreground rotate-180" />
                        <span className="text-xs text-muted-foreground mb-2">3. Dequantize (Recover)</span>
                        <div className="font-mono text-sm mb-1">
                             <Latex>{`$(${quantizedInt} - ${zeroPoint}) * ${scale.toPrecision(3)}$`}</Latex>
                        </div>
                        <div className="text-xl font-bold text-purple-400 mt-auto">
                            ≈ {dequantizedFloat.toFixed(3)}
                        </div>
                    </div>
                </div>

                {/* Grid Visualizer */}
                <div className="mt-auto pt-6 border-t border-border/50">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                        <Ruler size={16}/> Quantization Grid (Zoomed)
                    </h4>
                    
                    <div className="relative w-full h-16 bg-neutral-950/30 rounded-lg border border-border/30 overflow-hidden">
                        {/* Render a subset of grid points around the current value */}
                        <div className="absolute inset-0 flex items-center">
                             {/* Center line (current value context) */}
                             <div className="w-full h-px bg-border"></div>
                        </div>

                        {gridPoints.map((pt, i) => {
                            // Only render points visible within the slider range
                            const pct = ((pt.r - minVal) / (maxVal - minVal)) * 100;
                            if (pct < -2 || pct > 102) return null;

                            return (
                                <div 
                                    key={i}
                                    className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-neutral-600"
                                    style={{ left: `${pct}%` }}
                                >
                                    {/* Optional: label specific ticks if not too crowded */}
                                    {(i % 5 === 0) && (
                                        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground font-mono">
                                            {pt.q}
                                        </span>
                                    )}
                                </div>
                            )
                        })}

                        {/* Active Zone Highlight */}
                        <div 
                            className="absolute top-0 bottom-0 bg-green-500/10 border-x border-green-500/30 transition-all duration-300"
                            style={{ 
                                left: `${((dequantizedFloat - scale/2 - minVal) / (maxVal - minVal)) * 100}%`,
                                width: `${(scale / (maxVal - minVal)) * 100}%` 
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                        <span>{minVal.toFixed(1)}</span>
                        <span>Range: {(maxVal - minVal).toFixed(1)}</span>
                        <span>{maxVal.toFixed(1)}</span>
                    </div>
                </div>

                {/* Error Metrics */}
                <div className="absolute top-8 right-8">
                    <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm text-right">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Quantization Error</div>
                        <div className={`text-xl font-mono font-bold ${Math.abs(error) > scale/2 ? "text-red-400" : "text-foreground"}`}>
                            {error > 0 ? "+" : ""}{error.toExponential(2)}
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-muted/20 rounded-lg p-4 border border-border/50 text-sm text-muted-foreground leading-relaxed flex gap-3">
               <Info className="shrink-0 mt-0.5 text-blue-400" size={18}/>
               <div>
                  <p className="mb-2">
                    <strong className="text-foreground">Scale Factor Impact:</strong> As the dynamic range <span className="font-mono">[{minVal}, {maxVal}]</span> increases, the scale factor <Latex>$S$</Latex> increases. This means the gap between representable numbers (the step size) gets larger, leading to higher quantization error.
                  </p>
                  <p>
                    {scheme === "symmetric" 
                        ? "Symmetric quantization forces the range to be centered around zero, effectively using the largest absolute value to determine the scale. This is efficient for weights but can be wasteful for skewed distributions." 
                        : "Asymmetric quantization shifts the zero point (Z) to better fit the data distribution, which is ideal for activations like ReLU that are always positive."}
                  </p>
               </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
