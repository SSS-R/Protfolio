import React from 'react';
import { readData } from '@/lib/store';
import ClientArchitect from '@/components/ClientArchitect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Architect() {
  const data = await getPortfolioData();

  const education = data?.education || [
    {
      "yearRange": "[ 2023 - PRESENT ]",
      "institution": "BRAC University",
      "degree": "B.Sc in Computer Engineering",
      "bullets": [
        "CGPA: 3.65 / 4.00",
        "Thesis: Quantum Cryptography (ongoing)"
      ]
    }
  ];

  const experience = data?.experience || [
    {
      "yearRange": "[ JUL 2025 - FEB 2026 ]",
      "role": "Lead Developer",
      "company": "Al-Mursalaat Online Academy (Remote)",
      "bullets": [
        "Developed web-based administration, student portals, and teacher directories",
        "Architected full-stack solution with FastAPI backend and React/Next.js frontend",
        "Configured Ubuntu server with Nginx reverse proxy"
      ]
    }
  ];

  const skillsAcquired = data?.skillsAcquired || [
    { "name": "JavaScript", "level": 90 },
    { "name": "Python", "level": 75 },
    { "name": "React", "level": 85 },
    { "name": "Tailwind", "level": 95 }
  ];

  const certifications = data?.certifications || [];

  return (
    <ClientArchitect 
      education={education}
      experience={experience}
      skillsAcquired={skillsAcquired}
      certifications={certifications}
    />
  );
}
