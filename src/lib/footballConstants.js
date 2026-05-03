import { FileText, Eye, Users, Tv, User, FileCheck, Handshake, File, BookOpen, Plane } from 'lucide-react';

export const FOOTBALL_WORK_TYPES = [
  { key: 'scouting_report', label: 'Scouting Report', icon: FileText, color: '#39ff14', short: 'SR' },
  { key: 'tryout', label: 'Try-out / Trial', icon: User, color: '#4da6ff', short: 'TT' },
  { key: 'meeting', label: 'Meeting', icon: Users, color: '#a855f7', short: 'MT' },
  { key: 'match_watch', label: 'Match to Watch', icon: Tv, color: '#ffd60a', short: 'MW' },
  { key: 'player_profile', label: 'Player Profile Review', icon: Eye, color: '#06d6a0', short: 'PP' },
  { key: 'negotiation', label: 'Negotiation / Deal', icon: Handshake, color: '#ff9f43', short: 'ND' },
  { key: 'contract_doc', label: 'Contract / Document', icon: File, color: '#ff2d2d', short: 'CD' },
  { key: 'fifa_exam', label: 'FIFA Exam Prep', icon: BookOpen, color: '#e040fb', short: 'FE' },
  { key: 'travel', label: 'Travel / Trip', icon: Plane, color: '#40c4ff', short: 'TR' },
];