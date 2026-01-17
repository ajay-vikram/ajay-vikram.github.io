"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Play, Pause, RotateCcw, Settings2, ArrowLeft } from "lucide-react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// Dynamically import PlotlyChart with SSR disabled
const PlotlyChart = dynamic(() => import("@/components/PlotlyChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-card animate-pulse rounded-xl flex items-center justify-center text-muted-foreground border border-blue-500/10">
      Loading Optimizer Visualization...
    </div>
  ),
});

// --- Mathematical Functions & Gradients ---

type Point = { x: number; y: number };
type LossFunction = (x: number, y: number, a?: number, b?: number) => number;
type GradientFunction = (x: number, y: number, a?: number, b?: number) => Point;

const FUNCTIONS = {
  Quadratic: {
    name: "Quadratic Bowl",
    formula: "f(x,y) = ax^2 + by^2",
    fn: (x: number, y: number, a = 1, b = 1) => a * x * x + b * y * y,
    grad: (x: number, y: number, a = 1, b = 1) => ({ x: 2 * a * x, y: 2 * b * y }),
    range: { x: [-2, 2], y: [-2, 2] },
    start: { x: 1.5, y: 1.5 },
    latex: "f(x,y) = ax^2 + by^2"
  }
};

// --- Optimizer Implementations ---

type OptimizerState = {
  path: Point[];
  velocity?: Point; // For Momentum, Adam
  squaredGrad?: Point; // For RMSProp, Adam
  t?: number; // Time step for Adam
  color: string;
  name: string;
};

const INITIAL_OPTIMIZERS: Record<string, OptimizerState> = {
  SGD: { path: [], color: "#ef4444", name: "SGD" }, // Red
  Momentum: { path: [], velocity: { x: 0, y: 0 }, color: "#f59e0b", name: "Momentum" }, // Amber
  RMSProp: { path: [], squaredGrad: { x: 0, y: 0 }, color: "#10b981", name: "RMSProp" }, // Green
  Adam: { path: [], velocity: { x: 0, y: 0 }, squaredGrad: { x: 0, y: 0 }, t: 0, color: "#3b82f6", name: "Adam" } // Blue
};

export default function OptimizerSimulatorPage() {
  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [selectedFunction, setSelectedFunction] = useState<keyof typeof FUNCTIONS>("Quadratic");
  const [optimizers, setOptimizers] = useState<Record<string, OptimizerState>>({});
  
  // Hyperparameters
  const [learningRate, setLearningRate] = useState(0.01);
  const [momentumBeta, setMomentumBeta] = useState(0.9); // Momentum Gamma
  const [rmsBeta, setRmsBeta] = useState(0.9); // RMSProp Beta
  const [adamBeta1, setAdamBeta1] = useState(0.9);
  const [adamBeta2, setAdamBeta2] = useState(0.999);
  const [curvatureX, setCurvatureX] = useState(1); // 'a' in Quadratic
  const [curvatureY, setCurvatureY] = useState(10); // 'b' in Quadratic (High condition number by default)

  const animationRef = useRef<number>();

  // Initialize Optimizers
  const resetSimulation = useCallback(() => {
    const startPoint = FUNCTIONS[selectedFunction].start;
    const initialOps = JSON.parse(JSON.stringify(INITIAL_OPTIMIZERS)); // Deep copy
    
    Object.keys(initialOps).forEach(key => {
      initialOps[key].path = [startPoint];
      initialOps[key].velocity = { x: 0, y: 0 };
      initialOps[key].squaredGrad = { x: 0, y: 0 };
      initialOps[key].t = 0;
    });

    setOptimizers(initialOps);
    setIteration(0);
    setIsPlaying(false);
  }, [selectedFunction]);

  // Init on load
  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  // Animation Loop
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = window.setInterval(() => {
        step();
      }, 50); // 20fps
    } else {
      clearInterval(animationRef.current);
    }
    return () => clearInterval(animationRef.current);
  }, [isPlaying, optimizers]); // Dep on optimizers to access latest state in step() if strictly functional, but simpler to use functional state update

  const step = () => {
    setOptimizers(prev => {
      const nextState = { ...prev };
      const func = FUNCTIONS[selectedFunction];
      const gradFn = func.grad;
      const epsilon = 1e-8;

      Object.keys(nextState).forEach(key => {
        const opt = nextState[key];
        const currentPos = opt.path[opt.path.length - 1];
        
        // Stop if diverged too far or NaN
        if (Math.abs(currentPos.x) > 5 || Math.abs(currentPos.y) > 5 || isNaN(currentPos.x)) return;

        const grad = gradFn(currentPos.x, currentPos.y, curvatureX, curvatureY);
        let nextPos = { ...currentPos };

        if (key === "SGD") {
          nextPos.x -= learningRate * grad.x;
          nextPos.y -= learningRate * grad.y;
        } else if (key === "Momentum") {
          const v = opt.velocity!;
          v.x = momentumBeta * v.x + learningRate * grad.x;
          v.y = momentumBeta * v.y + learningRate * grad.y;
          nextPos.x -= v.x;
          nextPos.y -= v.y;
        } else if (key === "RMSProp") {
          const s = opt.squaredGrad!;
          s.x = rmsBeta * s.x + (1 - rmsBeta) * grad.x * grad.x;
          s.y = rmsBeta * s.y + (1 - rmsBeta) * grad.y * grad.y;
          nextPos.x -= (learningRate / (Math.sqrt(s.x) + epsilon)) * grad.x;
          nextPos.y -= (learningRate / (Math.sqrt(s.y) + epsilon)) * grad.y;
        } else if (key === "Adam") {
          const t = opt.t! + 1;
          opt.t = t;
          const m = opt.velocity!;
          const v = opt.squaredGrad!;

          m.x = adamBeta1 * m.x + (1 - adamBeta1) * grad.x;
          m.y = adamBeta1 * m.y + (1 - adamBeta1) * grad.y;
          
          v.x = adamBeta2 * v.x + (1 - adamBeta2) * grad.x * grad.x;
          v.y = adamBeta2 * v.y + (1 - adamBeta2) * grad.y * grad.y;

          const mHatX = m.x / (1 - Math.pow(adamBeta1, t));
          const mHatY = m.y / (1 - Math.pow(adamBeta1, t));
          const vHatX = v.x / (1 - Math.pow(adamBeta2, t));
          const vHatY = v.y / (1 - Math.pow(adamBeta2, t));

          nextPos.x -= (learningRate * mHatX) / (Math.sqrt(vHatX) + epsilon);
          nextPos.y -= (learningRate * mHatY) / (Math.sqrt(vHatY) + epsilon);
        }

        opt.path = [...opt.path, nextPos];
      });
      return nextState;
    });
    setIteration(prev => prev + 1);
  };

  // --- Plotting Logic ---

  const generateContourData = () => {
    const func = FUNCTIONS[selectedFunction];
    const { x: xRange, y: yRange } = func.range;
    const x = [], y = [], z = [];
    const stepX = (xRange[1] - xRange[0]) / 100;
    const stepY = (yRange[1] - yRange[0]) / 100;

    for (let i = xRange[0]; i <= xRange[1]; i += stepX) x.push(i);
    for (let j = yRange[0]; j <= yRange[1]; j += stepY) y.push(j);

    for (let j = 0; j < y.length; j++) {
      const row = [];
      for (let i = 0; i < x.length; i++) {
        // Apply curvature only if Quadratic
        const val = selectedFunction === "Quadratic" 
          ? func.fn(x[i], y[j], curvatureX, curvatureY)
          : func.fn(x[i], y[j]);
        row.push(val);
      }
      z.push(row);
    }

    // Base contour plot
    const traces: any[] = [{
      z: z,
      x: x,
      y: y,
      type: 'contour',
      colorscale: 'Viridis',
      contours: {
        coloring: 'heatmap',
        showlabels: true,
        labelfont: { family: 'sans-serif', size: 12, color: 'white' }
      },
      colorbar: {
        title: 'Loss',
        titleside: 'right',
        tickfont: { color: '#a3a3a3' }
      }
    }];

    // Optimizer paths
    Object.values(optimizers).forEach(opt => {
      if (opt.path.length === 0) return;
      traces.push({
        x: opt.path.map(p => p.x),
        y: opt.path.map(p => p.y),
        mode: 'lines+markers',
        type: 'scatter',
        name: opt.name,
        line: { color: opt.color, width: 2 },
        marker: { size: 4 }
      });
      // Start point
      traces.push({
        x: [opt.path[0].x],
        y: [opt.path[0].y],
        mode: 'markers',
        type: 'scatter',
        name: `${opt.name} Start`,
        showlegend: false,
        marker: { size: 8, color: opt.color, symbol: 'circle-open', line: {width: 2} }
      });
    });

    return traces;
  };

  const layout = {
    title: {
      text: FUNCTIONS[selectedFunction].name,
      font: { family: "sans-serif", size: 20, color: "#fafafa" },
      y: 0.95
    },
    xaxis: {
      range: FUNCTIONS[selectedFunction].range.x,
      title: { text: "w1 (Weight 1)", font: { color: "#a3a3a3" } },
      tickfont: { color: "#a3a3a3" },
      gridcolor: "#262626"
    },
    yaxis: {
      range: FUNCTIONS[selectedFunction].range.y,
      title: { text: "w2 (Weight 2)", font: { color: "#a3a3a3" } },
      tickfont: { color: "#a3a3a3" },
      gridcolor: "#262626"
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "sans-serif", color: "#fafafa" },
    showlegend: true,
    legend: { x: 1, xanchor: 'right', y: 1, font: { color: "#fafafa" }, bgcolor: 'rgba(0,0,0,0.5)' },
    margin: { t: 50, l: 50, r: 50, b: 50 },
    autosize: true
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <Link 
          href="/#tools" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 pb-2">
            Optimizer Simulator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize how different optimization algorithms navigate loss landscapes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Playback Controls */}
            <div className="bg-card rounded-xl border border-border p-4 flex gap-4 justify-center shadow-lg">
               <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetSimulation}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>

            {/* Scenario Configuration */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 size={18} /> Landscape
              </h3>
              
              <div className="space-y-4 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Curvature Control</p>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>X Curvature (a)</span>
                      <span className="font-mono text-blue-400">{curvatureX.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0.1" max="5" step="0.1"
                      value={curvatureX}
                      onChange={(e) => setCurvatureX(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Y Curvature (b)</span>
                      <span className="font-mono text-blue-400">{curvatureY.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0.1" max="20" step="0.1"
                      value={curvatureY}
                      onChange={(e) => setCurvatureY(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">High ratio creates a narrow valley (bad condition number).</p>
                  </div>
                </div>
               
               <div className="pt-2 border-t border-border/50">
                 <div className="bg-neutral-900/50 p-3 rounded-md border border-neutral-800 flex justify-center">
                    <Latex>{`$$${FUNCTIONS[selectedFunction].latex}$$`}</Latex>
                 </div>
               </div>
            </div>

            {/* Hyperparameters */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h3 className="text-lg font-semibold">Hyperparameters</h3>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Learning Rate</span>
                  <span className="font-mono text-green-400">{learningRate}</span>
                </div>
                <input
                  type="range" min="0.001" max="0.5" step="0.001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Momentum <Latex>$\beta$</Latex></span>
                  <span className="font-mono text-amber-400">{momentumBeta}</span>
                </div>
                <input
                  type="range" min="0" max="0.99" step="0.01"
                  value={momentumBeta}
                  onChange={(e) => setMomentumBeta(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Adam <Latex>$\beta_1$</Latex></span>
                  <span className="font-mono text-blue-400">{adamBeta1}</span>
                </div>
                <input
                  type="range" min="0" max="0.99" step="0.01"
                  value={adamBeta1}
                  onChange={(e) => setAdamBeta1(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Adam <Latex>$\beta_2$</Latex></span>
                  <span className="font-mono text-blue-400">{adamBeta2}</span>
                </div>
                <input
                  type="range" min="0" max="0.999" step="0.001"
                  value={adamBeta2}
                  onChange={(e) => setAdamBeta2(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-8 space-y-4">
             <div className="bg-card rounded-xl border border-border shadow-lg p-2 min-h-[600px] flex flex-col relative overflow-hidden">
                <PlotlyChart
                  data={generateContourData()}
                  layout={layout as any}
                  config={{ responsive: true, displayModeBar: false }}
                />
                
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs space-y-1 pointer-events-none">
                   <div className="font-semibold text-white mb-1">Iterations: {iteration}</div>
                </div>
             </div>
             
             <div className="bg-muted/20 rounded-lg p-4 border border-border/50 text-sm text-muted-foreground leading-relaxed">
               <strong className="text-foreground">Insight:</strong> <br/>
               Notice how <span className="text-blue-400 font-medium">Adam</span> and <span className="text-green-400 font-medium">RMSProp</span> adapt their step sizes to the curvature (moving fast in flat directions, slow in steep ones), often converging faster on the <strong>Quadratic Bowl</strong> with high curvature. However, <span className="text-amber-400 font-medium">Momentum</span> builds up velocity and can oscillate or overshoot, but often escapes shallow local minima better than pure <span className="text-red-400 font-medium">SGD</span>.
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
