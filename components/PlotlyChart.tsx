"use client";

import React from "react";
import Plot from "react-plotly.js";
import { Data, Layout } from "plotly.js";

interface PlotlyChartProps {
  data: Data[];
  layout: Layout;
  config?: any;
}

export default function PlotlyChart({ data, layout, config }: PlotlyChartProps) {
  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      style={{ width: "100%", height: "100%" }}
      useResizeHandler={true}
    />
  );
}
