---
layout: project
title: "BCI"
permalink: /BCI/
---

# Decoding Hand Kinematics in Brain-Computer Interfaces with State-Space Models

## Overview
This project focused on decoding continuous hand movements from brain activity. While most BCI models classify discrete movement intentions, we tackled the more complex task of predicting **continuous hand trajectories** — essential for fine motor control in real-world applications.

---

## Dataset & Task
We used the [Nonhuman Primate Reaching with Multichannel Sensorimotor Cortex Electrophysiology](https://zenodo.org/records/583331) dataset, which contains spike recordings from two macaques (Indy and Loco) reaching for targets arranged in an 8×8 grid.

- **96–192 channels** from motor and somatosensory cortices
- **No pre-movement delay**; free-paced reaching
- **Predict 2D hand position** using only the last 50 timesteps of spiking activity

*Note:* The above link is for reference, the actual loading and processing are done using the [neurobench](https://github.com/NeuroBench/neurobench) code harness


---

## Models Trained

We trained 2 State-Space Models on this dataset:
1. [Legendre Memory Units (LMUs)](https://proceedings.neurips.cc/paper_files/paper/2019/file/952285b9b7e7a1be5aa7849f32ffff05-Paper.pdf)
2. [Structured State Space Sequence Models (S4)](https://arxiv.org/pdf/2111.00396)

---

## Model Architecture

- The LMU was trained with hidden size 16 and memory size 32
- The S4 was trained with hidden size 64 and memory size 64

*Note:* The models were trained with a sub window binning method on the spikes.

---

## Results

| Model       | Parameters | Test R2 Score |
|-------------|------------|---------------|
| ANN 2D      | 5K         | 0.62          |    
| ANN 3D      | 24K        | 0.65          |    
| LSTM        | 44K        | 0.58          |    
| EEGNet      | 11K        | 0.56          |    
| **LMU**     | **7K**     | **0.70**      |    
| **S4**      | **70K**    | **0.75**      |


*The results shown above are for the 3rd sessions of Monkey 1


[Back](/)
