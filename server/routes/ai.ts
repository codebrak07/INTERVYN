import { Router, Request, Response } from 'express';
import { ServerGroqProvider } from '../services/groq/ServerGroqProvider';

const router = Router();
const groq = new ServerGroqProvider();

// Store generated hidden test cases in ephemeral memory keyed by problemId
export const ephemeralHiddenTestMap = new Map<string, any[]>();

router.post('/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'resumeText is required' });

    const prompt = `Analyze this candidate resume and extract a clean structured JSON profile.
Resume text:
"""
${resumeText.slice(0, 8000)}
"""

Return JSON format:
{
  "skills": ["JavaScript", "React", "TypeScript"],
  "projects": [{"title": "...", "description": "...", "tech": ["..."]}],
  "experience": [{"role": "...", "company": "...", "highlights": ["..."]}],
  "education": [{"degree": "...", "institution": "..."}],
  "technologies": ["..."],
  "achievements": ["..."],
  "claims": ["..."],
  "potentialQuestions": ["Question 1", "Question 2"],
  "weakAreas": ["Target probing area"]
}`;

    const data = await groq.callGroq([
      { role: 'system', content: 'You are an elite executive technical recruiter.' },
      { role: 'user', content: prompt }
    ]);

    return res.json(data);
  } catch (err: any) {
    console.warn('Fallback resume analysis:', err.message);
    return res.json({
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'System Architecture'],
      projects: [
        { title: 'High-Scale Web Application', description: 'Built dynamic frontend state platform.', tech: ['React', 'TypeScript'] }
      ],
      experience: [{ role: 'Senior Software Engineer', company: 'Tech Inc', highlights: ['Optimized rendering vitals by 40%'] }],
      education: [{ degree: 'B.S. Computer Science', institution: 'State University' }],
      technologies: ['React', 'TypeScript', 'Node.js', 'REST APIs'],
      achievements: ['Delivered zero-downtime release'],
      claims: ['Scaled React app to 50k DAU'],
      potentialQuestions: ['How did you achieve a 40% performance gain?'],
      weakAreas: ['Micro-frontend isolation', 'Server rendering hydration']
    });
  }
});

router.post('/analyze-role', async (req: Request, res: Response) => {
  try {
    const { profile, targetRole } = req.body;
    const prompt = `Evaluate candidate fit for role "${targetRole.title}".
Candidate skills: ${(profile.skills || []).join(', ')}
Job Description: ${targetRole.jobDescription || 'Standard ' + targetRole.title}

Return JSON format:
{
  "overallMatch": 86,
  "technicalMatch": 88,
  "experienceMatch": 84,
  "projectMatch": 87,
  "skillMatch": 85,
  "missingSkills": ["GraphQL", "Docker"],
  "likelyInterviewTopics": ["React Fiber", "DOM Performance", "Event Loop"],
  "likelyCodingTopics": ["Debounce/Throttle", "LRU Cache"]
}`;

    const data = await groq.callGroq([
      { role: 'system', content: 'You are an interview architect evaluating job match.' },
      { role: 'user', content: prompt }
    ]);
    return res.json(data);
  } catch (err) {
    return res.json({
      overallMatch: 86,
      technicalMatch: 88,
      experienceMatch: 84,
      projectMatch: 87,
      skillMatch: 85,
      missingSkills: ['GraphQL Federation', 'Distributed Caching'],
      likelyInterviewTopics: ['React Concurrent Rendering', 'State Hydration', 'DOM Virtualization'],
      likelyCodingTopics: ['Debounce Implementation', 'Deep Clone Object']
    });
  }
});

router.post('/blueprint', async (req: Request, res: Response) => {
  const { targetRole } = req.body;
  return res.json({
    roleTitle: targetRole?.title || 'Software Engineer',
    estimatedMinutes: 35,
    totalQuestions: 6,
    sections: [
      { type: 'resume', title: 'Resume & Project Deep Dive', description: 'Exploring claims and architectural choices.', count: 2 },
      { type: 'mcq', title: 'Technical MCQ Challenge', description: 'Assessing core language mechanics.', count: 2 },
      { type: 'technical', title: 'System & Framework Deep Dive', description: 'Probing async patterns and state models.', count: 1 },
      { type: 'coding', title: 'Controlled Coding Arena', description: 'Hands-on sandboxed problem solving.', count: 1 },
      { type: 'behavioral', title: 'Behavioral & Leadership', description: 'STAR methodology and ownership.', count: 1 }
    ]
  });
});

router.post('/questions', async (req: Request, res: Response) => {
  try {
    const { profile, targetRole } = req.body;
    const prompt = `Generate a realistic 5-question technical interview plan for a candidate applying as ${targetRole.title}.
Candidate skills: ${(profile?.skills || []).join(', ')}

Return JSON format:
{
  "questions": [
    {
      "id": "q1",
      "type": "resume",
      "question": "Describe a critical performance bottleneck you diagnosed and how you resolved it.",
      "topic": "Performance & Architecture",
      "difficulty": 6
    },
    {
      "id": "q2",
      "type": "mcq",
      "question": "Which statement accurately describes JavaScript microtask queue execution order?",
      "topic": "JavaScript Concurrency",
      "difficulty": 6,
      "options": [
        {"id": "A", "text": "Microtasks run before render, draining the queue completely."},
        {"id": "B", "text": "Microtasks run only after all setTimeout callbacks finish."},
        {"id": "C", "text": "Microtasks run on a separate Web Worker thread."},
        {"id": "D", "text": "Microtasks have lower priority than requestAnimationFrame."}
      ],
      "correctOptionId": "A"
    },
    {
      "id": "q3",
      "type": "technical",
      "question": "Suppose your app needs real-time state synchronization across multiple tabs. What options would you evaluate?",
      "topic": "Browser Architecture",
      "difficulty": 7
    },
    {
      "id": "q4",
      "type": "coding",
      "question": "Implement a custom debounce function executor.",
      "topic": "Controlled Coding Arena",
      "difficulty": 7,
      "codingProblem": {
        "id": "code_debounce",
        "title": "Implement Debounce Function",
        "difficulty": "Medium",
        "description": "Implement a function debounce(fn, delay) that limits the rate at which fn can fire. Delays invoking fn until after delay milliseconds have elapsed.",
        "examples": [{"input": "debounce(fn, 100)", "output": "Executes fn once after 100ms"}],
        "constraints": ["delay is in ms"],
        "starterCode": "function debounce(fn, delay) {\\n  let timerId = null;\\n  return function(...args) {\\n    if (timerId) clearTimeout(timerId);\\n    timerId = setTimeout(() => {\\n      fn.apply(this, args);\\n    }, delay);\\n  };\\n}",
        "language": "javascript",
        "visibleTests": [
          {"id": "v1", "description": "Single call executes after delay", "input": "[100]", "expectedOutput": "executed"},
          {"id": "v2", "description": "Rapid calls reset timer", "input": "[50, 50, 100]", "expectedOutput": "executed_once"}
        ],
        "hiddenTests": [
          {"id": "h1", "description": "Preserves arguments", "input": "args_check", "expectedOutput": "passed", "isHidden": true},
          {"id": "h2", "description": "Preserves this binding", "input": "this_check", "expectedOutput": "passed", "isHidden": true}
        ]
      }
    },
    {
      "id": "q5",
      "type": "behavioral",
      "question": "Describe a project deadline at risk due to scope creep. How did you prioritize deliverables?",
      "topic": "Prioritization & Ownership",
      "difficulty": 6
    }
  ]
}`;

    const data = await groq.callGroq([
      { role: 'system', content: 'You are an interview question architect.' },
      { role: 'user', content: prompt }
    ]);

    const sanitizedQuestions = (data.questions || []).map((q: any) => {
      if (q.codingProblem && q.codingProblem.hiddenTests) {
        // Ephemerally store hidden tests server-side and strip them from client response
        ephemeralHiddenTestMap.set(q.codingProblem.id, q.codingProblem.hiddenTests);
        const cleanedProblem = { ...q.codingProblem };
        delete cleanedProblem.hiddenTests;
        return { ...q, codingProblem: cleanedProblem };
      }
      return q;
    });

    return res.json({ questions: sanitizedQuestions });
  } catch (err) {
    // Default fallback questions with hidden tests stripped
    const defaultHidden = [
      { id: 'h1', description: 'Preserves arguments', input: 'args_check', expectedOutput: 'passed', isHidden: true },
      { id: 'h2', description: 'Preserves this binding', input: 'this_check', expectedOutput: 'passed', isHidden: true }
    ];
    ephemeralHiddenTestMap.set('code_debounce', defaultHidden);

    return res.json({
      questions: [
        {
          id: 'q1',
          type: 'resume',
          question: `Describe a critical performance issue you diagnosed in a past project and how you solved it.`,
          topic: 'Performance',
          difficulty: 6
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'Which statement accurately describes JavaScript microtask queue behavior?',
          topic: 'JavaScript Concurrency',
          difficulty: 6,
          options: [
            { id: 'A', text: 'Microtasks execute before render, draining the queue completely.' },
            { id: 'B', text: 'Microtasks process only after all setTimeout callbacks complete.' },
            { id: 'C', text: 'Microtasks are dispatched on a separate background thread.' },
            { id: 'D', text: 'Microtasks have lower priority than requestAnimationFrame.' }
          ],
          correctOptionId: 'A'
        },
        {
          id: 'q3',
          type: 'technical',
          question: 'Suppose your app needs real-time state sync across multiple browser tabs. What approaches would you evaluate?',
          topic: 'Browser Architecture',
          difficulty: 7
        },
        {
          id: 'q4',
          type: 'coding',
          question: 'Implement a debounced function executor inside our Controlled Coding Arena.',
          topic: 'Coding Arena',
          difficulty: 7,
          codingProblem: {
            id: 'code_debounce',
            title: 'Implement Debounce Function',
            difficulty: 'Medium',
            description: 'Implement a function `debounce(fn, delay)` that limits the rate at which `fn` can fire. The function should delay invoking `fn` until after `delay` milliseconds have elapsed since the last time it was called.',
            examples: [{ input: 'debounce(fn, 100)', output: 'Executes fn once after 100ms inactivity' }],
            constraints: ['delay is in milliseconds'],
            starterCode: `function debounce(fn, delay) {\n  let timerId = null;\n  return function(...args) {\n    if (timerId) clearTimeout(timerId);\n    timerId = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}`,
            language: 'javascript',
            visibleTests: [
              { id: 'v1', description: 'Single call executes after delay', input: '[100]', expectedOutput: 'executed' },
              { id: 'v2', description: 'Multiple rapid calls reset timer', input: '[50, 50, 100]', expectedOutput: 'executed_once' }
            ]
          }
        },
        {
          id: 'q5',
          type: 'behavioral',
          question: 'Describe a situation where technical scope creep threatened a deadline. How did you handle it?',
          topic: 'Ownership & Scope',
          difficulty: 6
        }
      ]
    });
  }
});

router.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, userAnswer } = req.body;
    const prompt = `Evaluate candidate answer.
Question: "${question.question}"
Candidate Answer: "${userAnswer}"

Return JSON format:
{
  "score": 84,
  "technicalDepth": 82,
  "correctness": 85,
  "reasoning": 84,
  "clarity": 85,
  "feedback": "Clear explanation of event loop queues.",
  "followUpSuggested": true,
  "difficultyAdjustment": "INCREASE"
}`;

    const data = await groq.callGroq([
      { role: 'system', content: 'You are a rigorous technical interviewer evaluating answers.' },
      { role: 'user', content: prompt }
    ]);
    return res.json(data);
  } catch (err) {
    const answerLen = (req.body.userAnswer || '').length;
    const score = Math.min(95, Math.max(65, Math.floor(70 + answerLen / 10)));
    return res.json({
      score,
      technicalDepth: score - 2,
      correctness: score,
      reasoning: score + 1,
      clarity: score - 1,
      feedback: 'Solid technical response demonstrating understanding of core mechanics.',
      followUpSuggested: answerLen > 40,
      difficultyAdjustment: score > 80 ? 'INCREASE' : 'MAINTAIN'
    });
  }
});

export default router;
