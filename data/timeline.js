/* Timeline for the home page, newest first: one entry per chapter (a job, a hackathon, a degree).
   Edit this list to update it. No HTML needed.

   when       date text in the year column
   label      small label above the title (Industry, Hackathon, PhD, Undergrad)
   title      where: the company, event or university
   role       what I was there
   summary    optional one line on what I did
   projects   project titles, each linking to its page */
window.TIMELINE = [
  {
    when: "2026 → now", label: "Industry",
    title: "Encora Therapeutics",
    role: "Data Scientist Intern",
    summary: "I build computer vision models that grade tremor severity, from benchmarking to a deployed service.",
    projects: [
      { title: "Grading tremor severity with computer vision", page: "projects/tremor/" }
    ]
  },
  {
    when: "Jan 2026", label: "Hackathon",
    title: "Brain Storm BCI Hackathon",
    role: "2nd place",
    summary: "I built the real-time backend and models for a tool that guides the placement of a brain array during surgery.",
    projects: [
      { title: "Compass: real-time guidance for a 1,024-channel brain array", page: "projects/bci-compass/" }
    ]
  },
  {
    when: "2020 → 2026", label: "PhD",
    title: "Boston University",
    role: "Ph.D., Biomedical Engineering",
    summary: "I mapped a memory circuit in mouse cortex, including four years as a visiting PhD student at Harvard Medical School.",
    projects: [
      { title: "My dissertation: mapping a memory circuit, synapse by synapse", page: "dissertation/" },
      { title: "Automatic head-fixing home cage", page: "projects/homecage/" }
    ]
  },
  {
    when: "2016 → 2020", label: "Undergrad",
    title: "University of California, Irvine",
    role: "B.S., Biomedical Engineering and Economics · Summa cum laude",
    projects: [
      { title: "Brain-heart connectivity with multimodal deep learning", page: "projects/brain-heart/" },
      { title: "Wearable blood pressure sensor for stroke monitoring", page: "projects/bp-sensor/" }
    ]
  }
];
