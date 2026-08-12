const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'React Native', 'Vue.js', 'Angular', 'Next.js',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java',
  'Spring Boot', 'C++', 'C#', '.NET', 'Go', 'Golang', 'Rust', 'Ruby', 'Rails',
  'PHP', 'Laravel', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
  'REST API', 'RESTful APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'CI/CD', 'Git', 'GitHub', 'Linux', 'Tailwind CSS', 'HTML5', 'CSS3', 'System Design',
  'Microservices', 'Distributed Systems', 'WebSockets', 'Jest', 'Cypress', 'Vite',
  'Webpack', 'Kafka', 'Elasticsearch', 'Redux', 'Zustand'
];

export class ServerResumeFallbackParser {
  static parse(resumeText: string): any {
    const cleanText = (resumeText || '').trim();
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    const name = this.extractName(lines);
    const skills = this.extractSkills(cleanText);
    const technologies = Array.from(new Set([...skills, ...this.extractTechnologies(cleanText)]));
    const experience = this.extractExperience(lines);
    const projects = this.extractProjects(lines, skills);
    const education = this.extractEducation(lines);
    const claims = this.extractClaims(lines);
    const potentialQuestions = this.generatePotentialQuestions(skills);
    const weakAreas = [
      'Probing edge-case failure modes & error recovery boundaries',
      'System behavior under sudden traffic spikes & database lock contention'
    ];

    return {
      name,
      skills: skills.length > 0 ? skills : ['Software Engineering', 'JavaScript', 'Problem Solving'],
      projects: projects.length > 0 ? projects : [
        {
          title: 'Full-Stack Application Development',
          description: 'Designed and implemented end-to-end features with modern web architecture.',
          tech: skills.slice(0, 4)
        }
      ],
      experience: experience.length > 0 ? experience : [
        {
          role: 'Software Engineer',
          company: 'Engineering Organization',
          duration: 'Recent',
          highlights: claims.slice(0, 3)
        }
      ],
      education: education.length > 0 ? education : [
        { degree: 'B.S. Computer Science / Engineering', institution: 'University' }
      ],
      technologies: technologies.length > 0 ? technologies : ['JavaScript', 'TypeScript', 'Web APIs'],
      achievements: claims.slice(0, 4),
      claims: claims.length > 0 ? claims : ['Built scalable software components following industry best practices.'],
      potentialQuestions,
      weakAreas,
      rawText: cleanText
    };
  }

  private static extractName(lines: string[]): string {
    const headerLines = lines.slice(0, 6);
    for (const line of headerLines) {
      if (/resume|curriculum|cv|summary|experience|contact|email|phone|http|github|linkedin|page/i.test(line)) {
        continue;
      }
      const cleaned = line.replace(/^[•\-\*#\d\.\s]+/, '').trim();
      const words = cleaned.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && /^[A-Z][a-zA-Z\.\-'\s]+$/.test(cleaned)) {
        return cleaned;
      }
    }
    return 'Candidate';
  }

  private static extractSkills(text: string): string[] {
    const textLower = text.toLowerCase();
    const matched: string[] = [];

    for (const skill of KNOWN_SKILLS) {
      const skillLower = skill.toLowerCase();
      const escaped = skillLower.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(textLower)) {
        matched.push(skill);
      }
    }
    return matched;
  }

  private static extractTechnologies(text: string): string[] {
    return this.extractSkills(text);
  }

  private static extractExperience(lines: string[]): any[] {
    const highlights: string[] = [];
    let inExpSection = false;

    for (const line of lines) {
      if (/^(experience|work experience|employment|professional experience|work history)/i.test(line)) {
        inExpSection = true;
        continue;
      }
      if (inExpSection && /^(education|projects|skills|certifications|achievements)/i.test(line)) {
        inExpSection = false;
      }

      if (inExpSection || highlights.length < 5) {
        if (/^[•\-\*\d\.]+\s*/.test(line) || /\b(developed|built|designed|implemented|led|architected|created|optimized|engineered|managed|reduced|increased|scaled)\b/i.test(line)) {
          const cleanBullet = line.replace(/^[•\-\*#\d\.\s]+/, '').trim();
          if (cleanBullet.length > 20 && cleanBullet.length < 300) {
            highlights.push(cleanBullet);
          }
        }
      }
    }

    if (highlights.length === 0) {
      return [];
    }

    return [
      {
        role: 'Software Engineer',
        company: 'Technical Team',
        duration: 'Recent Experience',
        highlights: highlights.slice(0, 4)
      }
    ];
  }

  private static extractProjects(lines: string[], skills: string[]): any[] {
    const projects: any[] = [];
    let inProjSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(projects|personal projects|key projects|highlighted projects)/i.test(line)) {
        inProjSection = true;
        continue;
      }
      if (inProjSection && /^(education|experience|skills|certifications)/i.test(line)) {
        inProjSection = false;
      }

      if (inProjSection && line.length > 5 && line.length < 60 && !line.startsWith('•')) {
        const desc = lines[i + 1] ? lines[i + 1].replace(/^[•\-\*#\d\.\s]+/, '').trim() : 'Technical project implementation';
        projects.push({
          title: line.replace(/^[•\-\*#\d\.\s]+/, '').trim(),
          description: desc,
          tech: skills.slice(0, 3)
        });
        if (projects.length >= 3) break;
      }
    }

    return projects;
  }

  private static extractEducation(lines: string[]): any[] {
    const ed: any[] = [];
    for (const line of lines) {
      if (/\b(bachelor|master|b\.s\.|m\.s\.|b\.tech|b\.e\.|ph\.d|degree|computer science|engineering)\b/i.test(line)) {
        const cleaned = line.replace(/^[•\-\*#\d\.\s]+/, '').trim();
        ed.push({
          degree: cleaned.length > 80 ? cleaned.slice(0, 80) + '...' : cleaned,
          institution: 'Accredited Institution'
        });
        if (ed.length >= 2) break;
      }
    }
    return ed;
  }

  private static extractClaims(lines: string[]): string[] {
    const claims: string[] = [];
    for (const line of lines) {
      if (/\b(developed|built|designed|implemented|led|architected|created|optimized|engineered|scaled|reduced|increased|achieved)\b/i.test(line)) {
        const cleaned = line.replace(/^[•\-\*#\d\.\s]+/, '').trim();
        if (cleaned.length > 25 && cleaned.length < 250) {
          claims.push(cleaned);
        }
      }
      if (claims.length >= 5) break;
    }
    return claims;
  }

  private static generatePotentialQuestions(skills: string[]): string[] {
    const questions: string[] = [
      'Describe a major architectural decision you made in your recent work. What trade-offs did you evaluate?'
    ];
    if (skills.includes('React') || skills.includes('TypeScript') || skills.includes('JavaScript')) {
      questions.push('How do you structure client-side state management to prevent unnecessary re-renders and memory leaks?');
    }
    if (skills.includes('Node.js') || skills.includes('Express') || skills.includes('System Design')) {
      questions.push('How would you design a rate-limiting service to handle high concurrency while keeping latency under 10ms?');
    }
    if (skills.includes('Docker') || skills.includes('Kubernetes') || skills.includes('AWS')) {
      questions.push('Explain your strategy for deployment, zero-downtime rollouts, and infrastructure monitoring.');
    }
    return questions;
  }
}
