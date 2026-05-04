/**
 * One-time seed: creates Football Agent + Studies as real Projects
 * for existing users who had them as hardcoded pages.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';

const SEED_KEY = 'jar_projects_seeded_v1';

export default function ProjectSeed() {
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(() => !!localStorage.getItem(SEED_KEY));
  const [created, setCreated] = useState([]);

  const seedProjects = async () => {
    setSeeding(true);
    const toSeed = PROJECT_TEMPLATES.filter(t => t.id === 'football_agent' || t.id === 'studies');
    const names = [];
    for (const tpl of toSeed) {
      // Check if already exists
      const existing = await base44.entities.Project.filter({ name: tpl.name });
      if (existing.length === 0) {
        await base44.entities.Project.create({
          name: tpl.name,
          description: tpl.description,
          icon: tpl.icon,
          color: tpl.color,
          work_types: tpl.work_types,
          is_archived: false,
        });
        names.push(tpl.name);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    localStorage.setItem(SEED_KEY, '1');
    setCreated(names);
    setDone(true);
    setSeeding(false);
  };

  if (done && created.length === 0) return null;

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <p className="mono-header text-[10px] text-muted-foreground">MIGRATE LEGACY PROJECTS</p>
      {done ? (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-mono">Created: {created.join(', ')}</span>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Convert "Football Agent" and "Studies" into proper Projects so they appear in your sidebar under PROJECTS.
          </p>
          <Button onClick={seedProjects} disabled={seeding} variant="outline" className="font-mono text-xs">
            {seeding ? <><Loader2 className="w-3 h-3 animate-spin mr-2" />SEEDING...</> : 'CREATE FOOTBALL AGENT + STUDIES PROJECTS'}
          </Button>
        </>
      )}
    </div>
  );
}