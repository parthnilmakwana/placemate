const PDFDocument = require('pdfkit');

/**
 * Passive / weak phrases mapping to active action verbs for ATS optimization.
 */
const passiveVerbs = [
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
 * Used for Task 4.4 deconstruction.
 */
function optimizePhrasing(text) {
  if (!text) return '';
  let optimized = text;
  passiveVerbs.forEach(({ regex, replacement }) => {
    optimized = optimized.replace(regex, replacement);
  });
  // Capitalize first letter of bullet points
  return optimized.charAt(0).toUpperCase() + optimized.slice(1);
}

/**
 * Generates an ATS-optimized PDF resume using PDFKit.
 * 
 * @param {Object} user - The mongoose user document containing user details & profile.
 * @param {Object} options - Custom generation settings (e.g. optimize: true).
 * @returns {PDFDocument} - The generated PDFKit Document stream.
 */
function generateResumePDF(user, options = {}) {
  const doc = new PDFDocument({
    margin: 45,
    size: 'A4',
    bufferPages: true
  });

  let profile = user.profile || {};
  
  if (options.tailoredProfile) {
    profile = {
      ...profile,
      bio: options.tailoredProfile.bio || profile.bio,
      experience: profile.experience ? profile.experience.map(exp => {
        const tailoredExp = options.tailoredProfile.experience?.find(
          te => te.company.toLowerCase() === exp.company.toLowerCase() &&
                te.position.toLowerCase() === exp.position.toLowerCase()
        );
        return tailoredExp ? { ...exp, description: tailoredExp.description } : exp;
      }) : [],
      projects: profile.projects ? profile.projects.map(proj => {
        const tailoredProj = options.tailoredProfile.projects?.find(
          tp => tp.title.toLowerCase() === proj.title.toLowerCase()
        );
        return tailoredProj ? { ...proj, description: tailoredProj.description } : proj;
      }) : []
    };
  }

  const optimize = options.optimize === true;

  // Color Palette Definitions (Slate Theme)
  const colors = {
    primary: '#1e293b', // Deep slate for header & names
    secondary: '#475569', // Medium slate for titles & dates
    accent: '#4f46e5', // Deep indigo for section headers
    body: '#334155', // Charcoal for paragraphs & bullets
    divider: '#e2e8f0' // Light border slate
  };

  // 1. HEADER SECTION
  doc.font('Helvetica-Bold').fontSize(22).fillColor(colors.primary).text(user.name, { align: 'center' });
  doc.moveDown(0.25);

  const title = profile.title || 'Developer';
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.accent).text(title.toUpperCase(), { align: 'center' });
  doc.moveDown(0.4);

  // Contact / Social row
  const github = profile.githubUrl ? `GitHub: ${profile.githubUrl.replace(/^https?:\/\//, '')}` : '';
  const linkedin = profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl.replace(/^https?:\/\//, '')}` : '';
  const contactRow = [user.email, github, linkedin].filter(Boolean).join('  |  ');
  doc.font('Helvetica').fontSize(9).fillColor(colors.secondary).text(contactRow, { align: 'center' });
  
  // Divider
  doc.moveDown(0.8);
  drawDivider(doc, colors.divider);
  doc.moveDown(0.6);

  // 2. PROFILE SUMMARY
  const rawBio = profile.bio || 'Professional software developer seeking opportunities.';
  const summaryText = optimize ? optimizePhrasing(rawBio) : rawBio;
  renderSectionHeader(doc, 'Professional Summary', colors.accent);
  doc.font('Helvetica').fontSize(9.5).fillColor(colors.body).text(summaryText, { align: 'left', lineGap: 3 });
  doc.moveDown(1.2);

  // 3. SKILLS / EXPERTISE
  if (profile.skills && profile.skills.length > 0) {
    renderSectionHeader(doc, 'Core Expertise', colors.accent);
    doc.font('Helvetica').fontSize(9.5).fillColor(colors.body).text(profile.skills.join('  •  '), { lineGap: 3 });
    doc.moveDown(1.2);
  }

  // 4. WORK EXPERIENCE
  if (profile.experience && profile.experience.length > 0) {
    renderSectionHeader(doc, 'Professional Experience', colors.accent);
    profile.experience.forEach((exp, idx) => {
      if (idx > 0) doc.moveDown(0.8);

      const startY = doc.y;
      
      // Position & Company (Left side)
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(colors.primary).text(exp.position);
      doc.font('Helvetica-BoldOblique').fontSize(9.5).fillColor(colors.secondary).text(`${exp.company}  -  ${exp.location || ''}`);

      // Dates (Right side)
      const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      doc.font('Helvetica').fontSize(9).fillColor(colors.secondary).text(dateText, 45, startY, { align: 'right', width: 505 });
      
      // Description bullet points
      if (exp.description) {
        doc.moveDown(0.4);
        
        // Reset coordinate pointer to left
        doc.x = 45;
        
        // Parse sentences as bullet points
        const lines = exp.description.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach(line => {
          const bulletLine = line.startsWith('•') || line.startsWith('-') ? line.substring(1).trim() : line;
          const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
          
          doc.font('Helvetica').fontSize(9.5).fillColor(colors.body);
          doc.text(`•  ${processedText}`, { lineGap: 2, paragraphGap: 1 });
        });
      }
    });
    doc.moveDown(1.2);
  }

  // 5. PROJECTS PORTFOLIO
  if (profile.projects && profile.projects.length > 0) {
    renderSectionHeader(doc, 'Selected Projects', colors.accent);
    profile.projects.forEach((proj, idx) => {
      if (idx > 0) doc.moveDown(0.8);

      const startY = doc.y;
      
      // Project Title & Stack
      const stack = proj.technologies && proj.technologies.length > 0 ? ` [${proj.technologies.join(', ')}]` : '';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(colors.primary).text(`${proj.title}${stack}`);

      // Project Links (Right side)
      const linkText = proj.liveLink || proj.githubLink || '';
      if (linkText) {
        doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(colors.accent).text(linkText.replace(/^https?:\/\//, ''), 45, startY, { align: 'right', width: 505 });
      }

      // Reset cursor position to left margin
      doc.x = 45;
      
      if (proj.description) {
        doc.moveDown(0.4);
        const descriptionLines = proj.description.split('\n').map(l => l.trim()).filter(Boolean);
        descriptionLines.forEach(line => {
          const bulletLine = line.startsWith('•') || line.startsWith('-') ? line.substring(1).trim() : line;
          const processedText = optimize ? optimizePhrasing(bulletLine) : bulletLine;
          
          doc.font('Helvetica').fontSize(9.5).fillColor(colors.body);
          doc.text(`•  ${processedText}`, { lineGap: 2, paragraphGap: 1 });
        });
      }
    });
    doc.moveDown(1.2);
  }

  // 6. EDUCATION BACKGROUND
  if (profile.education && profile.education.length > 0) {
    renderSectionHeader(doc, 'Education Background', colors.accent);
    profile.education.forEach((edu, idx) => {
      if (idx > 0) doc.moveDown(0.6);

      const startY = doc.y;

      // Degree & Institution
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(colors.primary).text(edu.degree);
      const studyField = edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '';
      doc.font('Helvetica').fontSize(9.5).fillColor(colors.secondary).text(`${edu.institution}${studyField}`);

      // Dates (Right side)
      const eduDateText = `${edu.startYear} - ${edu.endYear}`;
      doc.font('Helvetica').fontSize(9).fillColor(colors.secondary).text(eduDateText, 45, startY, { align: 'right', width: 505 });
      
      // Reset cursor left
      doc.x = 45;
    });
  }

  doc.end();
  return doc;
}

/**
 * Helper to render section headers consistently.
 */
function renderSectionHeader(doc, title, accentColor) {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(accentColor).text(title.toUpperCase());
  doc.moveDown(0.2);
  drawDivider(doc, '#cbd5e1'); // light slate divider
  doc.moveDown(0.4);
}

/**
 * Helper to draw a horizontal rule.
 */
function drawDivider(doc, lineColor) {
  const currentY = doc.y;
  doc.strokeColor(lineColor)
     .lineWidth(0.5)
     .moveTo(45, currentY)
     .lineTo(550, currentY)
     .stroke();
}

module.exports = {
  generateResumePDF,
  optimizePhrasing
};
