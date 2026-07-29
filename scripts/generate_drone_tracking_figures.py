#!/usr/bin/env python3
"""Generate portfolio figures from the drone-tracking event recording."""

from __future__ import annotations

import argparse
from pathlib import Path

import event_stream
import matplotlib
import numpy as np
from scipy.optimize import linear_sum_assignment

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.colors import Normalize


START_TIME = 10.0
END_TIME = 20.0
WINDOW_SECONDS = 0.05
ROI_X = (400, 900)
ROI_Y = (100, 720)
CLUSTER_DISTANCE = 40
MIN_CLUSTER_SIZE = 10
ASSOCIATION_DISTANCE = 100
MAX_MISSED = 3
VELOCITY_ALPHA = 0.3

TEXT = "#333333"
MUTED = "#666666"
GRID = "#dddddd"
BLUE = "#1a55b5"
GREEN = "#008800"
OFF = "#aeb5bf"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("recording", type=Path, help="Path to the .es event recording")
    parser.add_argument("output_dir", type=Path, help="Directory for generated PNG files")
    return parser.parse_args()


def load_events(path: Path) -> np.ndarray:
    with event_stream.Decoder(str(path)) as decoder:
        events = np.concatenate([chunk for chunk in decoder])

    start = int(START_TIME * 1e6)
    end = int(END_TIME * 1e6)
    first = np.searchsorted(events["t"], start, side="left")
    last = np.searchsorted(events["t"], end, side="left")
    events = events[first:last]

    in_roi = (
        (events["x"] >= ROI_X[0])
        & (events["x"] <= ROI_X[1])
        & (events["y"] >= ROI_Y[0])
        & (events["y"] <= ROI_Y[1])
    )
    return events[in_roi]


def cluster_events(events: np.ndarray) -> list[dict]:
    clusters: list[dict] = []

    for event in events:
        x = int(event["x"])
        y = int(event["y"])
        matched = None

        for cluster in clusters:
            cx, cy = cluster["centroid"]
            if abs(x - cx) + abs(y - cy) <= CLUSTER_DISTANCE:
                matched = cluster
                break

        if matched is None:
            clusters.append(
                {
                    "x": [x],
                    "y": [y],
                    "sum_x": x,
                    "sum_y": y,
                    "centroid": (float(x), float(y)),
                }
            )
            continue

        matched["x"].append(x)
        matched["y"].append(y)
        matched["sum_x"] += x
        matched["sum_y"] += y
        count = len(matched["x"])
        matched["centroid"] = (
            matched["sum_x"] / count,
            matched["sum_y"] / count,
        )

    return clusters


class Tracker:
    def __init__(self) -> None:
        self.tracks: list[dict] = []
        self.next_id = 0

    def update(self, detections: list[dict]) -> None:
        predictions = []
        for track in self.tracks:
            predictions.append(
                (
                    track["centroid"][0] + track["velocity"][0] * WINDOW_SECONDS,
                    track["centroid"][1] + track["velocity"][1] * WINDOW_SECONDS,
                )
            )
            track["missed"] += 1

        costs = np.zeros((len(self.tracks), len(detections)))
        for row, prediction in enumerate(predictions):
            for column, detection in enumerate(detections):
                centroid = detection["centroid"]
                costs[row, column] = np.hypot(
                    prediction[0] - centroid[0],
                    prediction[1] - centroid[1],
                )

        if self.tracks and detections:
            rows, columns = linear_sum_assignment(costs)
        else:
            rows, columns = [], []

        matched_detections = set()
        for row, column in zip(rows, columns):
            if costs[row, column] < ASSOCIATION_DISTANCE:
                self._update_track(self.tracks[row], detections[column])
                matched_detections.add(column)

        for index, detection in enumerate(detections):
            if index not in matched_detections:
                self._create_track(detection)

        self.tracks = [
            track for track in self.tracks if track["missed"] <= MAX_MISSED
        ]

    def _create_track(self, detection: dict) -> None:
        self.tracks.append(
            {
                "id": self.next_id,
                "centroid": detection["centroid"],
                "velocity": (0.0, 0.0),
                "event_count": len(detection["x"]),
                "missed": 0,
                "age": 1,
            }
        )
        self.next_id += 1

    @staticmethod
    def _update_track(track: dict, detection: dict) -> None:
        centroid = detection["centroid"]
        vx = (centroid[0] - track["centroid"][0]) / WINDOW_SECONDS
        vy = (centroid[1] - track["centroid"][1]) / WINDOW_SECONDS
        track["velocity"] = (
            VELOCITY_ALPHA * vx + (1 - VELOCITY_ALPHA) * track["velocity"][0],
            VELOCITY_ALPHA * vy + (1 - VELOCITY_ALPHA) * track["velocity"][1],
        )
        track["centroid"] = centroid
        track["event_count"] = len(detection["x"])
        track["missed"] = 0
        track["age"] += 1


def analyze(events: np.ndarray) -> tuple[list[dict], list[dict]]:
    window_count = round((END_TIME - START_TIME) / WINDOW_SECONDS)
    edges = (START_TIME + np.arange(window_count + 1) * WINDOW_SECONDS) * 1e6
    tracker = Tracker()
    windows = []
    track_samples = []

    for index in range(window_count):
        first = np.searchsorted(events["t"], edges[index], side="left")
        last = np.searchsorted(events["t"], edges[index + 1], side="left")
        all_events = events[first:last]
        positive_events = all_events[all_events["p"]]
        clusters = cluster_events(positive_events) if len(positive_events) >= 5 else []
        detections = [
            cluster for cluster in clusters if len(cluster["x"]) >= MIN_CLUSTER_SIZE
        ]
        tracker.update(detections)

        mature_tracks = [
            track
            for track in tracker.tracks
            if track["missed"] == 0 and track["age"] >= 3
        ]
        dominant = (
            max(mature_tracks, key=lambda track: track["event_count"])
            if mature_tracks
            else None
        )
        time = START_TIME + (index + 0.5) * WINDOW_SECONDS

        windows.append(
            {
                "time": time,
                "all_events": all_events,
                "positive_events": positive_events,
                "clusters": clusters,
                "detections": detections,
            }
        )

        if dominant is not None:
            track_samples.append(
                {
                    "time": time,
                    "id": dominant["id"],
                    "x": dominant["centroid"][0],
                    "y": dominant["centroid"][1],
                    "vx": dominant["velocity"][0],
                    "vy": dominant["velocity"][1],
                    "speed": np.hypot(*dominant["velocity"]),
                }
            )

    return windows, track_samples


def style_axis(axis: plt.Axes, title: str) -> None:
    axis.set_title(title, color=TEXT, fontsize=12, pad=10)
    axis.set_xlim(*ROI_X)
    axis.set_ylim(ROI_Y[1], ROI_Y[0])
    axis.set_aspect("equal")
    axis.set_xlabel("x (pixels)", color=MUTED)
    axis.tick_params(colors=MUTED, labelsize=8)
    for spine in axis.spines.values():
        spine.set_color(GRID)


def plot_event_reduction(window: dict, output_path: Path) -> None:
    all_events = window["all_events"]
    positive = window["positive_events"]
    accepted_count = sum(len(cluster["x"]) for cluster in window["detections"])

    fig, axes = plt.subplots(1, 3, figsize=(13.5, 5.1), constrained_layout=True)
    fig.patch.set_facecolor("white")

    negative = all_events[~all_events["p"]]
    axes[0].scatter(negative["x"], negative["y"], s=5, c=OFF, alpha=0.5, label="OFF")
    axes[0].scatter(positive["x"], positive["y"], s=5, c=BLUE, alpha=0.7, label="ON")
    style_axis(axes[0], f"1. Raw sensor events\n{len(all_events):,} ON + OFF events")
    axes[0].set_ylabel("y (pixels)", color=MUTED)
    axes[0].legend(frameon=False, fontsize=8, markerscale=3, loc="lower left")

    axes[1].scatter(positive["x"], positive["y"], s=5, c=BLUE, alpha=0.7)
    style_axis(axes[1], f"2. After polarity filtering\n{len(positive):,} ON events remain")

    palette = [BLUE, GREEN, "#bd5d38", "#7b61a8"]
    for index, cluster in enumerate(window["detections"]):
        color = palette[index % len(palette)]
        axes[2].scatter(cluster["x"], cluster["y"], s=6, c=color, alpha=0.75)
        axes[2].scatter(
            *cluster["centroid"],
            s=42,
            c=color,
            edgecolors="white",
            linewidths=0.9,
            zorder=3,
        )
    style_axis(
        axes[2],
        f"3. After cluster-size filtering\n"
        f"{len(window['detections'])} detections | {accepted_count:,} events remain",
    )

    fig.savefig(output_path, dpi=180, facecolor="white")
    plt.close(fig)


def plot_motion(track_samples: list[dict], output_path: Path) -> None:
    times = np.array([sample["time"] for sample in track_samples])
    xs = np.array([sample["x"] for sample in track_samples])
    ys = np.array([sample["y"] for sample in track_samples])
    speeds = np.array([sample["speed"] for sample in track_samples])

    points = np.column_stack([xs, ys]).reshape(-1, 1, 2)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)
    norm = Normalize(times.min(), times.max())

    fig, axes = plt.subplots(1, 2, figsize=(13.5, 5.2), constrained_layout=True)
    fig.patch.set_facecolor("white")

    trajectory = LineCollection(
        segments,
        cmap="viridis",
        norm=norm,
        linewidth=3,
    )
    trajectory.set_array(times[:-1])
    axes[0].add_collection(trajectory)
    axes[0].scatter(xs[0], ys[0], s=50, c=GREEN, edgecolors="white", zorder=3)
    axes[0].scatter(xs[-1], ys[-1], s=50, c=TEXT, edgecolors="white", zorder=3)
    axes[0].annotate(
        "start",
        (xs[0], ys[0]),
        xytext=(7, -13),
        textcoords="offset points",
        color=MUTED,
        fontsize=9,
    )
    axes[0].annotate(
        "end",
        (xs[-1], ys[-1]),
        xytext=(7, -13),
        textcoords="offset points",
        color=MUTED,
        fontsize=9,
    )
    axes[0].set_xlim(540, 880)
    axes[0].set_ylim(330, 575)
    axes[0].set_aspect("equal")
    axes[0].set_xlabel("x (pixels)", color=MUTED)
    axes[0].set_ylabel("y (pixels)", color=MUTED)
    axes[0].set_title("Tracked path from cluster centers", color=TEXT, fontsize=12, pad=10)
    axes[0].tick_params(colors=MUTED, labelsize=8)
    for spine in axes[0].spines.values():
        spine.set_color(GRID)
    colorbar = fig.colorbar(trajectory, ax=axes[0], fraction=0.05, pad=0.03)
    colorbar.set_label("time (s)", color=MUTED)
    colorbar.ax.tick_params(colors=MUTED, labelsize=8)
    colorbar.outline.set_edgecolor(GRID)

    axes[1].plot(times, speeds, color=BLUE, linewidth=2)
    axes[1].fill_between(times, speeds, color=BLUE, alpha=0.1)
    turn_region = (times >= 14.0) & (times <= 16.0)
    turn_index = np.flatnonzero(turn_region)[np.argmin(speeds[turn_region])]
    axes[1].scatter(
        times[turn_index],
        speeds[turn_index],
        s=42,
        c=GREEN,
        edgecolors="white",
        zorder=3,
    )
    axes[1].annotate(
        "slower at the turn",
        (times[turn_index], speeds[turn_index]),
        xytext=(16, 26),
        textcoords="offset points",
        arrowprops={"arrowstyle": "-", "color": MUTED, "linewidth": 0.9},
        color=MUTED,
        fontsize=9,
    )
    axes[1].set_xlim(START_TIME, END_TIME)
    axes[1].set_ylim(bottom=0)
    axes[1].set_xlabel("time (s)", color=MUTED)
    axes[1].set_ylabel("smoothed speed (pixels/s)", color=MUTED)
    axes[1].set_title("Estimated speed across the sensor", color=TEXT, fontsize=12, pad=10)
    axes[1].grid(axis="y", color=GRID, linewidth=0.8)
    axes[1].tick_params(colors=MUTED, labelsize=8)
    for spine in axes[1].spines.values():
        spine.set_color(GRID)

    fig.savefig(output_path, dpi=180, facecolor="white")
    plt.close(fig)


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    events = load_events(args.recording)
    windows, track_samples = analyze(events)

    snapshot_index = round((10.5 - START_TIME) / WINDOW_SECONDS)
    plot_event_reduction(
        windows[snapshot_index],
        args.output_dir / "drone-tracking-event-reduction.png",
    )
    plot_motion(
        track_samples,
        args.output_dir / "drone-tracking-motion-analysis.png",
    )

    track_ids = {sample["id"] for sample in track_samples}
    snapshot = windows[snapshot_index]
    accepted_events = sum(len(cluster["x"]) for cluster in snapshot["detections"])
    print(
        f"snapshot={snapshot['time']:.3f}s "
        f"events={len(snapshot['all_events'])} "
        f"positive={len(snapshot['positive_events'])} "
        f"clusters={len(snapshot['clusters'])} "
        f"detections={len(snapshot['detections'])} "
        f"accepted_events={accepted_events}"
    )
    print(
        f"tracked_windows={len(track_samples)}/{len(windows)} "
        f"dominant_track_ids={sorted(track_ids)}"
    )


if __name__ == "__main__":
    main()
