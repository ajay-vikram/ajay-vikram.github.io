"""Generate portfolio figures for the multi-task LLM post-training project."""

from __future__ import annotations

import json
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


PORTFOLIO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PORTFOLIO_ROOT.parent / "CPS572_Sp26_mini_project-main"
DETAIL_DIR = PORTFOLIO_ROOT / "assets" / "project-details"
THUMBNAIL_DIR = PORTFOLIO_ROOT / "assets" / "project-thumbnails"

BLUE = "#2F6FAB"
GREEN = "#3A8A62"
ORANGE = "#C7792B"
RED = "#B84A4A"
INK = "#26333D"
MUTED = "#66717A"
GRID = "#D9E0E6"
PALE_BLUE = "#DCE9F5"
PALE_RED = "#F2DADA"
BACKGROUND = "#FFFFFF"

plt.rcParams.update(
    {
        "figure.dpi": 160,
        "savefig.dpi": 200,
        "font.family": "DejaVu Sans",
        "font.size": 11,
        "axes.facecolor": BACKGROUND,
        "figure.facecolor": BACKGROUND,
        "axes.edgecolor": "#AAB4BC",
        "axes.labelcolor": INK,
        "axes.titlecolor": INK,
        "text.color": INK,
        "xtick.color": MUTED,
        "ytick.color": MUTED,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)


def smooth(values: list[float] | np.ndarray, window: int = 10) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    return np.array(
        [values[max(0, index - window + 1) : index + 1].mean() for index in range(len(values))]
    )


def finish_figure(fig: plt.Figure, path: Path) -> None:
    fig.savefig(path, bbox_inches="tight", facecolor=BACKGROUND)
    plt.close(fig)


def add_value_labels(ax: plt.Axes, bars, offset: float = 1.0) -> None:
    for bar in bars:
        value = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            value + offset,
            f"{value:.1f}",
            ha="center",
            va="bottom",
            fontsize=9,
            color=INK,
        )


def generate_data_selection_figure() -> None:
    # Selected Llama-3.2-3B SFT runs from Table 1 of the project report.
    labels = [
        "GSM8K only\n7k examples",
        "Small balanced\n15k examples",
        "Broad mixture\n120k examples",
        "Task-aligned\n89k examples",
    ]
    ifeval = np.array([22.3, 48.8, 53.3, 67.7])
    gsm8k = np.array([45.0, 37.4, 51.9, 59.4])
    humaneval = np.array([0.0, 32.3, 35.4, 40.2])

    x = np.arange(len(labels))
    width = 0.23
    fig, ax = plt.subplots(figsize=(10.2, 5.3))

    first = ax.bar(x - width, ifeval, width, color=BLUE, label="IFEval")
    second = ax.bar(x, gsm8k, width, color=GREEN, label="GSM8K")
    third = ax.bar(x + width, humaneval, width, color=ORANGE, label="HumanEval")

    add_value_labels(ax, first)
    add_value_labels(ax, second)
    add_value_labels(ax, third)

    ax.set_title(
        "Task-aligned data gave the best balance across all three tasks",
        loc="left",
        fontsize=14,
        pad=22,
        weight="normal",
    )
    ax.text(
        0,
        1.01,
        "Llama-3.2-3B benchmark accuracy (%)",
        transform=ax.transAxes,
        color=MUTED,
        fontsize=10,
    )
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(0, 80)
    ax.set_xticks(x, labels)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.legend(frameon=False, ncol=3, loc="upper left")
    fig.tight_layout()

    finish_figure(fig, DETAIL_DIR / "llm-post-training-data-selection.png")


def generate_stage_progression_figure() -> None:
    # Results from runs 16, 22, 24, and 25 in the project report.
    stages = [
        "Task-aligned\nSFT",
        "Mixed\nRLVR",
        "MBPP code\nRLVR",
        "Instruction\nRLVR",
    ]
    values = {
        "IFEval": ([74.6, 77.7, 78.2, 78.3], BLUE),
        "GSM8K": ([75.9, 78.1, 78.5, 78.2], GREEN),
        "HumanEval": ([53.0, 53.7, 58.5, 60.4], ORANGE),
        "Three-task average": ([67.8, 69.8, 71.7, 72.3], INK),
    }

    x = np.arange(len(stages))
    fig, ax = plt.subplots(figsize=(10.2, 5.1))
    for label, (scores, color) in values.items():
        is_average = label == "Three-task average"
        ax.plot(
            x,
            scores,
            color=color,
            linewidth=2.6 if is_average else 2.0,
            linestyle="--" if is_average else "-",
            marker="o",
            markersize=6,
            label=label,
            zorder=3,
        )

    label_offsets = {
        "IFEval": 0.35,
        "GSM8K": -0.30,
        "HumanEval": 0.0,
        "Three-task average": 0.0,
    }
    for label, (scores, color) in values.items():
        ax.text(
            x[-1] + 0.07,
            scores[-1] + label_offsets[label],
            f"{scores[-1]:.1f}",
            va="center",
            fontsize=9,
            color=color,
        )

    ax.set_title(
        "Performance across the four post-training stages",
        loc="left",
        fontsize=14,
        pad=22,
        weight="normal",
    )
    ax.text(
        0,
        1.01,
        "Llama-3.1-8B benchmark accuracy (%)",
        transform=ax.transAxes,
        color=MUTED,
        fontsize=10,
    )
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(48, 83)
    ax.set_xlim(-0.15, 3.45)
    ax.set_xticks(x, stages)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.legend(frameon=False, ncol=2, loc="lower right")
    fig.tight_layout()

    finish_figure(fig, DETAIL_DIR / "llm-post-training-stage-results.png")


def load_rlvr_metrics() -> list[dict]:
    path = (
        SOURCE_ROOT
        / "results"
        / "rlvr_gsm_math_if_from_tulu3_30k_if29k_code35k_8b_r64_v1"
        / "rl_metrics.jsonl"
    )
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def generate_reward_signal_figure() -> None:
    metrics = load_rlvr_metrics()
    steps = np.array([row["step"] + 1 for row in metrics])
    overall = np.array([row["reward"] for row in metrics])
    degenerate = np.array([row["frac_degenerate"] for row in metrics])
    gsm8k = np.array([row["per_subset"].get("gsm8k", 0.0) for row in metrics])
    ifeval = np.array([row["per_subset"].get("ifeval", 0.0) for row in metrics])
    math = np.array([row["per_subset"].get("MATH", 0.0) for row in metrics])

    fig, (left, right) = plt.subplots(1, 2, figsize=(11.2, 5.0))

    left.plot(steps, smooth(gsm8k), color=GREEN, linewidth=2.0, label="GSM8K")
    left.plot(steps, smooth(ifeval), color=BLUE, linewidth=2.0, label="IFEval")
    left.plot(steps, smooth(math), color=ORANGE, linewidth=2.0, label="MATH")
    left.set_title("Reward by task", loc="left", fontsize=12, weight="normal")
    left.set_xlabel("Training step")
    left.set_ylabel("Average reward")
    left.set_ylim(0, 0.75)
    left.grid(color=GRID, linewidth=0.8)
    left.legend(frameon=False)

    reward_line = right.plot(
        steps,
        smooth(overall),
        color=BLUE,
        linewidth=2.2,
        label="Overall reward",
    )[0]
    right.set_title(
        "Learning requires both passes and failures",
        loc="left",
        fontsize=12,
        weight="normal",
    )
    right.set_xlabel("Training step")
    right.set_ylabel("Average reward", color=BLUE)
    right.tick_params(axis="y", colors=BLUE)
    right.grid(color=GRID, linewidth=0.8)

    right_secondary = right.twinx()
    degenerate_line = right_secondary.plot(
        steps,
        smooth(degenerate),
        color=RED,
        linewidth=1.8,
        label="Groups with identical rewards",
    )[0]
    right_secondary.set_ylabel("Fraction of groups with identical rewards", color=RED)
    right_secondary.tick_params(axis="y", colors=RED)
    right_secondary.spines["top"].set_visible(False)
    right_secondary.set_ylim(0.45, 0.9)
    right.legend(
        [reward_line, degenerate_line],
        ["Overall reward", "Groups with identical rewards"],
        frameon=False,
        loc="upper center",
        bbox_to_anchor=(0.5, -0.20),
    )

    fig.suptitle(
        "RLVR helped GSM8K, while MATH was usually too difficult",
        x=0.055,
        ha="left",
        fontsize=14,
        weight="normal",
    )
    fig.tight_layout(rect=(0, 0.10, 1, 0.94))

    finish_figure(fig, DETAIL_DIR / "llm-post-training-reward-signal.png")


def load_mbpp_pass_rates() -> tuple[np.ndarray, np.ndarray]:
    path = SOURCE_ROOT / "results" / "anjy_stage2_rlvr_code" / "message (1).txt"
    matches = re.findall(
        r"step[:\s]+(\d+).*?pass[_\s]?rate[:\s]+([\d.]+)",
        path.read_text(),
        flags=re.IGNORECASE,
    )
    if not matches:
        raise ValueError(f"No MBPP pass-rate measurements found in {path}")
    steps, rewards = zip(*((int(step), float(reward)) for step, reward in matches))
    return np.asarray(steps), np.asarray(rewards)


def generate_code_alignment_figure() -> None:
    steps, pass_rates = load_mbpp_pass_rates()
    labels = ["Before code\nRLVR", "RL-format\nassertions", "MBPP\nunit tests"]
    humaneval = [53.7, 53.7, 58.5]

    fig, (left, right) = plt.subplots(
        1,
        2,
        figsize=(11.2, 4.6),
        gridspec_kw={"width_ratios": [0.86, 1.4]},
    )

    bars = left.bar(
        np.arange(3),
        humaneval,
        color=["#AAB4BC", RED, BLUE],
        width=0.65,
    )
    add_value_labels(left, bars, offset=0.7)
    left.plot([1, 1, 2, 2], [61.0, 62.5, 62.5, 61.0], color=BLUE, linewidth=1.3)
    left.text(
        1.5,
        63.5,
        "+4.8 points",
        ha="center",
        va="bottom",
        color=BLUE,
        fontsize=10,
        weight="normal",
    )
    left.set_title("Transfer to HumanEval", loc="left", fontsize=12, weight="normal")
    left.set_ylabel("Accuracy (%)")
    left.set_ylim(0, 70)
    left.set_xticks(np.arange(3), labels)
    left.grid(axis="y", color=GRID, linewidth=0.8)
    left.set_axisbelow(True)

    right.plot(steps, pass_rates, color=PALE_BLUE, linewidth=1.0, label="Per-step pass rate")
    right.plot(
        steps,
        smooth(pass_rates),
        color=BLUE,
        linewidth=2.2,
        label="10-step moving average",
    )
    right.set_title("MBPP unit-test pass rate", loc="left", fontsize=12, weight="normal")
    right.set_xlabel("Training step")
    right.set_ylabel("Pass rate")
    right.set_ylim(0.25, 1.02)
    right.grid(color=GRID, linewidth=0.8)
    right.legend(frameon=False, loc="lower right")

    fig.suptitle(
        "Code rewards helped when training matched HumanEval's format",
        x=0.055,
        ha="left",
        fontsize=14,
        weight="normal",
    )
    fig.tight_layout(rect=(0, 0, 1, 0.94))

    finish_figure(fig, DETAIL_DIR / "llm-post-training-code-alignment.png")


def generate_thumbnail() -> None:
    fig = plt.figure(figsize=(12, 6.75), facecolor="#F5F8FA")
    canvas = fig.add_axes((0, 0, 1, 1))
    canvas.set_xlim(0, 1)
    canvas.set_ylim(0, 1)
    canvas.axis("off")

    stage_y = 0.84
    stage_x = [0.19, 0.5, 0.81]
    stage_labels = ["Task-aligned SFT", "Mixed RLVR", "Code RLVR"]
    for index, (x_pos, label) in enumerate(zip(stage_x, stage_labels)):
        canvas.text(
            x_pos,
            stage_y,
            label,
            ha="center",
            va="center",
            fontsize=12,
            color=INK,
            bbox={
                "boxstyle": "round,pad=0.65,rounding_size=0.15",
                "facecolor": BACKGROUND,
                "edgecolor": "#B9C5CE",
                "linewidth": 1.2,
            },
        )
        if index < len(stage_x) - 1:
            canvas.annotate(
                "",
                xy=(stage_x[index + 1] - 0.105, stage_y),
                xytext=(x_pos + 0.105, stage_y),
                arrowprops={"arrowstyle": "->", "color": BLUE, "lw": 1.7},
            )

    chart = fig.add_axes((0.08, 0.12, 0.84, 0.56), facecolor="#F5F8FA")
    tasks = ["Instruction", "Math", "Code"]
    scores = [78.3, 78.2, 60.4]
    colors = [BLUE, GREEN, ORANGE]
    y = np.arange(3)
    chart.barh(y, scores, color=colors, height=0.54)
    chart.set_xlim(0, 100)
    chart.set_yticks(y, tasks)
    chart.invert_yaxis()
    chart.set_xticks([0, 50, 100])
    chart.grid(axis="x", color=GRID, linewidth=0.8)
    chart.set_axisbelow(True)
    chart.spines["left"].set_visible(False)
    chart.spines["bottom"].set_visible(False)
    chart.set_yticklabels([])
    chart.tick_params(axis="y", length=0)
    chart.tick_params(axis="x", labelsize=10)
    for index, value in enumerate(scores):
        chart.text(3, index, tasks[index], va="center", color=BACKGROUND, fontsize=15)
        chart.text(value + 1.8, index, f"{value:.1f}", va="center", color=INK, fontsize=15)

    finish_figure(fig, THUMBNAIL_DIR / "llm-post-training.png")


def main() -> None:
    DETAIL_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

    generate_data_selection_figure()
    generate_stage_progression_figure()
    generate_reward_signal_figure()
    generate_code_alignment_figure()
    generate_thumbnail()

    print("Generated multi-task LLM post-training figures.")


if __name__ == "__main__":
    main()
