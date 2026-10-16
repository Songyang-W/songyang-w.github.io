/* Project timeline for the home page, newest first. Edit this list to update it. No HTML needed.

   when       date text in the year column
   label      small label above the title (Industry, Research, Hackathon, Engineering)
   title, org, summary   short text on the card
   page       link to the project's own page (the card title and "Project page" both go there)
   bullets    details shown when the visitor clicks "Details"
   tags       skill chips on the card
   draft      true shows "Details coming soon" until bullets are added
   group      key from TIMELINE_GROUPS. Consecutive entries sharing a group are drawn as one project in stages
   stage      stage label shown on a grouped card */
window.TIMELINE_GROUPS = {
  connectomics: {
    title: "Petascale EM connectomics",
    when: "2021 → 2026",
    stages: 2,
    blurb: "One 657 TB electron microscopy volume of mouse cortex, in two stages: first build the dataset, then adapt self-supervised models to it.",
    page: "dissertation/",
    pageLabel: "My PhD dissertation"
  }
};

window.TIMELINE = [
  {
    when: "2026 → now", label: "Industry",
    title: "Computer vision for clinical tremor assessment",
    org: "Encora Therapeutics, Data Scientist Intern",
    summary: "CNN models that grade tremor severity, from benchmarking to a deployed API.",
    page: "projects/tremor/",
    bullets: [
      "Benchmarked CNN architectures with subject-independent cross-validation (manuscript in preparation).",
      "Matched a fully fine-tuned model by training only a small head on top of a frozen backbone.",
      "Sped up training sharply by diagnosing GPU starvation and moving to multi-worker overlapped prefetch.",
      "Deployed the model as a containerized FastAPI service on AWS EC2, with the API layer decoupled from model logic."
    ],
    tags: ["PyTorch", "CNNs", "FastAPI", "Docker", "AWS EC2"]
  },
  {
    when: "Jan 2026", label: "Hackathon",
    title: "2nd place, Brain Storm BCI Hackathon",
    org: "Compass, a real-time cortical guidance tool",
    summary: "Real-time guidance for placing a 1,024-channel micro-ECoG array, built on synthetic human brain data.",
    page: "projects/bci-compass/",
    bullets: [
      "Built the real-time backend for a full-stack web app that guides surgical placement of the array.",
      "Trained a lightweight U-Net denoiser (about 274 KB, under 5 ms on CPU) and a 3D CNN that decodes 2D movement-direction vectors.",
      "Served inference in under 50 ms end to end for a hands-free operating-room UI at 30 to 60 FPS."
    ],
    tags: ["U-Net", "3D CNN", "Real-time inference"]
  },
  {
    when: "2021 → 2025", label: "Research",
    group: "connectomics", stage: "Stage 1 · Build the dataset",
    title: "Data operations for a 657 TB EM volume",
    org: "Harvard Medical School, Visiting PhD Student",
    summary: "Ran data operations across the full lifecycle of the electron microscopy volume and led the team that reconstructed 415 neurons from it.",
    page: "dissertation/#stage-1",
    bullets: [
      "Ran data operations across acquisition, preprocessing, GCP migration and segmentation handoff to an external vendor, then built the downstream ML analysis on the returned data.",
      "Extended 2D stitching and 3D reconstruction on a Slurm HPC cluster for a 7× speedup and 85% lower memory.",
      "Led a team of about 15 (undergraduates and a postdoc) with no formal authority to deliver 415 proofread neuron reconstructions in about 1.5 years, one of the largest proofread sets in a single volume."
    ],
    tags: ["GCP", "Slurm HPC", "Data pipelines", "Team lead"]
  },
  {
    when: "2024 → 2026", label: "Research",
    group: "connectomics", stage: "Stage 2 · Learn from it",
    title: "Self-supervised contrastive learning for connectomics",
    org: "Boston University, Graduate Research Assistant",
    summary: "Rebuilt SegCLR and SynapseCLR in PyTorch and adapted them to this EM data, so cell-type labels can reach beyond the hand-annotated neurons.",
    page: "dissertation/#stage-2",
    bullets: [
      "Reimplemented SegCLR and SynapseCLR from TensorFlow in PyTorch, with a custom normalization method to bridge data domains.",
      "Scaled contrastive pretraining across 2 V100 GPUs with PyTorch DistributedDataParallel.",
      "Trained on about 1 TB of 3D EM with out-of-core loading of pre-extracted 256 × 256 × 256 cutouts.",
      "Shipped a reproducible train and validation package for downstream classifiers (best model 0.86 accuracy), adopted by lab members."
    ],
    tags: ["PyTorch", "DDP", "Contrastive learning", "3D EM"]
  },
  {
    when: "2021 → 2022", label: "Engineering",
    title: "Magnetic automatic head-fixed home cage",
    org: "Chen Lab, Boston University",
    summary: "Design of a magnetic, automatic head-fixed home cage.",
    draft: true
  },
  {
    when: "2019 → 2020", label: "Engineering",
    title: "Portable blood pressure device",
    org: "Senior design, UC Irvine",
    summary: "A non-invasive, real-time, portable blood pressure measurement device built on waveform analysis.",
    draft: true
  },
  {
    when: "2018 → 2020", label: "Research",
    title: "Brain-heart connectivity with multimodal deep learning",
    org: "UC Irvine, undergraduate research",
    summary: "Predicting outcomes from EEG, ECG, time-series and tabular data, with interpretable models.",
    page: "projects/brain-heart/",
    bullets: [
      "Built a hybrid CNN-LSTM (+3% AUC) and tuned random forest, XGBoost and LightGBM models with SHAP interpretability.",
      "Worked with multimodal data (EEG, ECG, time series, tabular) from a cohort of more than 1,000 animals.",
      "Results contributed to a funded NIH R01 grant."
    ],
    tags: ["CNN-LSTM", "XGBoost", "SHAP", "EEG and ECG"]
  }
];
