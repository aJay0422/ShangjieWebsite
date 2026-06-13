/* ============================================================
   Study notes registry.
   To add a note: drop the .html file in "study notes/" and add
   an entry here. `file` is relative to the site root.
   ============================================================ */
const STUDY_NOTES = [
  {
    title: "Score-Matching & Langevin Dynamics (SMLD)",
    tag: "Generative Models",
    file: "study notes/Score-Matching_Langevin_Dynamics_(SMLD).html",
  },
  {
    title: "Denoising Diffusion Implicit Models (DDIM)",
    tag: "Diffusion",
    file: "study notes/Denoising Diffusion Implicit Models (DDIM).html",
  },
  {
    title: "Score-Based Generative Modeling through SDEs",
    tag: "Continuous-Time SDE",
    file: "study notes/Score-Based_Generative_Modeling_through_Stochastic_Differential_Equations.html",
  },
  {
    title: "Flow Matching for Generative Modeling",
    tag: "Flow Matching",
    file: "study notes/Flow Matching For Generative Modeling.html",
  },
];

(function renderNotes() {
  const grid = document.getElementById("notes-grid");
  if (!grid) return;
  grid.innerHTML = STUDY_NOTES.map(
    (n) => `
    <a class="note-card glass reveal" href="${encodeURI(n.file)}" target="_blank" rel="noopener">
      <span class="note-card__tag">${n.tag}</span>
      <span class="note-card__title">${n.title}</span>
      <span class="note-card__open">Open note &rarr;</span>
    </a>`
  ).join("");
})();
