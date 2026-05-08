export type CareerTrack = 'ic' | 'manager';

export interface Level {
  id: string;
  shortTitle: string;
  title: string;
  track: CareerTrack;
  timeToNext?: string;
  summary: string;
  note?: string;
  impact: string[];
  activities: string[];
}

export const icLevels: Level[] = [
  {
    id: 'se1',
    shortTitle: 'SE1',
    title: 'Software Engineer I',
    track: 'ic',
    timeToNext: 'Typical progression: 12 to 24 months',
    summary: 'Building strong engineering fundamentals and confidence with close team support.',
    impact: [
      'Delivers scoped work with guidance and steady follow-through.',
      'Learns team standards, tooling, and delivery rhythm.',
      'Improves quality through tests and code review feedback.',
    ],
    activities: [
      'Implements focused features and bug fixes.',
      'Joins code reviews and asks clear, clarifying questions.',
      'Documents decisions and applies post-release learnings.',
    ],
  },
  {
    id: 'se2',
    shortTitle: 'SE2',
    title: 'Software Engineer II',
    track: 'ic',
    timeToNext: 'Typical progression: 18 to 30 months',
    summary: 'Owning end-to-end feature delivery and making sound day-to-day technical trade-offs.',
    impact: [
      'Ships independently from planning through follow-up.',
      'Spots risks early and reduces avoidable incidents.',
      'Shares context clearly with product and engineering partners.',
    ],
    activities: [
      'Designs and delivers medium-sized features.',
      'Improves tests, observability, and maintainability.',
      'Supports incident response and contributes to retros.',
    ],
  },
  {
    id: 'se3',
    shortTitle: 'SE3',
    title: 'Senior Software Engineer',
    track: 'ic',
    timeToNext: 'Progression beyond this level is optional',
    summary: 'A trusted senior engineer who delivers high-value outcomes and raises team standards.',
    note: 'SE3 is a valid long-term destination, not a waiting room.',
    impact: [
      'Owns ambiguous work and turns it into clear outcomes.',
      'Improves architecture and execution quality across the team.',
      'Mentors others through strong feedback and collaboration.',
    ],
    activities: [
      'Leads initiatives spanning multiple services or domains.',
      'Guides technical trade-offs with explicit reasoning.',
      'Helps shape sprint plans and technical priorities.',
    ],
  },
  {
    id: 'se4',
    shortTitle: 'SE4',
    title: 'Staff Engineer',
    track: 'ic',
    timeToNext: 'Typical progression: 24+ months, varied profile',
    summary: 'Operating across teams and increasing leverage through systems thinking, influence, and strategic execution.',
    impact: [
      'Sets technical direction that improves speed and reliability.',
      'Aligns teams on architecture and reduces cross-team friction.',
      'Creates durable patterns others can reuse with minimal support.',
    ],
    activities: [
      'Leads architecture for cross-team initiatives.',
      'Runs technical discovery and de-risks major bets.',
      'Coaches senior engineers on influence and design quality.',
    ],
  },
  {
    id: 'se5',
    shortTitle: 'SE5',
    title: 'Principal Engineer',
    track: 'ic',
    timeToNext: 'Progression is selective and business-dependent',
    summary: 'Drives company-level technical outcomes through long-range strategy, execution systems, and strong leadership.',
    impact: [
      'Shapes multi-year technical direction for critical areas.',
      'Raises engineering effectiveness at organizational scale.',
      'Partners deeply with leadership on strategic trade-offs.',
    ],
    activities: [
      'Defines technical strategy across multiple teams.',
      'Sponsors major architecture and migration decisions.',
      'Builds mechanisms for consistency and operational excellence.',
    ],
  },
  {
    id: 'se6',
    shortTitle: 'SE6',
    title: 'Distinguished Engineer',
    track: 'ic',
    summary: 'A technical leader with sustained organization-wide impact and industry-level credibility.',
    impact: [
      'Influences executive decisions with technical clarity.',
      'Builds and protects long-term engineering capability.',
      'Represents engineering strategy internally and externally.',
    ],
    activities: [
      'Guides transformative programs spanning the company.',
      'Mentors principal and staff communities at scale.',
      'Establishes high-leverage standards for architecture and quality.',
    ],
  },
];

export const managerLevels: Level[] = [
  {
    id: 'em1',
    shortTitle: 'EM',
    title: 'Engineering Manager',
    track: 'manager',
    timeToNext: 'Typical progression: 24 to 36 months',
    summary: 'Leading a team through delivery, growth, and healthy engineering culture.',
    impact: [
      'Builds a strong team environment with clear expectations.',
      'Improves delivery predictability without sacrificing quality.',
      'Develops engineers through coaching and consistent feedback.',
    ],
    activities: [
      'Runs planning, prioritization, and team cadence.',
      'Partners with product and design to align outcomes.',
      'Handles hiring, performance, and development plans.',
    ],
  },
  {
    id: 'em2',
    shortTitle: 'Sr EM',
    title: 'Senior Engineering Manager',
    track: 'manager',
    summary: 'Leading multiple teams through managers or senior leads with a focus on organizational leverage.',
    impact: [
      'Raises performance across teams through strong systems and leadership.',
      'Builds leadership bench strength and succession plans.',
      'Drives strategic execution across cross-functional initiatives.',
    ],
    activities: [
      'Coordinates execution across teams and organizational boundaries.',
      'Coaches managers and senior individual contributors.',
      'Owns headcount planning and operating rhythms for larger groups.',
    ],
  },
];

export const levels: Level[] = [...icLevels, ...managerLevels];
