export const personalInfo = {
  name: "Ajay Vikram P",
  role: "Machine Learning Researcher and Engineer",
  bio: "Computer Science Master’s student at Duke University focused on Deep Learning and Model Optimization. I have built specialized pipelines for autonomous systems, neuromorphic recognition and tracking, VLM reasoning, object detection, model compression and biomedical analysis. My diverse background spans academic research and industry roles, driving improvements in both model architecture and practical performance.",
  email: "ajayvikramp@gmail.com",
  location: "Durham, North Carolina, US",
  github: "https://github.com/ajay-vikram",
  linkedin: "https://www.linkedin.com/in/ajay-vikram777/",
  medium: "https://medium.com/@ajayvikramp",
  twitter: "https://x.com/AjayVikram1622",
  image: "/assets/img/main.jpg",
  formspreeId: "xjvnaeeq"
};

export const experience = [
  {
    role: "Graduate Research Assistant",
    company: "Duke University",
    location: "Durham, NC",
    period: "Aug 2025 - Present",
    advisor: "Andrew Michael",
    advisorLink: "https://dibs.duke.edu/profile/andrew-michael-phd/",
    description: ""
  },
  {
    role: "ML Research Intern",
    company: "Indian Institute of Science",
    location: "Bengaluru, India",
    period: "May 2024 - July 2025",
    advisor: "Chetan Singh Thakur",
    advisorLink: "https://labs.dese.iisc.ac.in/neuronics/people/",
    description: ""
  },
  {
    role: "Machine Learning Intern",
    company: "Lamarr",
    location: "Remote",
    period: "Mar 2024 - Apr 2024",
    description: ""
  },
  {
    role: "Software Intern",
    company: "Qualcomm",
    location: "Hyderabad, India",
    period: "May 2023 - July 2023",
    slug: "qualcomm",
    description: "Designed and built a full-stack memory analysis platform for system-level debugging, reducing analysis time by 85% and storage usage by 75%.",
    content: "Overview", // Placeholder, we will use the sections below
    sections: [
      {
        title: "Internship Overview",
        content: `
During my 11-week internship at Qualcomm, I was tasked with solving critical bottlenecks in the system-level debugging workflow. The project involved creating a high-performance memory analysis ecosystem that transitioned the team from manual log parsing to an automated, cloud-native visualization platform.
        `
      },
      {
        title: "Project 1: Diff Tool – Automated LOC & Impact Analysis",
        content: `
Goal: To develop a tool that displays the difference between the 'before' and 'after' versions of all files in a particular build.

Motivation: Given the massive scale of Qualcomm's builds, developers needed to introspect where changes occurred without manual log analysis. Unlike standard tools that only show raw code differences, this tool provides a high-level abstraction of functional containers (functions, structures, unions) to surface the true impact of a changelist.

Implementation:
- Built a Python-based engine to fetch \`.c\` and \`.h\` files for specific changelists using Araxis Merge.
- Integrated Source Insight to extract structural metadata.
- Developed an algorithm to compare file versions and keep track of LOC for functions, structures, and unions.
- Served the results via a Flask application, providing a real-time summary of changes.

Key Tools: Python, Flask, Source Insight, Araxis Merge.
        `
      },
      {
        title: "Project 2: Memory Analyzer 2.0 – Full-Stack Evolution",
        content: `
Goal: To develop a centralized platform to analyze and visualize the memory requirements of a build, shifting from local scripts to a scalable cloud architecture.

Motivation: Identifying memory bottlenecks in complex builds was previously a fragmented process involving local script execution. This platform centralizes and automates memory analysis, providing team-wide visibility into memory hierarchy and regressions that were difficult to track across distributed build environments.

Technical Stack & Architecture:
- Frontend: Developed using ReactJS with Material UI for a modern, responsive UI.
- Backend: Built with Node.js and Express to handle high-concurrency requests.
- Database: Used MongoDB for flexible storage of hierarchical module/sub-module data.
- Deployment: Containerized using Docker and orchestrated via Kubernetes for load balancing and high availability.

Key Improvements:
- Visual Dashboards: Graphical visualization for modules and sub-modules using D3.js/Chart.js patterns.
- Automated Workflow: Deployed as a downstream job on Jenkins, triggered automatically upon build completion.
- User Authentication: Integrated secure login for internal access control.
- Smart Notifications: Automated email delivery of memory reports, including direct links to the web analysis page.

Key Tools: ReactJS, Node.js, Express, MongoDB, Jenkins, Docker, Kubernetes.
        `
      },
      {
        title: "Impact & Achievements",
        content: `
The system achieved immediate team-wide adoption, fundamentally changing how memory regressions are tracked.

- 85% Reduction in manual memory analysis time.
- 75% Storage Optimization for build metadata.
- Team-wide Adoption: Impacted the engineering workflow by surfacing bottlenecks early in the development cycle.
- Full-Time Offer: The project's success and its direct impact on developer productivity contributed to a full-time return offer.
        `
      }
    ]
  }
];

export const education = [
  {
    school: "Duke University",
    degree: "M.S. in Computer Science (AI/ML)",
    period: "2025 - Present"
  },
  {
    school: "National Institute of Technology Karnataka",
    degree: "B.Tech in Computer Science",
    period: "2020 - 2024"
  }
];

export const skills = [
  "Python", "PyTorch", "TensorFlow", "Deep Learning", "CV", "NLP",
  "Scikit-learn", "OpenCV", "Hugging Face", "LangChain", "Finetuning",
  "Neuromorphic Vision", "Quantization", "C/C++", "MLOps",
  "Docker", "Kubernetes", "Jenkins", "MLflow", "ROS2",
  "Git", "MySQL", "HTML/CSS", "React"
];

export const publications = [
  {
    title: "Asynchronous High-Speed Tracking of Astronomical Objects using Neuromorphic Camera for Edge Computing",
    conference: "2026 IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP 2026)",
    authors: "Satyapreet Singh Yadav, Ajay Vikram P, Adithya M D, Chandra Sekhar Seelamantula, Chetan Singh Thakur"
  },
  {
    title: "HOMI: Ultra-Fast EdgeAI platform for Event Cameras",
    conference: "Preprint",
    authors: "Shankaranarayanan H, Satyapreet Singh Yadav, Adithya Krishna, Ajay Vikram P, Mahesh Mehendale, Chetan Singh Thakur",
    link: "https://arxiv.org/abs/2508.12637"
  },
  {
    title: "ViTFuser: Advancements in Global Context Understanding for Autonomous Vehicles",
    conference: "6th International Conference on Machine Learning, Image Processing, Network Security and Data Sciences (MIND 2024)",
    authors: "Atanu Chatterjee, Ajay Vikram P, Aniketh Narayan Bellala, T Naga Tarun, Basavaraj Talawar, Vani M, and Jeny Rajan",
    link: "https://link.springer.com/chapter/10.1007/978-3-032-14531-4_11"
  }
];

export const projects = [
  {
    slug: "SkillBlenderLC",
    title: "SkillBlenderLC",
    subtitle: "Self-Evolving Meta-Skill Learning for Humanoid Robots",
    description: "Language-conditioned extension of SkillBlender enabling autonomous skill discovery and reward learning for humanoids using LLMs.",
    image: "/assets/img/robot.png",
    content: `
# SkillBlenderLC: Self-Evolving Meta-Skill Learning for Humanoid Robots

## Overview

SkillBlenderLC is a language-conditioned extension of the [SkillBlender](https://github.com/Humanoid-SkillBlender/SkillBlender) framework that enables autonomous skill discovery and reward learning for humanoid robots. The system leverages Large Language Models (LLMs) to decompose long-horizon tasks, identify missing skills, automatically generate reward functions, and iteratively refine them using reinforcement learning feedback.

![System Overview](/assets/img/plan.png)

---

## Motivation

- Long-horizon humanoid tasks require sequencing and composing multiple motion skills.
- Fixed skill libraries limit scalability and generalization.
- Manual reward design is brittle, time-consuming, and non-scalable.
- Existing LLM-based reward methods do not adapt based on downstream RL performance.

SkillBlenderLC addresses these challenges with a self-evolving learning loop that connects language reasoning directly to control learning.

---

## System Design

SkillBlenderLC augments the original SkillBlender training stack with three core components:

### 1. Task Decomposition
An LLM decomposes a natural-language task into ordered subtasks and required skills, proposing new primitive skills when the current library is insufficient.

### 2. Automatic Reward Bootstrapping
For missing skills, the system synthesizes executable Python reward functions using:
- Existing reward templates
- Humanoid environment dynamics

### 3. Reward Refinement via RL Feedback
After RL training, performance metrics (stability, convergence, success rate) are fed back to the LLM to refine the reward, enabling iterative improvement and self-evolution.

---

## Experimental Setup

- **Simulator**: NVIDIA Isaac Gym (PhysX)
- **Robot**: Unitree H1 (19-DoF humanoid)
- **RL Algorithm**: PPO
- **Parallel Environments**: 4,096
- **Training**: 15,000 episodes per skill

---

## LLMs Evaluated

We benchmarked six state-of-the-art LLMs across task decomposition and reward generation:

- GPT-4o
- Claude Sonnet 4.5
- Gemini 2.5 Flash
- LLaMA 3.3 70B
- Mistral Large
- DeepSeek V3

---

## Results

### Skill Selection on Long-Horizon Tasks

Evaluated on the eight long-horizon tasks from SkillBlender:

![Skill Selection Results](/assets/img/skill_selection_results.png)

**Key insight**:
LLMs reliably identify primary motion primitives but often miss secondary or contact-rich skills, motivating downstream reward learning.

---

### Reward Generation — Primitive Skill: Squatting

Performance of policies trained using LLM-generated rewards for the Squatting primitive:

| Ground Truth | GPT-4o | Claude 4.5 | Gemini |
| :---: | :---: | :---: | :---: |
| ![GT](/assets/img/squat_gt.gif) | ![GPT4o](/assets/img/squat_gpt4o.gif) | ![Sonnet](/assets/img/squat_sonnet.gif) | ![Gemini](/assets/img/squat_gemini.gif) |

| LLaMA | DeepSeek | Mistral |
| :---: | :---: | :---: |
| ![LLaMA](/assets/img/squat_llama.gif) | ![DeepSeek](/assets/img/squat_deepseek.gif) | ![Mistral](/assets/img/squat_mistral.gif) |


**Observation**:
While most models reproduce reward structure correctly, numerical misspecification often leads to unstable or ineffective policies.

---

### Reward Generation — Combined Skill: Button Press

The Button Press task requires composing walking and reaching:

| Ground Truth | LLM Generated |
| :---: | :---: |
| ![GT](/assets/img/buttonpressgt.gif) | ![LLM](/assets/img/buttonpress.gif) |

**Result**:
Only Claude-generated rewards successfully enable task completion.
Most models produce rewards that cause the robot to remain stationary, highlighting the difficulty of multi-stage skill composition.

---

### Learning New Skills

The framework can generate and train rewards for previously unseen skills:

| Bend | Sidestep | Kick |
| :---: | :---: | :---: |
| ![Bend](/assets/img/bend_back.gif) | ![Sidestep](/assets/img/sidestep.gif) | ![Kick](/assets/img/kick.gif) |

**Insight**:
Some skills are successfully learned, while others require iterative refinement — validating the need for a closed-loop reward evolution mechanism.

---

## Prompt Design

We design explicit, constrained prompts for each stage to ensure consistency, interpretability, and reproducibility.

### Task Decomposition Prompt

\u0060\u0060\u0060text
You are a high-level humanoid motion planner and meta-skill developer.

Your task is to decompose a long-horizon natural-language goal into a sequence of
short, atomic subtasks. Each subtask must include a concise "subgoal" (one line of natural language)
and a list of "skills" required to achieve it.

You currently have access to the following SKILL LIBRARY:

{SKILL_LIBRARY}

For every subgoal:
1. Compare the subgoal against the skills in the current library.
2. If ALL required abilities exist, reuse them directly.
3. If the subgoal requires a new ability not in the list, invent a new skill:
   - Use short (1–2 words), descriptive, physically plausible humanoid actions
   - Avoid abstract or cognitive terms
   - Do not use synonyms of existing skills unless functionality differs
   - If no existing skill fully covers the subgoal, you must create a new primitive skill

The final output must be a valid JSON object of the form:

{
  "subtasks": [
    {"subgoal": "<short actionable goal>", "skills": ["Skill1", "Skill2", ...]},
    ...
  ]
}

Guidelines:
- Ensure subtasks are sequential and fully cover the task
- Keep skill names capitalized and concise
- Keep subgoals to one line
- Return only the JSON with no explanations or comments

\u0060\u0060\u0060

### Reward Generation Prompt

\u0060\u0060\u0060text
You are a code-generation agent designing a new humanoid skill reward function.
Return only valid Python code defining the reward class.
Do not include explanations, markdown fences, comments, or introductory text.

Below are the existing primitive skill rewards currently used:
<existing_rewards>
{reward_context}
</existing_rewards>

Analyze these to understand parameter conventions and scaling.

Below is the humanoid environment definition used for training:
<environment_context>
{env_context}
</environment_context>

Now, design a NEW reward class for the following subgoal and skill:

Subgoal: {subgoal}
Skill: {skill_name}

Rules:
1. Maintain the same Python class structure (class rewards: with nested class scales:)
2. Reuse ONLY variables, parameters, and scale names already defined
3. Do NOT invent new variables or physics metrics
4. Keep numerical scales realistic and consistent with reference rewards
5. Return only valid Python code, with no explanations or comments
\u0060\u0060\u0060

### Reward Refinement Prompt

\u0060\u0060\u0060text
You are a humanoid reward designer.
The following reward function was trained in RL but performed poorly.

Subgoal: {subgoal}
Skill: {skill}

[Generated reward]
{generated_reward}

[Observed RL feedback metrics]
{feedback_str}

Based on these feedback metrics, rewrite the reward function to:
1. Improve stability, convergence, and success rate
2. Keep structure consistent with existing reward format (class rewards: with nested scales)
3. Keep parameter names consistent
4. Adjust only scale magnitudes or add missing shaping terms if necessary

Output only the corrected Python code starting with 'class rewards:'.
Do NOT include explanations or markdown.
\u0060\u0060\u0060
    `
  },
  {
    slug: "ViTFuser",
    title: "ViTFuser",
    subtitle: "Global Context Understanding for Autonomous Vehicles",
    description: "An attention-based deep learning architecture introducing multi-stage Vision Transformers and Feature Pyramid Networks to improve autonomous vehicle decision-making.",
    image: "/assets/img/carla.png",
    content: `
# ViTFuser: Advancements in Global Context Understanding for Autonomous Vehicles

## Overview

ViTFuser is an attention-based deep learning architecture designed to improve decision-making in autonomous vehicles. It addresses limitations in prior state-of-the-art models (like [TransFuser](https://arxiv.org/pdf/2205.15997)) that suffer from loss of global context during feature fusion. ViTFuser introduces multi-stage Vision Transformers (ViTs) and a Feature Pyramid Network (FPN) to better understand the scene and reduce traffic violations.

The project outperforms comparative existing models on CARLA simulation benchmarks, achieving higher Driving Scores (DS) and lower traffic infractions.

![High Level Overview](/assets/img/high_level.png)

---

## Dataset & Task

ViTFuser was evaluated on the CARLA 0.9.10 simulator, using data recorded at 2 FPS across 3,500 driving routes in varying towns and weather conditions.

- **Input sensors**:
  - RGB images from 3 front-facing cameras (stitched into a wide-view image)
  - LiDAR point cloud converted to 2D Bird’s-Eye-View (BEV) grid
- **Output**: 4 future waypoints for the ego vehicle

![Input Modality](/assets/img/input_modality.png)

The goal is to predict waypoints accurately while minimizing infractions during navigation.

---

## Model Architecture

The model consists of two main components:

### 1. **Perception Module (Encoder)**
- Processes RGB and LiDAR inputs using CNNs + multi-resolution Vision Transformers (ViT)
- RGB and LiDAR branches run in parallel, each extracting hierarchical features
- Cross-modal attention enables global context fusion
- Uses Feature Pyramid Network (FPN) for multi-scale feature extraction, boosting object detection accuracy

![Encoder](/assets/img/encoder.png)

### 2. **Decision Module (Decoder)**
- Predicts vehicle waypoints using a GRU-based network
- Handles auxiliary tasks such as:
  - Semantic segmentation
  - HD map generation
  - Depth estimation
  - Object detection (bounding boxes)

These tasks improve interpretability and overall navigation performance.

---

## Parameters Comparison

| Model | Parameters |
| :--- | :--- |
| TransFuser | 168 million |
| Swin Transformer | 688 million |
| **ViTFuser** | **55 million** |

> ViTFuser reduces parameters by **~67%** compared to TransFuser and **~91%** compared to Swin Transformer, making it much more efficient while maintaining strong performance.

---

## Results

ViTFuser was benchmarked on **Longest6** and **Town05** datasets from CARLA.

### Longest6 Benchmark

| Model | DS | RC | IS |
| :--- | :--- | :--- | :--- |
| TransFuser | 43.48 | 77.72 | 0.60 |
| ViTFuser | 51.96 | 80.70 | 0.65 |
| **ViTFuser + FPN** | **55.15** | **81.43** | **0.69** |

### Town05 Benchmark

| Model | DS (Short) | RC (Short) | DS (Long) | RC (Long) |
| :--- | :--- | :--- | :--- | :--- |
| TransFuser | 87.48 | 92.78 | 67.85 | 91.57 |
| ViTFuser | 90.04 | 94.79 | 74.82 | 92.40 |
| **ViTFuser + FPN** | **91.07** | **94.67** | **74.95** | **94.90** |

DS - Driving Score, RC - Route Completion, IS - Infraction Score
    `
  },
  {
    slug: "HAR",
    title: "Ternarizing CNNs",
    subtitle: "Efficient Human Activity Recognition",
    description: "Compressing a CNN model for human activity recognition using ternarization and quantization techniques for efficient deployment.",
    image: "/assets/img/har.png",
    content: `
# Ternarizing CNNs for Human Activity Recognition

## Overview

This project focuses on compressing a CNN model for human activity recognition using ternarization and quantization techniques. The aim is to significantly reduce model size and computational complexity without sacrificing much accuracy. The baseline model, trained on 64×64 spectrograms derived from radar signals, is ternarized and quantized to allow deployment with integer-only inference on resource-constrained embedded platforms.

## Dataset

The model is trained on a private dataset, using spectrogram representations of radar signals, each sized \u006064×64×1\u0060. These spectrograms capture temporal-frequency features of radar reflections and are well-suited for classifying fine-grained human activities. The dataset includes 5 distinct activity classes - \u0060{jogging, jumping, situp, waving, other}\u0060, and training was performed using 5-fold cross-validation to ensure robust generalization. The spectrograms look like:

![Input Spectrograms](/assets/img/spectrograms.png)

## Model Architecture

The CNN architecture is lightweight, consisting of:
- A 2D convolution layer
- Two depthwise separable convolutions for spatial-temporal filtering
- Fully connected output layer with 5 class logits

![CNN](/assets/img/CNN.png)

The model had 3029 parameters in total and was designed with efficiency in mind, enabling rapid inference while maintaining high classification accuracy.

## Ternarization & Quantization

Quantization is the process of reducing the precision of numbers in a model—such as weights, biases and activations—by representing them with fewer bits. This helps make machine learning models smaller, faster, and more efficient for deployment on devices with limited resources. Ternarization uses 2 bits to represent each weight, restricting values to three discrete levels.

The weight ternarization step maps full-precision weights to one of three values: {−1, 0, +1}. To ensure the ternary weight networks perform well, it is required to minimize the Euclidian distance between the full precision weights W and the ternary-valued weights W' while including a non-negative scaling factor α. Ternarization reduces the model size by over 16× and enables efficient bitwise operations. A threshold-based approach was used to determine which weights are quantized to -1, 0 and 1. In addition, the activations and biases were quantized to 8-bit and 23-bit respectively. Quantization was done using uniform affine mapping with a learned scale and zero-point, allowing real values to be approximated as \u0060q = round(r/scale) + zero_point\u0060. The images below illustrate the floating-point weights and biases on the left, and their ternarized and quantized counterparts on the right.

| Floating Point Weights | Ternarized Integer Weights |
| :---: | :---: |
| ![FP32](/assets/img/fp32weights.png) | ![Ternary](/assets/img/ternaryweights.png) |

The model was trained using Quantization-Aware Training (QAT). Unlike post-training quantization, QAT simulates quantization effects during training itself, enabling the network to learn robust representations under low-bit constraints. During training, fake quantization modules simulate low-bit precision, while the actual parameters remain in float for gradient updates. The Straight-Through Estimator (STE) was used to approximate gradients through the non-differentiable \u0060torch.round\u0060 quantization function.

![QAT](/assets/img/QAT.png)

To optimize further for inference, pruning was done to achieve ~45% sparsity and batch normalization layers were folded into the preceding convolutional layers, combining their parameters with the conv weights and biases. This reduced runtime complexity without changing model behavior.

Finally, all operations—including convolutions, batch norm, activation, and pooling—were implemented using integer-only arithmetic. Dyadic scaling factors of the form (s = a ⁄ 2ᵇ), where a and b are integers, were used for efficient scaling via bit-shifts instead of division, allowing deployment on fixed-point hardware with no floating-point support. This full quantization pipeline enabled robust, low-latency inference with minimal accuracy degradation compared to the full-precision baseline.

![Integer-Only Inference](/assets/img/int_inference.png)

## Results

The model was evaluated using 5-fold cross-validation. Results below demonstrate only a marginal drop in accuracy post-ternarization:

| Fold | FP32 Accuracy (%) | Ternarized Accuracy (%) |
| :--- | :--- | :--- |
| 1 | 99.27 | 98.19 |
| 2 | 100.00 | 99.64 |
| 3 | 99.27 | 98.91 |
| 4 | 98.55 | 97.83 |
| 5 | 100.00 | 100.00 |
| **Avg** | **99.42** | **98.91** |

Despite ~45% sparsity and ternarized weights, the accuracy remained close to baseline, validating the effectiveness of ternarization and quantization for embedded HAR systems.
    `
  },
  {
    slug: "BCI",
    title: "Hand Kinematics in BCI",
    subtitle: "State-Space Models (S4, LMU) for Decoding",
    description: "Decoding continuous hand movements from brain activity using State-Space Models (S4, LMU) to predict 2D hand position.",
    image: "/assets/img/BCI.png",
    content: `
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

Refer to my [blog post](https://medium.com/@ajayvikramp/ssms-for-efficient-long-range-memory-d6a78226c738) on State-Space Models if you are new to the topic.

---

## Model Architecture

- The LMU was trained with hidden size 16 and memory size 32
- The S4 was trained with hidden size 64 and memory size 64

*Note:* The models were trained with a sub window binning method on the spikes.

---

## Results

| Model | Parameters | Test R2 Score |
| :--- | :--- | :--- |
| ANN 2D | 5K | 0.62 |
| ANN 3D | 24K | 0.65 |
| LSTM | 44K | 0.58 |
| EEGNet | 11K | 0.56 |
| **LMU** | **7K** | **0.70** |
| **S4** | **70K** | **0.75** |

*The results shown above are for the 3rd session of Monkey 1
    `
  }
];