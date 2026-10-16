/* Timeline entries for the home page, newest first.
   To add or change an entry, edit this list. No HTML needed.

   when       text shown in the year column
   category   industry | research | project | education | teaching
   title, org, summary   short text on the card
   bullets    details shown when the visitor clicks "Details"
   tags       skill chips on the card
   links      [{ label, href }] shown inside the details. Use { label, soon: true } for pages not built yet
   draft      true shows "Details coming soon" until bullets are added
   milestone  true draws a one-line milestone instead of a card. Use title and note
   group      key from TIMELINE_GROUPS. Consecutive entries with the same group are drawn as one project
   stage      stage label shown on a grouped card */
window.TIMELINE_GROUPS = {
  connectomics: {
    title: "Petascale EM connectomics",
    when: "2021 → 2026",
    stages: 2,
    blurb: "One 657 TB electron microscopy volume of mouse cortex, in two stages: first build the dataset, then train self-supervised models on it.",
    link: { label: "Read the story", soon: true }
  }
};

window.TIMELINE = [
  {
    when: "2026 → now",
    category: "industry",
    title: "Data Scientist Intern",
    org: "Encora Therapeutics",
    summary: "Computer vision for clinical tremor severity assessment.",
    bullets: [
      "Benchmarked six CNN architectures with subject-independent cross-validation, reaching 0.82 quadratic weighted kappa (manuscript in preparation).",
      "Matched a fully fine-tuned 134M-parameter model by training only about 18K parameters on top of a frozen backbone.",
      "Cut training time 11×, from 10 minutes to 55 seconds per epoch, by diagnosing GPU starvation and moving to multi-worker overlapped prefetch.",
      "Deployed the model as a containerized FastAPI service on AWS EC2, with the API layer decoupled from model logic.",
      "Ran an attention-module (CBAM) placement ablation showing that placement alone decides whether a residual CNN learns or collapses to chance.",
      "Built a config-driven PyTorch codebase and root-caused a silent train and eval mismatch (validation kappa 0.8, test 0)."
    ],
    tags: ["PyTorch", "CNNs", "FastAPI", "Docker", "AWS EC2"]
  },
  {
    when: "2020 → 2026",
    category: "education",
    title: "Ph.D., Biomedical Engineering",
    org: "Boston University",
    summary: "Dissertation: Structural and Functional Organization of Somatosensory Cortex Microcircuits in Working-Memory-Related Processing.",
    bullets: [
      "Advisor: Jerry L. Chen. GPA 3.88.",
      "AI Certificate: Deep Learning Specialization.",
      "Recorded neurons in a behaving mouse with two-photon imaging, then mapped the synapses between those same neurons with electron microscopy."
    ],
    links: [{ label: "Read the dissertation story", soon: true }]
  },
  {
    when: "Jan 2026",
    category: "project",
    title: "2nd place, Brain Storm BCI Hackathon",
    org: "Compass, a real-time cortical guidance tool",
    summary: "Real-time guidance for placing a 1024-channel micro-ECoG array during neurosurgery.",
    bullets: [
      "Built the real-time backend for a full-stack web app that guides surgical placement of the array.",
      "Trained a lightweight U-Net denoiser (about 274 KB, under 5 ms on CPU) and a 3D CNN that decodes 2D movement-direction vectors.",
      "Added motion-aware cluster tracking to stay stable under array drift.",
      "Served inference in under 100 ms end to end for a hands-free operating-room UI at 30 to 60 FPS."
    ],
    tags: ["U-Net", "3D CNN", "Real-time inference"]
  },
  {
    when: "2021 → 2025",
    category: "research",
    group: "connectomics",
    stage: "Stage 1 · Build the dataset",
    title: "Data operations for a 657 TB EM volume",
    org: "Harvard Medical School, Visiting PhD Student",
    summary: "Ran the full lifecycle of the electron microscopy volume and led the team that reconstructed 415 neurons from it.",
    bullets: [
      "Ran data operations across acquisition, preprocessing, GCP migration and segmentation handoff to an external vendor, then built the downstream ML analysis on the returned data.",
      "Extended 2D stitching and 3D reconstruction on a Slurm HPC cluster for a 7× speedup and 85% lower memory.",
      "Led a team of about 15 (undergraduates and a postdoc) with no formal authority to 415 proofread neuron reconstructions in about 1.5 years, one of the largest proofread sets in a single volume.",
      "This work supports a manuscript in submission."
    ],
    tags: ["GCP", "Slurm HPC", "Data pipelines", "Team lead"],
    links: [{ label: "How the wiring map was built", soon: true }]
  },
  {
    when: "2024 → 2026",
    category: "research",
    group: "connectomics",
    stage: "Stage 2 · Learn from it",
    title: "Self-supervised contrastive learning on the connectome",
    org: "Boston University, Graduate Research Assistant",
    summary: "Rebuilt SegCLR and SynapseCLR in PyTorch and trained them on the same EM volume, so cell-type labels can reach beyond the hand-annotated neurons.",
    bullets: [
      "Reimplemented SegCLR and SynapseCLR from TensorFlow in PyTorch, with a custom normalization method to bridge data domains.",
      "Scaled contrastive pretraining across 2 V100 GPUs with PyTorch DistributedDataParallel, learning view-invariant embeddings of neurons.",
      "Trained on about 1 TB of 3D EM with out-of-core loading of pre-extracted 256 × 256 × 256 cutouts, and halved the batch size (128 to 64) to fit V100 memory.",
      "Shipped a reproducible train and validation package for downstream classifiers (best model 0.86 accuracy), adopted by lab members."
    ],
    tags: ["PyTorch", "DDP", "Contrastive learning", "3D EM"]
  },
  {
    when: "2023 → 2024",
    category: "teaching",
    title: "Teaching and mentorship",
    org: "Boston University",
    summary: "Teaching assistant and mentor for undergraduate engineers.",
    bullets: [
      "Teaching Assistant for Engineering Mechanics (2024) and Fluid Mechanics (2023).",
      "Mentored 4 seniors on a year-long senior design project.",
      "Mentored 2 undergraduates in ML and analysis over 2 years. One defended an undergraduate honors thesis.",
      "Presented 3 posters."
    ]
  },
  {
    when: "2023",
    category: "education",
    milestone: true,
    title: "M.S., Boston University",
    note: "Earned along the way to the Ph.D."
  },
  {
    when: "2021 → 2022",
    category: "project",
    title: "Magnetic automatic head-fixed home cage",
    org: "Chen Lab, Boston University",
    summary: "Design of a magnetic, automatic head-fixed home cage.",
    draft: true
  },
  {
    when: "2019 → 2020",
    category: "project",
    title: "Portable blood pressure device",
    org: "Senior design, UC Irvine",
    summary: "A non-invasive, real-time, portable blood pressure measurement device built on waveform analysis.",
    draft: true
  },
  {
    when: "2018 → 2020",
    category: "research",
    title: "Multimodal deep learning for clinical prediction",
    org: "UC Irvine, undergraduate research",
    summary: "Brain-heart association: predicting outcomes from EEG, ECG, time-series and tabular data.",
    bullets: [
      "Built a hybrid CNN-LSTM (+3% AUC) and tuned random forest, XGBoost and LightGBM models with SHAP interpretability.",
      "Worked with multimodal data (EEG, ECG, time series, tabular) from a cohort of more than 1,000 animals.",
      "Results contributed to a funded NIH R01 grant."
    ],
    tags: ["CNN-LSTM", "XGBoost", "SHAP", "EEG and ECG"]
  },
  {
    when: "2016 → 2020",
    category: "education",
    milestone: true,
    title: "B.S., Biomedical Engineering and Economics, UC Irvine",
    note: "Summa Cum Laude · GPA 3.93"
  }
];
