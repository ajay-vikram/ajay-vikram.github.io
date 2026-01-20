"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Settings2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// Dynamically import Plotly with no SSR
const Plot = dynamic(() => import("react-plotly.js"), { 
  ssr: false, 
  loading: () => <div className="h-[600px] w-full bg-muted/20 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Loading 3D Visualization...</div> 
});

export default function BilinearInterpolationPage() {
  // --- State ---
  
  // Corner values (Pixel values at integer coordinates)
  // Ordered as: Top-Left (0,1), Top-Right (1,1), Bottom-Left (0,0), Bottom-Right (1,0)
  // Wait, standard Cartesian:
  // Q00: (0,0) - Bottom-Left
  // Q10: (1,0) - Bottom-Right
  // Q01: (0,1) - Top-Left
  // Q11: (1,1) - Top-Right
  
  const [q00, setQ00] = useState(2); // Bottom-Left (0,0)
  const [q10, setQ10] = useState(4); // Bottom-Right (1,0)
  const [q01, setQ01] = useState(3); // Top-Left (0,1)
  const [q11, setQ11] = useState(6); // Top-Right (1,1)

  // Interpolation deltas (normalized 0-1)
  const [dx, setDx] = useState(0.5);
  const [dy, setDy] = useState(0.5);

  // --- Calculations ---

  // Formula: f(x,y) = Q00(1-x)(1-y) + Q10(x)(1-y) + Q01(1-x)(y) + Q11(x)(y)
  const interpolatedValue = useMemo(() => {
    return (
      q00 * (1 - dx) * (1 - dy) +
      q10 * dx * (1 - dy) +
      q01 * (1 - dx) * dy +
      q11 * dx * dy
    );
  }, [q00, q10, q01, q11, dx, dy]);

  // Generate Surface Data (Hyperbolic Paraboloid)
  const chartData = useMemo(() => {
    const steps = 25;
    const xRange = Array.from({length: steps}, (_, i) => i / (steps - 1));
    const yRange = Array.from({length: steps}, (_, i) => i / (steps - 1));
    
    const zGrid = [];
    for(let j=0; j<steps; j++) { // y rows
        const row = [];
        const yVal = yRange[j];
        for(let i=0; i<steps; i++) { // x cols
            const xVal = xRange[i];
            const val = q00 * (1 - xVal) * (1 - yVal) +
                        q10 * xVal * (1 - yVal) +
                        q01 * (1 - xVal) * yVal +
                        q11 * xVal * yVal;
            row.push(val);
        }
        zGrid.push(row);
    }

    // --- Traces ---

    // 1. The Surface
    const surfaceTrace = {
        type: 'surface',
        x: xRange,
        y: yRange,
        z: zGrid,
        showscale: false,
        opacity: 0.8,
        colorscale: 'Viridis',
        contours: {
            x: { show: true, color: 'rgba(255,255,255,0.2)' },
            y: { show: true, color: 'rgba(255,255,255,0.2)' },
            z: { show: false }
        },
        hoverinfo: 'skip'
    };

    // 2. Corner Points (Q00, Q10, Q01, Q11)
    const cornersX = [0, 1, 0, 1];
    const cornersY = [0, 0, 1, 1];
    const cornersZ = [q00, q10, q01, q11];
    const cornerLabels = ['I(ξ,η)', 'I(ξ+1,η)', 'I(ξ,η+1)', 'I(ξ+1,η+1)'];
    
    const cornersTrace = {
        type: 'scatter3d',
        mode: 'markers+text',
        x: cornersX,
        y: cornersY,
        z: cornersZ,
        marker: { size: 6, color: '#facc15' }, // Amber-400
        text: cornerLabels,
        textposition: 'top center',
        textfont: { color: 'white' },
        hoverinfo: 'x+y+z+text',
        name: 'Corners'
    };

    // 3. Vertical Lines for Corners (Base to Value)
    const linesTraces = [];
    for(let i=0; i<4; i++) {
        linesTraces.push({
            type: 'scatter3d',
            mode: 'lines',
            x: [cornersX[i], cornersX[i]],
            y: [cornersY[i], cornersY[i]],
            z: [0, cornersZ[i]],
            line: { color: 'rgba(255, 255, 255, 0.3)', width: 4, dash: 'solid' },
            showlegend: false,
            hoverinfo: 'skip'
        });
    }

    // 4. Interpolated Point
    const pointTrace = {
        type: 'scatter3d',
        mode: 'markers',
        x: [dx],
        y: [dy],
        z: [interpolatedValue],
        marker: { size: 10, color: '#ef4444', symbol: 'diamond' }, // Red-500
        name: 'Interpolated P',
        hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<br>Val: %{z:.2f}<extra></extra>'
    };

    // 5. Vertical Line for Interpolated Point
    const pointLineTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [dx, dx],
        y: [dy, dy],
        z: [0, interpolatedValue],
        line: { color: '#ef4444', width: 6 },
        showlegend: false,
        hoverinfo: 'skip'
    };

    // 6. Base Square Outline (z=0)
    const baseTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [0, 1, 1, 0, 0],
        y: [0, 0, 1, 1, 0],
        z: [0, 0, 0, 0, 0],
        line: { color: 'rgba(255,255,255,0.5)', width: 4 },
        showlegend: false,
        hoverinfo: 'skip'
    };


    return [surfaceTrace, cornersTrace, ...linesTraces, pointLineTrace, pointTrace, baseTrace];
  }, [q00, q10, q01, q11, dx, dy, interpolatedValue]);


  // --- Layout ---
  const layout = useMemo(() => {
      return {
        autosize: true,
        height: 600,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        scene: {
            xaxis: { title: 'X (Delta X)', range: [-0.1, 1.1], gridcolor: '#333', zerolinecolor: '#666', showbackground: false },
            yaxis: { title: 'Y (Delta Y)', range: [-0.1, 1.1], gridcolor: '#333', zerolinecolor: '#666', showbackground: false },
            zaxis: { title: 'Pixel Value', range: [0, 10], gridcolor: '#333', zerolinecolor: '#666', showbackground: false },
            camera: {
                eye: { x: 1.5, y: 1.5, z: 1.2 }
            },
            aspectmode: 'manual',
            aspectratio: { x: 1, y: 1, z: 0.8 }
        },
        font: { color: '#a1a1aa' } // Tailwind neutral-400
      };
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Navigation */}
        <Link 
          href="/tools"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>

        {/* Header */}
        <header className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 pb-2">
            Bilinear Interpolation
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Visualize how pixel values are interpolated from four corner integer coordinates. 
            The surface creates a hyperbolic paraboloid connecting the four values in 3D space.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Interpolation Controls */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-6 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 uppercase tracking-wider border-b border-border/50 pb-2">
                    <Settings2 size={16} /> Coordinates
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Delta X (dx)</span>
                            <span className="font-mono text-red-400 font-bold">{dx.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={dx} onChange={(e) => setDx(Number(e.target.value))} 
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Delta Y (dy)</span>
                            <span className="font-mono text-red-400 font-bold">{dy.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={dy} onChange={(e) => setDy(Number(e.target.value))} 
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>
                </div>

                <div className="pt-2">
                     <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                        <div className="text-xs text-red-300 mb-1">Interpolated Value</div>
                        <div className="text-2xl font-mono font-bold text-red-500">{interpolatedValue.toFixed(3)}</div>
                     </div>
                </div>
            </div>

            {/* Corner Values Config */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider border-b border-border/50 pb-2">
                    Corner Values (Z)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Latex>{`$I(\\xi, \\eta+1)$`}</Latex>
                        </label>
                        <input type="number" value={q01} onChange={(e) => setQ01(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-amber-400 font-mono focus:border-amber-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Latex>{`$I(\\xi+1, \\eta+1)$`}</Latex>
                        </label>
                        <input type="number" value={q11} onChange={(e) => setQ11(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-amber-400 font-mono focus:border-amber-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Latex>{`$I(\\xi, \\eta)$`}</Latex>
                        </label>
                        <input type="number" value={q00} onChange={(e) => setQ00(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-amber-400 font-mono focus:border-amber-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Latex>{`$I(\\xi+1, \\eta)$`}</Latex>
                        </label>
                        <input type="number" value={q10} onChange={(e) => setQ10(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-amber-400 font-mono focus:border-amber-500 outline-none" />
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                    Modify the height (pixel value) of each corner to see how the surface adapts.
                </p>
            </div>
            
            {/* Math Formula */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                 <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 uppercase tracking-wider mb-3">
                    <Info size={16} /> Formula
                </h3>
                <div className="text-sm text-muted-foreground overflow-x-auto py-2 space-y-4">
                    <div className="space-y-1">
                         <div className="flex gap-4">
                             <Latex>{`$$\\xi = \\lfloor x \\rfloor$$`}</Latex>
                             <Latex>{`$$\\eta = \\lfloor y \\rfloor$$`}</Latex>
                         </div>
                         <div className="flex gap-4">
                             <Latex>{`$$\\Delta x = x - \\xi$$`}</Latex>
                             <Latex>{`$$\\Delta y = y - \\eta$$`}</Latex>
                         </div>
                    </div>

                    <div>
                        <div className="mb-2">
                            <Latex>{`$$I(x, y) \\approx$$`}</Latex>
                        </div>
                        <div className="pl-1 space-y-1">
                        <div><Latex>{`$$I(\\xi, \\eta)(1 - \\Delta x)(1 - \\Delta y) +$$`}</Latex></div>
                        <div><Latex>{`$$I(\\xi + 1, \\eta)\\Delta x(1 - \\Delta y) +$$`}</Latex></div>
                        <div><Latex>{`$$I(\\xi, \\eta + 1)(1 - \\Delta x)\\Delta y +$$`}</Latex></div>
                        <div><Latex>{`$$I(\\xi + 1, \\eta + 1)\\Delta x \\Delta y$$`}</Latex></div>
                        </div>
                    </div>
                </div>
            </div>

          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-9 space-y-6">
             <div className="w-full h-[600px] bg-card/50 rounded-xl border border-border overflow-hidden shadow-2xl relative">
                {/* 3D Plot */}
                <div className="absolute inset-0">
                    <Plot
                        data={chartData as any}
                        layout={layout as any}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false }}
                    />
                </div>
                
                {/* Overlay Hint */}
                <div className="absolute bottom-4 left-4 pointer-events-none bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-white/70 border border-white/10">
                    Click & Drag to Rotate • Scroll to Zoom
                </div>
             </div>
             
             {/* Explanation */}
             <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                 <h3 className="text-lg font-semibold mb-4 text-foreground/90">Key Concepts</h3>
                 <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
                     <li>
                         <strong className="text-foreground">2D Extension:</strong> Bilinear interpolation extends linear interpolation to a 2D grid. It performs linear interpolation first in one direction (e.g., X), and then interpolates those results in the other direction (Y).
                     </li>
                     <li>
                         <strong className="text-foreground">Weighted Average:</strong> The estimated value <Latex>{`$I(x, y)$`}</Latex> is a weighted average of the four nearest integer neighbors, where the weights are determined by the fractional distances <Latex>{`$\\Delta x$`}</Latex> and <Latex>{`$\\Delta y$`}</Latex>.
                     </li>
                     <li>
                         <strong className="text-foreground">Hyperbolic Paraboloid:</strong> Unlike a flat plane, the resulting surface is curved (a hyperbolic paraboloid). This ensures that the surface passes smoothly through all four corner points, even if they are not coplanar.
                     </li>
                 </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
