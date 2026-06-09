const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const isMockMode = !apiKey || apiKey === 'mock_mode';

let aiInstance = null;

if (!isMockMode) {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    console.log('Gemini API client initialized successfully in production/development mode.');
  } catch (error) {
    console.error('Error initializing real GoogleGenAI client:', error.message);
    console.log('Falling back to Mock AI Mode.');
  }
} else {
  console.log('Gemini API key is set to "mock_mode" or missing. Operating in Mock AI Mode.');
}

/**
 * High-quality mock responses for PlaceMate logic.
 * Inspects prompt keywords to decide whether to return a Matching Score or a Tailored Resume description.
 */
function getMockResponse(contents, model, config) {
  const contentString = typeof contents === 'string' ? contents : JSON.stringify(contents);
  const lowercaseContent = contentString.toLowerCase();

  // 1. Resume Tailoring Query (contains tailoring-specific system instruction keywords)
  if (lowercaseContent.includes('specialist') || lowercaseContent.includes('tailor') || lowercaseContent.includes('rewrite')) {
    const mockTailored = {
      bio: "Detail-oriented software engineer specializing in full-stack web applications. Expert in leveraging React, Node.js, and Express to engineer scalable user interfaces and optimize database structures.",
      experience: [
        {
          company: "CodeCrafters",
          position: "Junior Developer",
          description: "Spearheaded and executed the development of responsive client-facing React web components.\nOptimized backend REST API endpoints using Express, resulting in a 25% reduction in latency.\nCollaborated to engineer comprehensive data visualization charts using MongoDB collections."
        }
      ],
      projects: [
        {
          title: "PlaceMate Dashboard",
          description: "Architected a full-featured e-commerce platform using Node.js, Express, and React.\nIntegrated secure transaction flows and state management using Redux and session caching.\nDesigned scalable database schemas, increasing query optimization performance by 15%."
        }
      ]
    };

    return {
      text: JSON.stringify(mockTailored)
    };
  }

  // 2. Job Matching Query (typically asks for a score, reason, skills)
  if (lowercaseContent.includes('recruiter') || lowercaseContent.includes('score') || lowercaseContent.includes('matching')) {
    // Generate a random score between 70 and 95 for realistic testing
    const score = Math.floor(Math.random() * 26) + 70;
    
    const mockJson = {
      score: score,
      reason: `The candidate possesses strong core skills matching the requirements. Demonstrated hands-on project experience with modern frameworks align well with the team's tech stack, though some domain-specific keywords could be further highlighted.`,
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
      missingSkills: ['Docker', 'AWS Deployment', 'TypeScript']
    };

    return {
      text: JSON.stringify(mockJson)
    };
  }

  // 3. Portfolio Generation Query
  if (lowercaseContent.includes('portfolio') && (lowercaseContent.includes('generate') || lowercaseContent.includes('create'))) {
    const themeMatch = lowercaseContent.match(/style preference:\s*([a-zA-Z]+)/i);
    const theme = themeMatch ? themeMatch[1].toLowerCase() : 'minimal';

    const mockPortfolio = {
      bio: "I am a passionate professional driven by creating impactful solutions. With a keen eye for design and a strong technical foundation, I bridge the gap between aesthetics and functionality.",
      title: "Generated Professional Portfolio",
      theme: theme,
      skills: ["Problem Solving", "Communication", "Leadership", "Project Management", "Technical Design"],
      experience: [
        {
          company: "Tech Innovations Inc.",
          position: "Senior Specialist",
          startDate: "2021",
          endDate: "Present",
          current: true,
          description: "Led cross-functional teams to deliver scalable solutions. Improved system efficiency by 40% and mentored junior team members."
        },
        {
          company: "Creative Solutions LLC",
          position: "Associate",
          startDate: "2018",
          endDate: "2021",
          current: false,
          description: "Contributed to multiple high-impact projects. Collaborated closely with stakeholders to gather requirements and ensure client satisfaction."
        }
      ],
      projects: [
        {
          title: "Enterprise Dashboard",
          description: "A comprehensive analytics dashboard providing real-time insights for executive decision making.",
          technologies: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
          githubLink: "https://github.com/example/dashboard",
          liveLink: "https://dashboard.example.com"
        },
        {
          title: "E-Commerce Platform",
          description: "A fully functional e-commerce site with secure payment processing and inventory management.",
          technologies: ["Next.js", "Stripe", "PostgreSQL"],
          githubLink: "https://github.com/example/ecommerce",
          liveLink: "https://shop.example.com"
        }
      ],
      education: [
        {
          institution: "State University",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startYear: 2014,
          endYear: 2018,
          description: "Graduated with honors. Active member of the Technology Club."
        }
      ]
    };

    return {
      text: JSON.stringify(mockPortfolio)
    };
  }

  // Default fallback response
  return {
    text: "Mock AI default response. Prompt successfully routed and intercepted."
  };
}

/**
 * Unified helper function to query Gemini.
 * Bypasses actual network requests when running in Mock Mode.
 * 
 * @param {Object} params
 * @param {string} params.model - Model name (e.g., 'gemini-3.5-flash' or 'gemini-3.1-pro')
 * @param {string|Array|Object} params.contents - The prompt text or multimodal contents
 * @param {Object} [params.config] - Optional configuration overrides (e.g. responseSchema, responseMimeType)
 * @returns {Promise<{text: string}>}
 */
async function generateContent({ model, contents, config }) {
  if (isMockMode || !aiInstance) {
    // Delay slightly to simulate network request latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return getMockResponse(contents, model, config);
  }

  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await aiInstance.models.generateContent({
        model,
        contents,
        config
      });
      return response;
    } catch (error) {
      attempt++;
      console.warn(`Gemini API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt >= maxRetries) {
        throw error;
      }
      // Exponential backoff: wait 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
}

module.exports = {
  isMockMode,
  generateContent
};
