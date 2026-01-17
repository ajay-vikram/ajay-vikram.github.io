"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// Dynamically import PlotlyChart with SSR disabled
const PlotlyChart = dynamic(() => import("@/components/PlotlyChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-card animate-pulse rounded-xl flex items-center justify-center text-muted-foreground border border-amber-500/10">
      Loading Visualization...
    </div>
  ),
});

export default function PositionalEncodingPage() {
  const [maxLength, setMaxLength] = useState<number>(100);
  const [dModel, setDModel] = useState<number>(256);

  const deferredMaxLength = useDeferredValue(maxLength);
  const deferredDModel = useDeferredValue(dModel);

  // Calculate Positional Encodings
  const positionalEncoding = useMemo(() => {
    // PE formula:
    // PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
    // PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
    
    const matrix = [];
    for (let pos = 0; pos < deferredMaxLength; pos++) {
      const row = [];
      for (let k = 0; k < deferredDModel; k++) {
        const i = Math.floor(k / 2);
        const denominator = Math.pow(10000, (2 * i) / deferredDModel);
        const angle = pos / denominator;
        
        if (k % 2 === 0) {
          row.push(Math.sin(angle));
        } else {
          row.push(Math.cos(angle));
        }
      }
      matrix.push(row);
    }
    return matrix;
  }, [deferredMaxLength, deferredDModel]);

  const plotData = [
    {
      z: positionalEncoding,
      x: Array.from({ length: deferredDModel }, (_, i) => i),
      y: Array.from({ length: deferredMaxLength }, (_, i) => i),
      type: "heatmap",
      colorscale: "RdBu",
      zmin: -1,
      zmax: 1,
      colorbar: {
        title: "Value",
        titleside: "right",
        thickness: 20,
        len: 0.8,
        tickfont: { color: "#fafafa" },
        titlefont: { color: "#fafafa" },
      },
      hovertemplate: 
        "Position: %{y}<br>" +
        "Dimension: %{x}<br>" +
        "Value: %{z:.3f}<extra></extra>",
    },
  ];

  const plotLayout = {
    title: {
      text: "Positional Encoding Matrix",
      font: { family: "sans-serif", size: 20, color: "#fafafa" },
      y: 0.95,
    },
    xaxis: {
      title: {
        text: "Embedding Dimension (d_model)",
        font: { family: "sans-serif", size: 14, color: "#a3a3a3" },
      },
      side: "bottom",
      tickfont: { family: "sans-serif", color: "#a3a3a3" },
      gridcolor: "#262626",
    },
    yaxis: {
      title: {
        text: "Position (Sequence Length)",
        font: { family: "sans-serif", size: 14, color: "#a3a3a3" },
      },
      autorange: "reversed",
      tickfont: { family: "sans-serif", color: "#a3a3a3" },
      gridcolor: "#262626",
    },
    margin: { t: 80, l: 80, r: 80, b: 80 },
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "sans-serif" },
  };

  const formula = String.raw`
  \begin{aligned}
    PE_{(pos, 2i)} &= \sin(pos / 10000^{2i/d_{model}}) \
    PE_{(pos, 2i+1)} &= \cos(pos / 10000^{2i/d_{model}})
  \end{aligned}
  `;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-900/50 selection:text-amber-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
        <Link 
          href="/#tools" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>
        
        {/* Header Section */}
        <header className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 pb-2">
              Positional Encoding
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Visualizing the sinusoidal waves that give Transformers a sense of order.
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Controls & Info */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            
            {/* Formula Card */}
            <div className="bg-card rounded-2xl border border-amber-500/20 p-6 overflow-hidden relative group shadow-lg shadow-amber-900/5 hover:border-amber-500/40 transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-2xl"></div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                Mathematical Formula
              </h3>
              <div className="overflow-x-auto py-2">
                 <div className="text-base text-gray-200 flex flex-col items-center gap-2">
                    <Latex>{`$$PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d_{model}})$$`}</Latex>
                    <Latex>{`$$PE_{(pos, 2i+1)} = \\cos(pos / 10000^{2i/d_{model}})$$`}</Latex>
                 </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                The wavelength increases geometrically from <Latex>$2\pi$</Latex> to <Latex>$10000 \cdot 2\pi$</Latex>. This allows the model to easily learn to attend by relative positions.
              </p>
            </div>

            {/* Controls Card */}
            <div className="bg-card rounded-2xl border border-amber-500/20 p-8 space-y-8 shadow-lg shadow-amber-900/5 hover:border-amber-500/40 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label htmlFor="length-slider" className="text-sm font-medium text-gray-300">
                    Sequence Length (<span className="font-serif italic">L</span>)
                  </label>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-bold font-mono border border-amber-500/20">
                    {maxLength}
                  </span>
                </div>
                <input
                  id="length-slider"
                  type="range"
                  min="10"
                  max="500"
                  step="1"
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label htmlFor="dim-slider" className="text-sm font-medium text-gray-300">
                    Embedding Dimension (<span className="font-serif italic">d_model</span>)
                  </label>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-bold font-mono border border-amber-500/20">
                    {dModel}
                  </span>
                </div>
                <input
                  id="dim-slider"
                  type="range"
                  min="16"
                  max="1024"
                  step="16"
                  value={dModel}
                  onChange={(e) => setDModel(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>16</span>
                  <span>1024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 bg-card rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-900/5 p-2 lg:p-4 min-h-[600px] flex flex-col hover:border-amber-500/40 transition-colors duration-300">
            <div className="flex-1 rounded-xl overflow-hidden bg-card relative">
              <PlotlyChart
                data={plotData as any}
                layout={plotLayout as any}
                config={{ responsive: true, displayModeBar: false, displaylogo: false }}
              />
            </div>
            <div className="mt-4 px-4 text-center">
               <p className="text-sm text-muted-foreground italic">
                 Hover over the heatmap to see exact values.
               </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}