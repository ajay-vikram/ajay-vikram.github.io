"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Settings2, Calculator, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type Grid = number[][];

// --- Constants ---
const DEFAULT_INPUT_SIZE = 7;
const DEFAULT_KERNEL_SIZE = 3;

export default function CNNVisualizerPage() {
  // --- State ---
  const [inputSize, setInputSize] = useState(DEFAULT_INPUT_SIZE);
  const [kernelSize, setKernelSize] = useState(DEFAULT_KERNEL_SIZE);
  
  // Hyperparameters
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [dilation, setDilation] = useState(1);

  // Data
  const [inputGrid, setInputGrid] = useState<Grid>([]);
  const [kernelGrid, setKernelGrid] = useState<Grid>([]);
  const [outputGrid, setOutputGrid] = useState<Grid>([]);

  // Animation
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1); // -1 means no step active
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialization ---
  
  // Generate a simple pattern (e.g., a cross)
  const generateInput = (size: number) => {
    const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    for (let i = 0; i < size; i++) {
        grid[i][center] = 1;
        grid[center][i] = 1;
        // Add a diagonal for variety
        if(i % 2 === 0) grid[i][i] = 0.5;
    }
    return grid;
  };

  // Simple edge detection kernel
  const generateKernel = (size: number) => {
    const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
    grid[0][0] = 1; grid[0][1] = 0; grid[0][2] = -1;
    grid[1][0] = 1; grid[1][1] = 0; grid[1][2] = -1;
    grid[2][0] = 1; grid[2][1] = 0; grid[2][2] = -1;
    return grid;
  };

  useEffect(() => {
    setInputGrid(generateInput(inputSize));
    setKernelGrid(generateKernel(kernelSize));
  }, [inputSize, kernelSize]);

  // --- Computation Logic ---

  const computeOutputSize = useCallback(() => {
    // Output size = floor((Input + 2*Padding - Dilation*(Kernel-1) - 1)/Stride) + 1
    const size = Math.floor((inputSize + 2 * padding - dilation * (kernelSize - 1) - 1) / stride) + 1;
    return Math.max(0, size);
  }, [inputSize, padding, dilation, kernelSize, stride]);

  const outputSize = computeOutputSize();
  const totalSteps = outputSize * outputSize;

  // Compute full convolution result
  useEffect(() => {
    if (inputGrid.length === 0 || kernelGrid.length === 0) return;

    const out = Array(outputSize).fill(0).map(() => Array(outputSize).fill(0));

    // Pad input
    const paddedInputSize = inputSize + 2 * padding;
    const paddedInput = Array(paddedInputSize).fill(0).map(() => Array(paddedInputSize).fill(0));
    
    for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < inputSize; j++) {
            paddedInput[i + padding][j + padding] = inputGrid[i][j];
        }
    }

    for (let y = 0; y < outputSize; y++) {
        for (let x = 0; x < outputSize; x++) {
            let sum = 0;
            const startY = y * stride;
            const startX = x * stride;

            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const iy = startY + ky * dilation;
                    const ix = startX + kx * dilation;
                    
                    if (iy < paddedInputSize && ix < paddedInputSize) {
                        sum += paddedInput[iy][ix] * kernelGrid[ky][kx];
                    }
                }
            }
            out[y][x] = parseFloat(sum.toFixed(2));
        }
    }
    setOutputGrid(out);
  }, [inputGrid, kernelGrid, stride, padding, dilation, outputSize, inputSize, kernelSize]);


  // --- Animation Control ---

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(-1);
    if (animationRef.current) clearInterval(animationRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) clearInterval(animationRef.current);
    } else {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            if (animationRef.current) clearInterval(animationRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 500); // 500ms per step
    }
    return () => {
        if(animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying, totalSteps]);

  // Toggle input grid value on click
  const toggleInputCell = (r: number, c: number) => {
    const newGrid = inputGrid.map((row, rowIndex) => 
      row.map((val, colIndex) => {
        if (rowIndex === r && colIndex === c) {
          return val === 1 ? 0 : 1;
        }
        return val;
      })
    );
    setInputGrid(newGrid);
  };

  const handleRandomize = () => {
    // Randomize Input (0 or 1)
    const newInput = Array(inputSize).fill(0).map(() => 
        Array(inputSize).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    );
    // Randomize Kernel (-1, 0, 1)
    const newKernel = Array(kernelSize).fill(0).map(() => 
        Array(kernelSize).fill(0).map(() => Math.floor(Math.random() * 3) - 1)
    );
    setInputGrid(newInput);
    setKernelGrid(newKernel);
    handleReset();
  };


  // --- Helpers for Visualization ---
  
  // Get current active output coordinates (oy, ox)
  const getCurrentOutputCoords = () => {
      if (activeStep < 0) return null;
      const ox = activeStep % outputSize;
      const oy = Math.floor(activeStep / outputSize);
      return { ox, oy };
  };

  // Get active input cells and kernel cells based on current step
  const getActiveCells = () => {
      const coords = getCurrentOutputCoords();
      if (!coords) return { inputCells: [], calculationGrid: [] };
      const { ox, oy } = coords;

      const inputCells = [];
      const calculationGrid = [];

      const startY = oy * stride - padding; 
      const startX = ox * stride - padding;

      for (let ky = 0; ky < kernelSize; ky++) {
          const calcRow = [];
          for (let kx = 0; kx < kernelSize; kx++) {
              const iy = startY + ky * dilation;
              const ix = startX + kx * dilation;
              
              // Only highlight if inside actual input bounds
              const isValid = iy >= 0 && iy < inputSize && ix >= 0 && ix < inputSize;
              const inputVal = isValid && inputGrid[iy] ? inputGrid[iy][ix] : 0; // 0 for padding
              const kernelVal = kernelGrid[ky][kx];

              inputCells.push({ r: iy, c: ix, valid: isValid, kVal: kernelVal });
              calcRow.push({ 
                  iVal: inputVal, 
                  kVal: kernelVal, 
                  prod: inputVal * kernelVal 
              });
          }
          calculationGrid.push(calcRow);
      }

      return { inputCells, calculationGrid };
  };

  const { inputCells, calculationGrid } = getActiveCells();
  const activeOutputCoords = getCurrentOutputCoords();


  // --- Render Helpers ---
  
  const Cell = ({ value, isActive, isPadding, label, onClick, showKernelOverlay, kernelValue }: { value: number; isActive?: boolean; isPadding?: boolean, label?: string, onClick?: () => void, showKernelOverlay?: boolean, kernelValue?: number }) => (
    <div 
        onClick={onClick}
        className={cn(
        "relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xs md:text-sm font-mono border transition-all duration-200 rounded cursor-pointer select-none",
        isActive 
            ? "bg-blue-500/20 border-blue-500 z-10 shadow-lg shadow-blue-900/20" 
            : isPadding
                ? "bg-neutral-900/30 border-dashed border-neutral-700 text-neutral-600"
                : "bg-card border-border text-foreground hover:bg-neutral-800"
    )}>
      <span className={cn(value === 0 && "text-muted-foreground/50")}>{value}</span>
      
      {/* Kernel Overlay */}
      {isActive && showKernelOverlay && kernelValue !== undefined && (
          <div className="absolute inset-0 flex items-end justify-end p-0.5">
             <span className="text-[9px] font-bold text-amber-400 bg-black/60 px-0.5 rounded leading-none">x{kernelValue}</span>
          </div>
      )}

      {label && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Navigation */}
        <Link 
          href="/#tools" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 pb-2">
            CNN Visualizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize the working of a single channel 2D convolution
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Playback */}
            <div className="bg-card rounded-xl border border-border p-4 flex gap-2 justify-center shadow-lg">
               <button onClick={togglePlay} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm">
                <RotateCcw size={16} />
                Reset
              </button>
              <button onClick={handleRandomize} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm" title="Randomize Values">
                <Shuffle size={16} />
              </button>
            </div>

            {/* Hyperparameters */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 uppercase tracking-wider">
                <Settings2 size={16} /> Parameters
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stride</span>
                  <span className="font-mono text-cyan-400">{stride}</span>
                </div>
                <input type="range" min="1" max="3" value={stride} onChange={(e) => {setStride(Number(e.target.value)); handleReset();}} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Padding</span>
                  <span className="font-mono text-cyan-400">{padding}</span>
                </div>
                <input type="range" min="0" max="2" value={padding} onChange={(e) => {setPadding(Number(e.target.value)); handleReset();}} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dilation</span>
                  <span className="font-mono text-cyan-400">{dilation}</span>
                </div>
                <input type="range" min="1" max="2" value={dilation} onChange={(e) => {setDilation(Number(e.target.value)); handleReset();}} className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              </div>

               <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                   <div>Output Size: <span className="text-foreground font-mono font-bold">{outputSize} x {outputSize}</span></div>
               </div>
            </div>

            {/* Kernel Editor (Simplified View) */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                 <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Kernel ({kernelSize}x{kernelSize})</h3>
                 <div className="grid gap-1 place-content-center" style={{ gridTemplateColumns: `repeat(${kernelSize}, minmax(0, 1fr))` }}>
                    {kernelGrid.map((row, r) => (
                        row.map((val, c) => (
                             <input 
                                key={`${r}-${c}`}
                                type="number" 
                                value={val} 
                                onChange={(e) => {
                                    const newKernel = [...kernelGrid];
                                    newKernel[r][c] = Number(e.target.value);
                                    setKernelGrid(newKernel);
                                    handleReset();
                                }}
                                className="w-8 h-8 text-center text-xs bg-neutral-900 border border-neutral-700 rounded focus:border-cyan-500 outline-none text-amber-400 font-bold"
                             />
                        ))
                    ))}
                 </div>
            </div>

          </div>

          {/* Visualization Stage */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Grids Container */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center">
                
                {/* Input Grid */}
                <div className="space-y-2 text-center">
                    <h4 className="text-sm font-medium text-muted-foreground">Input ({inputSize}x{inputSize})</h4>
                    <div className="relative p-4 bg-neutral-900/20 rounded-xl border border-border/50">
                         {/* Render Padding Border Visual */}
                         <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${inputSize + 2 * padding}, minmax(0, 1fr))` }}>
                             {Array(inputSize + 2 * padding).fill(0).map((_, r) => (
                                 Array(inputSize + 2 * padding).fill(0).map((_, c) => {
                                     // Adjust coords to match original input
                                     const ir = r - padding;
                                     const ic = c - padding;
                                     const isPad = ir < 0 || ir >= inputSize || ic < 0 || ic >= inputSize;
                                     const value = isPad ? 0 : (inputGrid[ir] ? inputGrid[ir][ic] : 0);
                                     
                                     // Check if this cell is part of the current active window
                                     const activeCell = inputCells.find(cell => cell.r === ir && cell.c === ic);
                                     const isActive = !!activeCell;

                                     return (
                                        <Cell 
                                            key={`${r}-${c}`} 
                                            value={value} 
                                            isActive={isActive} 
                                            isPadding={isPad} 
                                            onClick={() => !isPad && toggleInputCell(ir, ic)}
                                            showKernelOverlay={true}
                                            kernelValue={activeCell?.kVal}
                                        />
                                     );
                                 })
                             ))}
                         </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Click cells to toggle values</p>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-center justify-center self-center opacity-50">
                   <span className="text-xs font-mono mb-1">Conv</span>
                   <ArrowLeft className="rotate-180 w-6 h-6" />
                </div>

                {/* Output Grid */}
                <div className="space-y-2 text-center">
                    <h4 className="text-sm font-medium text-muted-foreground">Output Feature Map ({outputSize}x{outputSize})</h4>
                     <div className="relative p-4 bg-neutral-900/20 rounded-xl border border-border/50 min-h-[200px] flex items-center justify-center">
                         {outputSize > 0 ? (
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${outputSize}, minmax(0, 1fr))` }}>
                                {outputGrid.map((row, r) => (
                                    row.map((val, c) => {
                                        const isActive = activeOutputCoords ? (activeOutputCoords.oy === r && activeOutputCoords.ox === c) : false;
                                        return (
                                            <Cell 
                                                key={`${r}-${c}`} 
                                                value={val} 
                                                isActive={isActive}
                                            />
                                        );
                                    })
                                ))}
                            </div>
                         ) : (
                             <p className="text-xs text-muted-foreground">Invalid Config</p>
                         )}
                    </div>
                </div>

            </div>

            {/* Calculation Log */}
            <div className="bg-card rounded-xl border border-border p-6 min-h-[200px] shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-foreground/80">
                    <Calculator size={16} /> 
                    Current Calculation {activeOutputCoords && <span className="text-muted-foreground font-normal ml-2">(Output at [{activeOutputCoords.oy}, {activeOutputCoords.ox}])</span>}
                </h3>
                
                {calculationGrid.length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="grid gap-2 p-4 bg-neutral-900/50 rounded-lg border border-border/50" style={{ gridTemplateColumns: `repeat(${kernelSize}, minmax(0, 1fr))` }}>
                            {calculationGrid.map((row, r) => (
                                row.map((item, c) => (
                                    <div key={`${r}-${c}`} className="flex flex-col items-center justify-center p-2 bg-neutral-800 rounded border border-neutral-700 text-xs">
                                        <div className="flex gap-1 items-center mb-1">
                                            <span className="text-cyan-200">{item.iVal}</span>
                                            <span className="text-[10px] text-muted-foreground">×</span>
                                            <span className="text-amber-400 font-bold">{item.kVal}</span>
                                        </div>
                                        <div className="border-t border-neutral-600 w-full text-center pt-1 font-mono font-bold text-white">
                                            {parseFloat(item.prod.toFixed(2))}
                                        </div>
                                    </div>
                                ))
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">Sum of products:</span>
                            <div className="text-xl font-bold text-foreground bg-blue-500/20 px-3 py-1 rounded border border-blue-500/50">
                                {calculationGrid.flat().reduce((acc, curr) => acc + curr.prod, 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-4">
                        <Play size={24} className="mb-2 opacity-50" />
                        <p>Press Play or slide parameters to start simulation</p>
                     </div>
                )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}