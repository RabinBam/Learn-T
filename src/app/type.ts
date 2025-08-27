// src/types.ts
import { LucideIcon } from "lucide-react";

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export interface Region {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface LevelData {
  level: number;
  task: string;
  solution: string;
  hint: string;
  tutorial?: string;
  component: string;
  baseClasses: string;
  parentClasses?: string;
  content: string;
  description: string;
  maxTime: number;
  points: number;
  region: Region;
  tier: number;
}

export interface MapPoint {
  level: number;
  x: number;
  y: number;
  region: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  completed: boolean;
  current: boolean;
  available: boolean;
  angle: number;
}
