/**
 * Passive / weak phrases mapping to active action verbs for ATS optimization.
 */
export const passiveVerbs = [
  { regex: /\b(was responsible for|responsible for)\b/gi, replacement: "Spearheaded and executed" },
  { regex: /\b(in charge of|charge of)\b/gi, replacement: "Directed and managed" },
  { regex: /\b(worked on|work on)\b/gi, replacement: "Architected and engineered" },
  { regex: /\b(helped with|helped out with)\b/gi, replacement: "Collaborated on the development of" },
  { regex: /\b(helped build)\b/gi, replacement: "Collaborated to engineer" },
  { regex: /\b(made)\b/gi, replacement: "Engineered" },
  { regex: /\b(built)\b/gi, replacement: "Architected" },
  { regex: /\b(did coding|did the coding)\b/gi, replacement: "Developed clean, maintainable source code" },
  { regex: /\b(tested)\b/gi, replacement: "Validated and verified via automated test suites" },
  { regex: /\b(designed)\b/gi, replacement: "Conceptualized and designed" },
  { regex: /\b(improved)\b/gi, replacement: "Optimized and enhanced" },
  { regex: /\b(created)\b/gi, replacement: "Authored and launched" }
];

/**
 * Simple rule-based rewriter to replace passive phrasing with active, high-impact verbs.
 */
export function optimizePhrasing(text) {
  if (!text) return '';
  let optimized = text;
  passiveVerbs.forEach(({ regex, replacement }) => {
    optimized = optimized.replace(regex, replacement);
  });
  // Capitalize first letter of bullet points
  return optimized.charAt(0).toUpperCase() + optimized.slice(1);
}
