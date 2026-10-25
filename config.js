/*
 * ============================================================
 *  HARBOR FORGE — SITE CONFIG
 *  Everything you'd normally change lives here.
 *  Edit, save, refresh. No need to touch index.html or script.js.
 * ============================================================
 */
window.SITE = {
  // The day the fire was lit. Drives the "forge has burned for N days" counter
  // and the "Fire lit · …" line at the top. Format: YYYY-MM-DD.
  startDate: "2026-10-25",

  // The paragraph under the big headline.
  intro:
    "Harbor Forge is a promise I made to myself: keep building, keep shaping, " +
    "keep showing up at the anvil. Whatever the weather, there is always something to forge.",

  // ---------- Contact ----------
  // Leave email as "" to hide the Email button.
  email: "contact@harborforge.in",

  // Shown as buttons in the contact section, in this order.
  // Delete a line to remove it, or add your own: { label: "Blog", url: "https://..." }
  socials: [
    { label: "GitHub", url: "https://github.com/Alexeino" },
  ],

  // ---------- The Promise ----------
  vows: [
    { title: "Never stop building.", text: "Small or large, finished or rough. Something leaves the forge every season." },
    { title: "Heat, strike, repeat.", text: "Progress comes from repetition. Every attempt hardens the craft a little more." },
    { title: "Return to harbor.", text: "Rest is part of the work. The harbor is where I reflect, repair and set out again." },
    { title: "Build in the open.", text: "Share the sparks and the slag. Honest logs beat polished silence." },
  ],

  // ---------- On the Anvil (projects) ----------
  // status: "hot" (in progress) | "cooling" (wrapping up) | "tempered" (done) | "cold" (not started)
  // link is optional: { label: "View on GitHub", url: "https://..." }  (# links stay on this page)
  projects: [
    {
      title: "Harbor Forge",
      status: "hot",
      tag: "2026",
      text: "This promise. The first thing out of the forge, and the place every future build gets logged.",
      link: { label: "Follow the log", url: "#log" },
    },
    {
      title: "Project Sage",
      status: "hot",
      tag: "Project",
      text: "Something wise is taking shape. Details coming once the metal holds its form.",
      link: { label: "Ask about it", url: "#contact" },
    },
    {
      title: "Your next build",
      status: "cold",
      tag: "Next",
      text: "An empty spot on the anvil, kept on purpose. Something always comes next.",
    },
  ],

  // ---------- Forge Log ----------
  // Newest first. date: "YYYY-MM-DD", or leave it out for an upcoming "Soon" entry.
  log: [
    {
      date: "2026-10-25",
      title: "The fire is lit.",
      text: "Harbor Forge goes live. Made the promise and wrote it down, so now it's on the record. Day one.",
    },
    {
      title: "The next strike.",
      text: "Whatever comes next lands here.",
    },
  ],
};
