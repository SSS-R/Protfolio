// Shared content types for the portfolio admin + pages.

export interface Skill {
  name: string;
  equipped: boolean;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  desc: string;
  tech: string[];
  image?: string;
  status: string;
  category: string;
  link?: string;
}

export interface Experience {
  yearRange: string;
  role: string;
  company: string;
  bullets: string[];
}

export interface Education {
  yearRange: string;
  institution: string;
  degree: string;
  bullets: string[];
}

export interface SkillLevel {
  name: string;
  level: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface TerminalCommand {
  command: string;
  response: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  year: string;
}

export interface AboutInfo {
  biography: string;
  aims: string;
  interests: string[];
}

export interface Profile {
  name: string;
  avatar: string;
  class: string;
  base: string;
  guild: string;
  status: string;
  level: string;
  intro?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  duration: string;
  url: string;
}

export interface PortfolioData {
  profile: Profile;
  nowBuilding?: string;
  audio?: { nowPlaying: string; progress: number };
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  skillsAcquired: SkillLevel[];
  certifications: Certification[];
  terminalCommands: TerminalCommand[];
  about: AboutInfo;
  roadmap: RoadmapNode[];
  tracks?: MusicTrack[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}
