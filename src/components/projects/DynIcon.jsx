/**
 * Dynamic icon renderer — renders a Lucide icon by string name.
 * Uses a fixed map to avoid wildcard imports.
 */
import React from 'react';
import {
  Briefcase, GraduationCap, Laptop, Rocket, Camera, Music,
  Heart, Star, Zap, Globe, Book, Code2, Dumbbell,
  Palette, Film, Mic, Trophy, Building2, Plane, Leaf,
  FolderOpen, Target, Activity, PenTool, Users, FileText,
  Eye, Tv, User, FileCheck, Handshake, File, BookOpen,
  CheckSquare, DollarSign, RefreshCw, CreditCard, BarChart3,
  Calendar, Apple, Settings, LayoutDashboard, Plus, Folder,
} from 'lucide-react';

const ICON_MAP = {
  Briefcase, GraduationCap, Laptop, Rocket, Camera, Music,
  Heart, Star, Zap, Globe, Book, Code2, Dumbbell,
  Palette, Film, Mic, Trophy, Building2, Plane, Leaf,
  FolderOpen, Target, Activity, PenTool, Users, FileText,
  Eye, Tv, User, FileCheck, Handshake, File, BookOpen,
  CheckSquare, DollarSign, RefreshCw, CreditCard, BarChart3,
  Calendar, Apple, Settings, LayoutDashboard, Plus, Folder,
};

export default function DynIcon({ name, ...props }) {
  const Icon = ICON_MAP[name] || FolderOpen;
  return <Icon {...props} />;
}