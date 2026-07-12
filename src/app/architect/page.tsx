import React from 'react';
import Image from 'next/image';
import fs from 'fs/promises';
import path from 'path';
import ClientArchitect from '@/components/ClientArchitect';

async function getPortfolioData() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/portfolio.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read portfolio data:', error);
    return null;
  }
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
