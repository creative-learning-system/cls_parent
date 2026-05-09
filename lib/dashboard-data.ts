/* ─── Types ──────────────────────────────────────────────── */
export type SectionKey = "home" | "mental-drill" | "reading" | "progress" | "messages";

export interface Teacher {
  id: string;
  initials: string;
  name: string;
  role: string;
  subject: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface Message {
  id: string;
  from: "teacher" | "parent";
  senderName: string;
  senderInitials: string;
  text: string;
  time: string;
}

export interface ProgressMetric {
  label: string;
  thisWeek: number;
  lastWeek: number;
  unit: string;
  max: number;
  color: "brand" | "amber";
}

export interface ReadingPart {
  id: string;
  label: string;
  question: string;
  answer: string;
}

export interface ReadingEntry {
  id: string;
  topic: string;
  date: string;
  parts: ReadingPart[];
}

export interface Drill {
  id: string;
  code: string;       // e.g. "OO", "MC"
  name: string;       // e.g. "Order of Operation"
  description: string;
  level: number;
  medal: "Bronze" | "Silver" | "Gold";
  recentlyPromoted?: boolean;
}

export interface DrillCategory {
  id: string;
  name: string;
  icon: "logic" | "linguistic";
  drills: Drill[];
}

export interface DrillSession {
  id: string;
  drillName: string;
  category: "logic" | "linguistic";
  score: number;
  total: number;
  time: string;       // e.g. "4:30 PM"
  date: string;       // e.g. "Today", "Yesterday", "2 days ago"
  dateLabel: string;  // e.g. "11 Feb 2026"
  period: "today" | "week" | "month" | "all";
}

export interface Child {
  id: string;
  initials: string;
  name: string;
  grade: string;
  level: string;
  tag: string;
  tagColor: "brand" | "amber";
  subjects: string[];
  learningStatus: string;
  stats: { label: string; value: string; unit: string; highlight?: boolean }[];
  notifications: { color: "success" | "amber"; title: string; sub: string }[];
  progress: { summary: string; metrics: ProgressMetric[] };
  drillCategories: DrillCategory[];
  drillActivity: DrillSession[];
  reading: ReadingEntry[];
  teachers: Teacher[];
  messages: Record<string, Message[]>;
}

/* ─── Mock data ──────────────────────────────────────────── */
export const children: Child[] = [
  {
    id: "co",
    initials: "CO",
    name: "Chidera Okafor",
    grade: "JSS 2B",
    level: "Junior Secondary",
    tag: "STEM",
    tagColor: "amber",
    subjects: ["Mathematics", "Basic Science", "Basic Technology"],
    learningStatus: "Consistent Learning",
    stats: [
      { label: "Today's Activity", value: "35",  unit: "minutes" },
      { label: "This Week",        value: "180", unit: "minutes total" },
      { label: "Learning Status",  value: "Consistent", unit: "learning", highlight: true },
    ],
    notifications: [
      { color: "success", title: "Promoted in Order of Operations", sub: "Category: Logical Reasoning — Great work, keep encouraging Chidera." },
      { color: "amber",   title: "Demoted in Sentence Analysis",    sub: "Category: Linguistic Reasoning — Chidera may need your attention here." },
    ],
    progress: {
      summary: "Chidera is showing great progress this week! Time spent learning increased by 20%, and accuracy improved to 85%. Keep encouraging consistent practice to maintain this positive momentum.",
      metrics: [
        { label: "Time Spent",        thisWeek: 180, lastWeek: 150, unit: "minutes", max: 300, color: "amber" },
        { label: "Accuracy",          thisWeek: 85,  lastWeek: 78,  unit: "%",       max: 100, color: "brand" },
        { label: "Levels Climbed",    thisWeek: 3,   lastWeek: 2,   unit: "levels",  max: 10,  color: "amber" },
        { label: "Lesson Completion", thisWeek: 50,  lastWeek: 40,  unit: "%",       max: 100, color: "brand" },
      ],
    },
    drillCategories: [
      {
        id: "logic",
        name: "Logical Reasoning",
        icon: "logic",
        drills: [
          { id: "oo", code: "OO", name: "Order of Operation",    description: "Tests how well the child handles calculation sequence and mathematical logic.",          level: 2, medal: "Silver", recentlyPromoted: true },
          { id: "mc", code: "MC", name: "Mental Calculation",    description: "Assesses speed and accuracy in performing arithmetic operations mentally.",              level: 1, medal: "Bronze" },
          { id: "fp", code: "FP", name: "Fraction Percentages",  description: "Evaluates understanding of fractions, decimals, and percentage conversions.",           level: 2, medal: "Silver" },
          { id: "ar", code: "AR", name: "Algebraic Reasoning",   description: "Tests ability to identify patterns and solve simple algebraic expressions.",            level: 2, medal: "Silver" },
          { id: "wp", code: "WP", name: "Word Problems",         description: "Measures comprehension and application of maths in real-world scenarios.",              level: 1, medal: "Bronze" },
          { id: "tc", code: "TC", name: "Time & Calendar",       description: "Checks understanding of time, dates, and duration calculations.",                       level: 2, medal: "Silver" },
        ],
      },
      {
        id: "linguistic",
        name: "Linguistic Reasoning",
        icon: "linguistic",
        drills: [
          { id: "vp", code: "VP", name: "Vocabulary & Prefix",   description: "Tests knowledge of word meanings, prefixes, and suffixes in context.",                  level: 1, medal: "Bronze" },
          { id: "gs", code: "GS", name: "Grammar & Syntax",      description: "Evaluates correct use of grammar rules and sentence construction.",                     level: 1, medal: "Bronze" },
          { id: "li", code: "LI", name: "Literary Inference",    description: "Assesses ability to draw conclusions and infer meaning from written passages.",         level: 1, medal: "Bronze" },
          { id: "st", code: "ST", name: "Sentence Analysis",     description: "Tests understanding of sentence structure, clauses, and punctuation.",                  level: 1, medal: "Bronze" },
          { id: "es", code: "ES", name: "Essay Structure",       description: "Evaluates ability to organise ideas into coherent paragraphs and arguments.",           level: 1, medal: "Bronze" },
          { id: "sp", code: "SP", name: "Spelling Patterns",     description: "Checks mastery of common spelling rules and irregular word forms.",                     level: 2, medal: "Silver" },
          { id: "oe", code: "OE", name: "Oral Expression",       description: "Measures clarity and confidence in expressing ideas verbally.",                         level: 1, medal: "Bronze" },
        ],
      },
    ],
    drillActivity: [
      { id: "d1",  drillName: "Order of Operation",      category: "logic",      score: 7, total: 10, time: "4:30 PM",  date: "Today",       dateLabel: "Today",        period: "today" },
      { id: "d2",  drillName: "Fraction and Percentage", category: "logic",      score: 8, total: 10, time: "4:55 PM",  date: "Today",       dateLabel: "Today",        period: "today" },
      { id: "d3",  drillName: "Grammar and Structure",   category: "linguistic", score: 6, total: 10, time: "9:10 PM",  date: "Today",       dateLabel: "Today",        period: "today" },
      { id: "d4",  drillName: "Money and Conversion",    category: "logic",      score: 5, total: 10, time: "3:00 PM",  date: "Yesterday",   dateLabel: "11 Feb 2026",  period: "week" },
      { id: "d5",  drillName: "Grammar and Structure",   category: "linguistic", score: 6, total: 10, time: "3:45 PM",  date: "Yesterday",   dateLabel: "11 Feb 2026",  period: "week" },
      { id: "d6",  drillName: "Order of Operation",      category: "logic",      score: 7, total: 10, time: "5:20 PM",  date: "Yesterday",   dateLabel: "11 Feb 2026",  period: "week" },
      { id: "d7",  drillName: "Fraction and Percentage", category: "logic",      score: 6, total: 10, time: "4:15 PM",  date: "2 days ago",  dateLabel: "10 Feb 2026",  period: "week" },
      { id: "d8",  drillName: "Logic and Inference",     category: "linguistic", score: 5, total: 10, time: "4:40 PM",  date: "2 days ago",  dateLabel: "10 Feb 2026",  period: "week" },
      { id: "d9",  drillName: "Mental Calculation",      category: "logic",      score: 9, total: 10, time: "2:00 PM",  date: "5 days ago",  dateLabel: "7 Feb 2026",   period: "month" },
      { id: "d10", drillName: "Spelling Patterns",       category: "linguistic", score: 7, total: 10, time: "3:30 PM",  date: "5 days ago",  dateLabel: "7 Feb 2026",   period: "month" },
      { id: "d11", drillName: "Word Problems",           category: "logic",      score: 6, total: 10, time: "11:00 AM", date: "8 days ago",  dateLabel: "4 Feb 2026",   period: "month" },
      { id: "d12", drillName: "Vocabulary & Prefix",     category: "linguistic", score: 8, total: 10, time: "11:30 AM", date: "8 days ago",  dateLabel: "4 Feb 2026",   period: "month" },
      { id: "d13", drillName: "Time & Calendar",         category: "logic",      score: 5, total: 10, time: "3:00 PM",  date: "15 days ago", dateLabel: "28 Jan 2026",  period: "all" },
      { id: "d14", drillName: "Essay Structure",         category: "linguistic", score: 4, total: 10, time: "4:00 PM",  date: "15 days ago", dateLabel: "28 Jan 2026",  period: "all" },
    ],
    reading: [
      {
        id: "r1",
        topic: "The Water Cycle",
        date: "Today",
        parts: [
          { id: "p1", label: "Part 1", question: "What is the water cycle?",    answer: "It is the way water moves between the sky, land, and sea over and over again." },
          { id: "p2", label: "Part 2", question: "Name two stages.",            answer: "Evaporation and condensation." },
          { id: "p3", label: "Part 3", question: "Why is it important?",        answer: "It gives us rain so plants and people have water." },
        ],
      },
      {
        id: "r2",
        topic: "Simple Machines",
        date: "2 days ago",
        parts: [
          { id: "p1", label: "Part 1", question: "What is a simple machine?",          answer: "A simple machine is a device that makes work easier by changing the direction or size of a force." },
          { id: "p2", label: "Part 2", question: "Name three types of simple machines.", answer: "A lever, a pulley, and an inclined plane." },
          { id: "p3", label: "Part 3", question: "Give an example of a lever.",         answer: "A see-saw is a lever because it has a pivot point in the middle and you push down on one side to lift the other." },
        ],
      },
    ],
    teachers: [
      { id: "ma", initials: "AA", name: "Mrs. Adebayo", role: "Class Teacher",   subject: "Mathematics",      lastMessage: "Chidera did well in today's quiz!",                lastTime: "10:30 AM",  unread: 2 },
      { id: "ok", initials: "OO", name: "Mr. Okonkwo",  role: "Subject Teacher", subject: "Basic Science",    lastMessage: "Please remind Chidera to bring her lab notebook.", lastTime: "Yesterday", unread: 0 },
      { id: "ej", initials: "EE", name: "Mrs. Ejike",   role: "Subject Teacher", subject: "Basic Technology", lastMessage: "The project submission is due Friday.",             lastTime: "Mon",       unread: 1 },
    ],
    messages: {
      ma: [
        { id: "1", from: "teacher", senderName: "Mrs. Adebayo", senderInitials: "AA", text: "Good morning! I wanted to let you know that Chidera did very well in today's Mathematics quiz.", time: "10:15 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "That's wonderful to hear! We've been practising at home every evening.", time: "10:22 AM" },
        { id: "3", from: "teacher", senderName: "Mrs. Adebayo", senderInitials: "AA", text: "It really shows. She scored 18/20. Keep up the great support!", time: "10:30 AM" },
      ],
      ok: [
        { id: "1", from: "teacher", senderName: "Mr. Okonkwo", senderInitials: "OO", text: "Hello Mr. Okafor. Please remind Chidera to bring her lab notebook to class tomorrow.", time: "Yesterday" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "Noted, I'll make sure she packs it tonight. Thank you for the reminder.", time: "Yesterday" },
      ],
      ej: [
        { id: "1", from: "teacher", senderName: "Mrs. Ejike", senderInitials: "EE", text: "Good afternoon. Just a reminder that the Basic Technology project is due this Friday.", time: "Mon 2:00 PM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor", senderInitials: "MO", text: "Thank you for the heads-up. What materials does she need?", time: "Mon 3:15 PM" },
        { id: "3", from: "teacher", senderName: "Mrs. Ejike", senderInitials: "EE", text: "She needs cardboard, a ruler, and coloured markers. The instructions are in her notebook.", time: "Mon 3:40 PM" },
      ],
    },
  },
  {
    id: "vo",
    initials: "VO",
    name: "Victor Okafor",
    grade: "SS 2 Science",
    level: "Senior Secondary",
    tag: "SENIOR SECONDARY",
    tagColor: "brand",
    subjects: ["Physics", "Chemistry", "Further Maths"],
    learningStatus: "Consistent Learning",
    stats: [
      { label: "Today's Activity", value: "50",  unit: "minutes" },
      { label: "This Week",        value: "210", unit: "minutes total" },
      { label: "Learning Status",  value: "Consistent", unit: "learning", highlight: true },
    ],
    notifications: [
      { color: "success", title: "Promoted in Quadratic Equations", sub: "Category: Algebra — Victor is excelling in Further Maths." },
    ],
    progress: {
      summary: "Victor had a strong week! Time spent increased by 16.7% and lesson completion jumped to 65%. Keep up the great work and focus on maintaining accuracy above 80%.",
      metrics: [
        { label: "Time Spent",        thisWeek: 210, lastWeek: 180, unit: "minutes", max: 300, color: "amber" },
        { label: "Accuracy",          thisWeek: 80,  lastWeek: 74,  unit: "%",       max: 100, color: "brand" },
        { label: "Levels Climbed",    thisWeek: 4,   lastWeek: 3,   unit: "levels",  max: 10,  color: "amber" },
        { label: "Lesson Completion", thisWeek: 65,  lastWeek: 50,  unit: "%",       max: 100, color: "brand" },
      ],
    },
    drillCategories: [
      {
        id: "logic",
        name: "Logical Reasoning",
        icon: "logic",
        drills: [
          { id: "oo", code: "OO", name: "Order of Operation",    description: "Tests how well the child handles calculation sequence and mathematical logic.",          level: 2, medal: "Silver" },
          { id: "mc", code: "MC", name: "Mental Calculation",    description: "Assesses speed and accuracy in performing arithmetic operations mentally.",              level: 2, medal: "Silver" },
          { id: "fp", code: "FP", name: "Fraction Percentages",  description: "Evaluates understanding of fractions, decimals, and percentage conversions.",           level: 3, medal: "Gold" },
          { id: "ar", code: "AR", name: "Algebraic Reasoning",   description: "Tests ability to identify patterns and solve simple algebraic expressions.",            level: 2, medal: "Silver", recentlyPromoted: true },
          { id: "wp", code: "WP", name: "Word Problems",         description: "Measures comprehension and application of maths in real-world scenarios.",              level: 2, medal: "Silver" },
        ],
      },
      {
        id: "linguistic",
        name: "Linguistic Reasoning",
        icon: "linguistic",
        drills: [
          { id: "vp", code: "VP", name: "Vocabulary & Prefix",   description: "Tests knowledge of word meanings, prefixes, and suffixes in context.",                  level: 2, medal: "Silver" },
          { id: "gs", code: "GS", name: "Grammar & Syntax",      description: "Evaluates correct use of grammar rules and sentence construction.",                     level: 2, medal: "Silver" },
          { id: "li", code: "LI", name: "Literary Inference",    description: "Assesses ability to draw conclusions and infer meaning from written passages.",         level: 1, medal: "Bronze" },
          { id: "st", code: "ST", name: "Sentence Analysis",     description: "Tests understanding of sentence structure, clauses, and punctuation.",                  level: 2, medal: "Silver" },
        ],
      },
    ],
    drillActivity: [
      { id: "d1",  drillName: "Order of Operation",      category: "logic",      score: 9, total: 10, time: "5:00 PM",  date: "Today",       dateLabel: "Today",        period: "today" },
      { id: "d2",  drillName: "Grammar and Structure",   category: "linguistic", score: 7, total: 10, time: "6:30 PM",  date: "Today",       dateLabel: "Today",        period: "today" },
      { id: "d3",  drillName: "Algebraic Reasoning",     category: "logic",      score: 8, total: 10, time: "4:00 PM",  date: "Yesterday",   dateLabel: "11 Feb 2026",  period: "week" },
      { id: "d4",  drillName: "Sentence Analysis",       category: "linguistic", score: 7, total: 10, time: "5:15 PM",  date: "Yesterday",   dateLabel: "11 Feb 2026",  period: "week" },
      { id: "d5",  drillName: "Fraction Percentages",    category: "logic",      score: 9, total: 10, time: "3:30 PM",  date: "2 days ago",  dateLabel: "10 Feb 2026",  period: "week" },
      { id: "d6",  drillName: "Literary Inference",      category: "linguistic", score: 6, total: 10, time: "4:45 PM",  date: "2 days ago",  dateLabel: "10 Feb 2026",  period: "week" },
      { id: "d7",  drillName: "Word Problems",           category: "logic",      score: 8, total: 10, time: "2:00 PM",  date: "5 days ago",  dateLabel: "7 Feb 2026",   period: "month" },
      { id: "d8",  drillName: "Vocabulary & Prefix",     category: "linguistic", score: 9, total: 10, time: "3:00 PM",  date: "5 days ago",  dateLabel: "7 Feb 2026",   period: "month" },
    ],
    reading: [
      {
        id: "r1",
        topic: "Newton's Laws of Motion",
        date: "Today",
        parts: [
          { id: "p1", label: "Part 1", question: "State Newton's First Law of Motion.",                answer: "An object at rest stays at rest, and an object in motion stays in motion at the same speed and direction, unless acted upon by an unbalanced force." },
          { id: "p2", label: "Part 2", question: "Give a real-life example of Newton's Second Law.",   answer: "When you kick a football, the harder you kick it (more force), the faster it accelerates. A heavier ball needs more force to achieve the same acceleration." },
          { id: "p3", label: "Part 3", question: "Explain Newton's Third Law with an example.",        answer: "For every action there is an equal and opposite reaction. For example, when a rocket expels gas downward, the reaction force pushes the rocket upward." },
        ],
      },
      {
        id: "r2",
        topic: "Organic Chemistry: Hydrocarbons",
        date: "2 days ago",
        parts: [
          { id: "p1", label: "Part 1", question: "What is a hydrocarbon?",                             answer: "A hydrocarbon is an organic compound made up of only hydrogen and carbon atoms. They are the main components of petroleum and natural gas." },
          { id: "p2", label: "Part 2", question: "Distinguish between alkanes and alkenes.",           answer: "Alkanes are saturated hydrocarbons with only single bonds (e.g. methane, ethane), while alkenes are unsaturated and contain at least one double bond (e.g. ethene)." },
        ],
      },
    ],
    teachers: [
      { id: "mb", initials: "BB", name: "Mr. Bello",   role: "Class Teacher",   subject: "Physics",       lastMessage: "Victor's practical report was excellent.",         lastTime: "9:45 AM",   unread: 1 },
      { id: "mc", initials: "CC", name: "Mrs. Chukwu", role: "Subject Teacher", subject: "Chemistry",     lastMessage: "Please ensure Victor revises organic chemistry.",  lastTime: "Yesterday", unread: 0 },
      { id: "ad", initials: "AY", name: "Mr. Adeyemi", role: "Subject Teacher", subject: "Further Maths", lastMessage: "Victor should attempt the past questions I sent.", lastTime: "Tue",       unread: 3 },
    ],
    messages: {
      mb: [
        { id: "1", from: "teacher", senderName: "Mr. Bello",   senderInitials: "BB", text: "Good morning Mr. Okafor. Victor submitted an excellent Physics practical report this week.", time: "9:30 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "That's great news! He spent a lot of time on it over the weekend.", time: "9:38 AM" },
        { id: "3", from: "teacher", senderName: "Mr. Bello",   senderInitials: "BB", text: "It really shows. His analysis of the results was particularly impressive.", time: "9:45 AM" },
      ],
      mc: [
        { id: "1", from: "teacher", senderName: "Mrs. Chukwu", senderInitials: "CC", text: "Hello. I wanted to flag that Victor needs to revise organic chemistry before the end-of-term exam.", time: "Yesterday 11:00 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "Understood. Are there specific topics he should focus on?", time: "Yesterday 11:20 AM" },
        { id: "3", from: "teacher", senderName: "Mrs. Chukwu", senderInitials: "CC", text: "Yes — hydrocarbons and functional groups. I'll send a revision sheet by end of day.", time: "Yesterday 11:35 AM" },
        { id: "4", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "Thank you very much, Mrs. Chukwu. We appreciate your support.", time: "Yesterday 12:00 PM" },
      ],
      ad: [
        { id: "1", from: "teacher", senderName: "Mr. Adeyemi", senderInitials: "AY", text: "Good day Mr. Okafor. I've sent a set of Further Maths past questions to Victor's school portal.", time: "Tue 8:00 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "Thank you, sir. I'll make sure he works through them this week.", time: "Tue 8:30 AM" },
        { id: "3", from: "teacher", senderName: "Mr. Adeyemi", senderInitials: "AY", text: "Please focus on the integration and differentiation sections — those carry the most marks.", time: "Tue 8:45 AM" },
        { id: "4", from: "teacher", senderName: "Mr. Adeyemi", senderInitials: "AY", text: "Also, Victor should aim to complete at least two full papers before Friday.", time: "Tue 9:00 AM" },
        { id: "5", from: "parent",  senderName: "Mr. Okafor",  senderInitials: "MO", text: "Noted. We'll get started tonight. Thank you for the guidance.", time: "Tue 9:15 AM" },
      ],
    },
  },
];
