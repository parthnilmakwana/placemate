/**
 * Passive / weak phrases mapping to active action verbs for ATS optimization.
 */
export const passiveVerbs = [
  // 1. Leadership & Management
  { regex: /\b(was responsible for|responsible for)\b/gi, replacement: "Spearheaded and executed" },
  { regex: /\b(in charge of|charge of)\b/gi, replacement: "Directed and managed" },
  { regex: /\b(led|lead)\b/gi, replacement: "Orchestrated and guided" },
  { regex: /\b(managed)\b/gi, replacement: "Directed and supervised" },
  { regex: /\b(head of|headed)\b/gi, replacement: "Spearheaded and governed" },
  { regex: /\b(ran)\b/gi, replacement: "Administered and oversaw" },
  { regex: /\b(guided)\b/gi, replacement: "Mentored and directed" },
  { regex: /\b(oversaw|overseeing)\b/gi, replacement: "Supervised and governed" },
  { regex: /\b(handled)\b/gi, replacement: "Managed and orchestrated" },
  { regex: /\b(took care of)\b/gi, replacement: "Administered and maintained" },
  { regex: /\b(supervised)\b/gi, replacement: "Mentored and led" },
  { regex: /\b(steered)\b/gi, replacement: "Guided and drove" },
  { regex: /\b(organized)\b/gi, replacement: "Coordinated and structured" },
  { regex: /\b(arranged)\b/gi, replacement: "Planned and orchestrated" },
  { regex: /\b(planned)\b/gi, replacement: "Strategized and mapped out" },
  { regex: /\b(structured)\b/gi, replacement: "Architected and organized" },
  { regex: /\b(coordinated)\b/gi, replacement: "Facilitated and aligned" },

  // 2. Development & Engineering
  { regex: /\b(worked on|work on)\b/gi, replacement: "Architected and engineered" },
  { regex: /\b(made)\b/gi, replacement: "Engineered and delivered" },
  { regex: /\b(built)\b/gi, replacement: "Architected and developed" },
  { regex: /\b(did coding|did the coding|wrote code for)\b/gi, replacement: "Developed clean, maintainable software for" },
  { regex: /\b(coded)\b/gi, replacement: "Programmed and implemented" },
  { regex: /\b(wrote)\b/gi, replacement: "Authored and programmed" },
  { regex: /\b(created)\b/gi, replacement: "Conceptualized and launched" },
  { regex: /\b(developed)\b/gi, replacement: "Engineered and deployed" },
  { regex: /\b(crafted)\b/gi, replacement: "Designed and implemented" },
  { regex: /\b(hacked together)\b/gi, replacement: "Prototyped and developed" },
  { regex: /\b(programmed)\b/gi, replacement: "Engineered and constructed" },
  { regex: /\b(designed)\b/gi, replacement: "Conceptualized and designed" },
  { regex: /\b(put together)\b/gi, replacement: "Assembled and integrated" },
  { regex: /\b(added)\b/gi, replacement: "Integrated and expanded" },
  { regex: /\b(set up|setup)\b/gi, replacement: "Provisioned and configured" },
  { regex: /\b(configured)\b/gi, replacement: "Provisioned and optimized" },
  { regex: /\b(customized)\b/gi, replacement: "Tailored and adapted" },
  { regex: /\b(implemented)\b/gi, replacement: "Executed and deployed" },

  // 3. Problem Solving & Bug Fixing
  { regex: /\b(fixed bugs|fixed issues|resolved bugs|fixed)\b/gi, replacement: "Troubleshot and resolved critical software defects" },
  { regex: /\b(solved)\b/gi, replacement: "Diagnosed and rectified" },
  { regex: /\b(repaired)\b/gi, replacement: "Restored and maintained" },
  { regex: /\b(corrected)\b/gi, replacement: "Remedied and rectified" },
  { regex: /\b(resolved)\b/gi, replacement: "Troubleshot and addressed" },
  { regex: /\b(sorted out)\b/gi, replacement: "Clarified and resolved" },
  { regex: /\b(debugged)\b/gi, replacement: "Diagnosed and eliminated system anomalies" },
  { regex: /\b(figured out|found out)\b/gi, replacement: "Diagnosed and resolved" },
  { regex: /\b(cleared up)\b/gi, replacement: "Resolved and clarified" },
  { regex: /\b(patched)\b/gi, replacement: "Secured and updated" },
  { regex: /\b(troubleshot)\b/gi, replacement: "Diagnosed and mitigated" },
  { regex: /\b(mended)\b/gi, replacement: "Rectified and restored" },

  // 4. Teamwork & Collaboration
  { regex: /\b(helped with|helped out with)\b/gi, replacement: "Collaborated on the development of" },
  { regex: /\b(helped build)\b/gi, replacement: "Co-authored and engineered" },
  { regex: /\b(helped)\b/gi, replacement: "Assisted and facilitated" },
  { regex: /\b(supported)\b/gi, replacement: "Provided comprehensive technical support for" },
  { regex: /\b(assisted)\b/gi, replacement: "Collaborated and supported" },
  { regex: /\b(worked with)\b/gi, replacement: "Partnered with" },
  { regex: /\b(collaborated with)\b/gi, replacement: "Synergized and partnered with" },
  { regex: /\b(teamed up with)\b/gi, replacement: "Formed strategic alliances with" },
  { regex: /\b(partnered with)\b/gi, replacement: "Collaborated strategically with" },
  { regex: /\b(contributed to)\b/gi, replacement: "Played a pivotal role in" },
  { regex: /\b(joined)\b/gi, replacement: "Integrated into and bolstered" },
  { regex: /\b(chipped in)\b/gi, replacement: "Contributed significantly to" },
  { regex: /\b(was part of)\b/gi, replacement: "Actively collaborated within" },

  // 5. Analysis & Research
  { regex: /\b(researched)\b/gi, replacement: "Conducted extensive analysis on" },
  { regex: /\b(looked into|investigated)\b/gi, replacement: "Conducted in-depth technical analysis on" },
  { regex: /\b(studied)\b/gi, replacement: "Analyzed and evaluated" },
  { regex: /\b(checked)\b/gi, replacement: "Verified and validated" },
  { regex: /\b(examined)\b/gi, replacement: "Scrutinized and assessed" },
  { regex: /\b(explored)\b/gi, replacement: "Investigated and pioneered" },
  { regex: /\b(analyzed)\b/gi, replacement: "Evaluated and interpreted" },
  { regex: /\b(reviewed)\b/gi, replacement: "Audited and assessed" },
  { regex: /\b(inspected)\b/gi, replacement: "Audited and verified" },
  { regex: /\b(assessed)\b/gi, replacement: "Appraised and evaluated" },
  { regex: /\b(evaluated)\b/gi, replacement: "Analyzed and measured" },
  { regex: /\b(scrutinized)\b/gi, replacement: "Rigorously analyzed" },

  // 6. Communication & Presentation
  { regex: /\b(talked to|communicated with|spoke to|spoke with)\b/gi, replacement: "Liaised and coordinated with" },
  { regex: /\b(communicated)\b/gi, replacement: "Conveyed and articulated" },
  { regex: /\b(presented)\b/gi, replacement: "Showcased and delivered" },
  { regex: /\b(showed|demonstrated)\b/gi, replacement: "Presented and showcased" },
  { regex: /\b(explained)\b/gi, replacement: "Clarified and articulated" },
  { regex: /\b(detailed)\b/gi, replacement: "Documented and outlined" },
  { regex: /\b(shared)\b/gi, replacement: "Disseminated and communicated" },
  { regex: /\b(reported on)\b/gi, replacement: "Documented and presented" },
  { regex: /\b(updated)\b/gi, replacement: "Modernized and upgraded" },
  { regex: /\b(informed)\b/gi, replacement: "Briefed and updated" },
  { regex: /\b(told)\b/gi, replacement: "Advised and instructed" },

  // 7. Achievement & Optimization
  { regex: /\b(improved)\b/gi, replacement: "Optimized and enhanced" },
  { regex: /\b(got better)\b/gi, replacement: "Significantly enhanced" },
  { regex: /\b(increased)\b/gi, replacement: "Maximized and amplified" },
  { regex: /\b(grew)\b/gi, replacement: "Scaled and expanded" },
  { regex: /\b(boosted)\b/gi, replacement: "Accelerated and amplified" },
  { regex: /\b(raised)\b/gi, replacement: "Elevated and increased" },
  { regex: /\b(scaled)\b/gi, replacement: "Architected for high availability and scaled" },
  { regex: /\b(sped up|made faster)\b/gi, replacement: "Significantly accelerated and optimized" },
  { regex: /\b(optimized)\b/gi, replacement: "Streamlined and refined" },
  { regex: /\b(enhanced)\b/gi, replacement: "Augmented and elevated" },
  { regex: /\b(upgraded)\b/gi, replacement: "Modernized and advanced" },
  { regex: /\b(elevated)\b/gi, replacement: "Advanced and maximized" },
  { regex: /\b(got|achieved)\b/gi, replacement: "Successfully attained" },
  { regex: /\b(did)\b/gi, replacement: "Executed and accomplished" },

  // 8. Reduction & Efficiency
  { regex: /\b(decreased)\b/gi, replacement: "Minimized and reduced" },
  { regex: /\b(lowered)\b/gi, replacement: "Reduced and optimized" },
  { regex: /\b(dropped)\b/gi, replacement: "Significantly decreased" },
  { regex: /\b(cut down|reduced|cut)\b/gi, replacement: "Streamlined and minimized" },
  { regex: /\b(minimized)\b/gi, replacement: "Mitigated and reduced" },
  { regex: /\b(saved)\b/gi, replacement: "Conserved and optimized" },
  { regex: /\b(shrunk)\b/gi, replacement: "Consolidated and reduced" },
  { regex: /\b(trimmed)\b/gi, replacement: "Optimized and curtailed" },
  { regex: /\b(slashed)\b/gi, replacement: "Drastically reduced" },
  { regex: /\b(condensed)\b/gi, replacement: "Consolidated and streamlined" },
  { regex: /\b(got rid of|removed)\b/gi, replacement: "Deprecated and eliminated" },

  // 9. Maintenance, Testing & Refactoring
  { regex: /\b(tested)\b/gi, replacement: "Validated and verified via automated test suites" },
  { regex: /\b(ran tests|ran testing)\b/gi, replacement: "Executed comprehensive test suites" },
  { regex: /\b(changed)\b/gi, replacement: "Refactored and modernized" },
  { regex: /\b(rewrote)\b/gi, replacement: "Completely refactored and re-architected" },
  { regex: /\b(moved)\b/gi, replacement: "Migrated and transitioned" },
  { regex: /\b(maintained)\b/gi, replacement: "Sustained and maintained" },
  { regex: /\b(kept up)\b/gi, replacement: "Preserved and supported" },
  { regex: /\b(sustained)\b/gi, replacement: "Maintained and upheld" },
  { regex: /\b(preserved)\b/gi, replacement: "Maintained and secured" },
  { regex: /\b(kept track of|tracked)\b/gi, replacement: "Monitored and maintained" },
  { regex: /\b(monitored)\b/gi, replacement: "Observed and regulated" },
  { regex: /\b(recorded)\b/gi, replacement: "Documented and logged" },
  { regex: /\b(logged)\b/gi, replacement: "Tracked and recorded" },
  { regex: /\b(documented)\b/gi, replacement: "Authored comprehensive documentation for" },
  
  // 10. Usage & Initiation
  { regex: /\b(used|utilized)\b/gi, replacement: "Leveraged" },
  { regex: /\b(started)\b/gi, replacement: "Initiated and launched" },
  { regex: /\b(began)\b/gi, replacement: "Commenced and initiated" },
  { regex: /\b(initiated)\b/gi, replacement: "Pioneered and instituted" },
  { regex: /\b(kicked off)\b/gi, replacement: "Launched and mobilized" },
  { regex: /\b(launched)\b/gi, replacement: "Deployed and introduced" },
  { regex: /\b(originated)\b/gi, replacement: "Pioneered and founded" },
  { regex: /\b(invented)\b/gi, replacement: "Innovated and engineered" },
  { regex: /\b(devised)\b/gi, replacement: "Formulated and architected" },
  { regex: /\b(drafted)\b/gi, replacement: "Outlined and formulated" },
  { regex: /\b(formed)\b/gi, replacement: "Established and assembled" },
  { regex: /\b(pioneered)\b/gi, replacement: "Spearheaded and innovated" },
  { regex: /\b(came up with)\b/gi, replacement: "Innovated and conceptualized" },
  { regex: /\b(brought in)\b/gi, replacement: "Introduced and adopted" },
  { regex: /\b(dealt with)\b/gi, replacement: "Strategically managed" },
  { regex: /\b(looked after)\b/gi, replacement: "Administered and maintained" },
  { regex: /\b(made sure|ensured)\b/gi, replacement: "Guaranteed and validated" },
  
  // 11. Generic Weak Verbs
  { regex: /\b(tried to)\b/gi, replacement: "Endeavored to" },
  { regex: /\b(thought of)\b/gi, replacement: "Conceptualized" },
  { regex: /\b(was asked to)\b/gi, replacement: "Was commissioned to" },
  { regex: /\b(gave)\b/gi, replacement: "Delivered and provided" },
  { regex: /\b(went to)\b/gi, replacement: "Attended and participated in" },
  { regex: /\b(saw)\b/gi, replacement: "Observed and analyzed" },
  { regex: /\b(watched)\b/gi, replacement: "Monitored and reviewed" }
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
