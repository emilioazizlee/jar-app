import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { FOOTBALL_WORK_TYPES } from '@/lib/footballConstants';

const today = () => format(new Date(), 'yyyy-MM-dd');

const FORMS = {
  scouting_report: ScoutingReportForm,
  tryout: TryoutForm,
  meeting: MeetingForm,
  match_watch: MatchWatchForm,
  player_profile: PlayerProfileForm,
  negotiation: NegotiationForm,
  contract_doc: ContractDocForm,
  fifa_exam: FifaExamForm,
  travel: TravelForm,
};

export default function FootballWorkForm({ open, onClose, onSaved }) {
  const [workType, setWorkType] = useState(null);

  if (workType) {
    const FormComponent = FORMS[workType.key];
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="mono-header text-sm flex items-center gap-2" style={{ color: workType.color }}>
              <button onClick={() => setWorkType(null)} className="hover:text-foreground transition-colors mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
              {workType.label.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <FormComponent workType={workType} onSaved={onSaved} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm" style={{ color: '#ff9f43' }}>SELECT WORK TYPE</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {FOOTBALL_WORK_TYPES.map((wt, i) => {
            const Icon = wt.icon;
            return (
              <motion.button
                key={wt.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setWorkType(wt)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-opacity-60 transition-all text-center"
                style={{ '--hover-color': wt.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = wt.color + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: wt.color + '20' }}>
                  <Icon className="w-5 h-5" style={{ color: wt.color }} />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground leading-tight">{wt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Shared save helper
function useSave(workType, onSaved, onClose) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const save = async (formData, title) => {
    setSaving(true);
    await base44.entities.Item.create({
      type: 'task',
      title,
      category: 'Football',
      status: formData.status || 'Draft',
      date: formData.date || today(),
      description: JSON.stringify({ work_type: workType.key, ...formData }),
      note: formData.notes || formData.recommendation || '',
    });
    queryClient.invalidateQueries({ queryKey: ['football-items'] });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setSaving(false);
    onSaved();
  };

  return { save, saving };
}

// ─── Scouting Report ────────────────────────────────────────────────────────
function ScoutingReportForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ player_name: '', dob: '', nationality: '', current_club: '', position: '', match_date: today(), opponent: '', competition: '', minutes: '', tech: '', tact: '', phys: '', mental: '', overall: '', strengths: '', weaknesses: '', comparable: '', recommendation: 'Monitor', language: 'English', status: 'Draft' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const ratingProps = (key) => ({ type: 'number', min: 1, max: 10, value: f[key], onChange: e => u(key, e.target.value), className: 'bg-muted border-none mt-1 h-8 font-mono text-sm' });

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="PLAYER NAME"><Input value={f.player_name} onChange={e => u('player_name', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="DATE OF BIRTH"><Input type="date" value={f.dob} onChange={e => u('dob', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="NATIONALITY"><Input value={f.nationality} onChange={e => u('nationality', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="CURRENT CLUB"><Input value={f.current_club} onChange={e => u('current_club', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="POSITION(S)"><Input value={f.position} onChange={e => u('position', e.target.value)} className="bg-muted border-none mt-1" placeholder="LW, CAM..." /></F>
        <F label="MINUTES OBSERVED"><Input type="number" value={f.minutes} onChange={e => u('minutes', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <F label="MATCH DATE"><Input type="date" value={f.match_date} onChange={e => u('match_date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="OPPONENT"><Input value={f.opponent} onChange={e => u('opponent', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="COMPETITION"><Input value={f.competition} onChange={e => u('competition', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground font-mono">RATINGS (1–10)</Label>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {['tech', 'tact', 'phys', 'mental', 'overall'].map(k => (
            <div key={k}><span className="font-mono text-[9px] text-muted-foreground uppercase">{k}</span><Input {...ratingProps(k)} /></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <F label="STRENGTHS"><Textarea value={f.strengths} onChange={e => u('strengths', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
        <F label="WEAKNESSES"><Textarea value={f.weaknesses} onChange={e => u('weaknesses', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <F label="COMPARABLE PLAYERS"><Input value={f.comparable} onChange={e => u('comparable', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="RECOMMENDATION">
          <Select value={f.recommendation} onValueChange={v => u('recommendation', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Sign">Sign</SelectItem><SelectItem value="Monitor">Monitor</SelectItem><SelectItem value="Pass">Pass</SelectItem></SelectContent>
          </Select>
        </F>
        <F label="STATUS">
          <Select value={f.status} onValueChange={v => u('status', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Final">Final</SelectItem></SelectContent>
          </Select>
        </F>
      </div>

      <Button onClick={() => save(f, `SR — ${f.player_name || 'Unknown Player'}`)} disabled={saving || !f.player_name} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE SCOUTING REPORT'}
      </Button>
    </div>
  );
}

// ─── Meeting ─────────────────────────────────────────────────────────────────
function MeetingForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ meeting_type: 'Client', person_org: '', date: today(), time: '', location_type: 'In-person', location: '', agenda: '', attendees: '', key_points: '', decisions: '', follow_up: '', status: 'Active' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="TYPE">
          <Select value={f.meeting_type} onValueChange={v => u('meeting_type', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Client','Club','Coach','Family','Federation','Internal'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="PERSON / ORG"><Input value={f.person_org} onChange={e => u('person_org', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="DATE"><Input type="date" value={f.date} onChange={e => u('date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="TIME"><Input type="time" value={f.time} onChange={e => u('time', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="FORMAT">
          <Select value={f.location_type} onValueChange={v => u('location_type', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['In-person','Video','Phone'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="LOCATION / LINK"><Input value={f.location} onChange={e => u('location', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>
      <F label="AGENDA"><Textarea value={f.agenda} onChange={e => u('agenda', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <F label="ATTENDEES"><Input value={f.attendees} onChange={e => u('attendees', e.target.value)} className="bg-muted border-none mt-1" /></F>
      <F label="KEY POINTS DISCUSSED"><Textarea value={f.key_points} onChange={e => u('key_points', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="DECISIONS MADE"><Textarea value={f.decisions} onChange={e => u('decisions', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
        <F label="FOLLOW-UP ACTIONS"><Textarea value={f.follow_up} onChange={e => u('follow_up', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      </div>
      <Button onClick={() => save(f, `Meeting — ${f.meeting_type} · ${f.person_org || 'Unknown'}`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE MEETING'}
      </Button>
    </div>
  );
}

// ─── Match to Watch ───────────────────────────────────────────────────────────
function MatchWatchForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ competition: '', home_team: '', away_team: '', date: today(), time: '', reason: 'specific player', players_to_watch: '', where: 'Streaming', platform: '', status: 'Upcoming', post_match_notes: '' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="COMPETITION"><Input value={f.competition} onChange={e => u('competition', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="DATE & TIME">
          <div className="flex gap-2 mt-1">
            <Input type="date" value={f.date} onChange={e => u('date', e.target.value)} className="bg-muted border-none font-mono text-sm flex-1" />
            <Input type="time" value={f.time} onChange={e => u('time', e.target.value)} className="bg-muted border-none font-mono text-sm w-24" />
          </div>
        </F>
        <F label="HOME TEAM"><Input value={f.home_team} onChange={e => u('home_team', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="AWAY TEAM"><Input value={f.away_team} onChange={e => u('away_team', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="WATCHING REASON">
          <Select value={f.reason} onValueChange={v => u('reason', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Specific player','General scouting','Scheduled obligation'].map(r => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="WHERE">
          <Select value={f.where} onValueChange={v => u('where', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Stadium','Streaming','TV'].map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
          </Select>
        </F>
      </div>
      <F label="PLAYERS TO WATCH"><Input value={f.players_to_watch} onChange={e => u('players_to_watch', e.target.value)} className="bg-muted border-none mt-1" placeholder="Names or IDs..." /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="PLATFORM / STADIUM"><Input value={f.platform} onChange={e => u('platform', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="STATUS">
          <Select value={f.status} onValueChange={v => u('status', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Upcoming','Watched','Missed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </F>
      </div>
      <F label="POST-MATCH NOTES"><Textarea value={f.post_match_notes} onChange={e => u('post_match_notes', e.target.value)} className="bg-muted border-none mt-1" rows={3} /></F>
      <Button onClick={() => save(f, `Match — ${f.home_team || '?'} vs ${f.away_team || '?'}`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE MATCH'}
      </Button>
    </div>
  );
}

// ─── Player Profile Review ────────────────────────────────────────────────────
function PlayerProfileForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ player_name: '', source: 'Agent contact', initial_impressions: '', highlights_url: '', stats_url: '', decision: 'Monitor', date: today(), status: 'Draft' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="PLAYER NAME"><Input value={f.player_name} onChange={e => u('player_name', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="SOURCE">
          <Select value={f.source} onValueChange={v => u('source', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Wyscout','Transfermarkt','InStat','Agent contact','Club referral'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </F>
      </div>
      <F label="INITIAL IMPRESSIONS"><Textarea value={f.initial_impressions} onChange={e => u('initial_impressions', e.target.value)} className="bg-muted border-none mt-1" rows={3} /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="HIGHLIGHTS URL"><Input value={f.highlights_url} onChange={e => u('highlights_url', e.target.value)} className="bg-muted border-none mt-1" placeholder="https://..." /></F>
        <F label="STATS URL/NOTES"><Input value={f.stats_url} onChange={e => u('stats_url', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="DECISION">
          <Select value={f.decision} onValueChange={v => u('decision', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Pursue','Monitor','Pass'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="DATE"><Input type="date" value={f.date} onChange={e => u('date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
      </div>
      <Button onClick={() => save(f, `Profile — ${f.player_name || 'Unknown'}`)} disabled={saving || !f.player_name} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE PROFILE REVIEW'}
      </Button>
    </div>
  );
}

// ─── Negotiation / Deal ───────────────────────────────────────────────────────
function NegotiationForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ player_name: '', counterparty: '', stage: 'Initial contact', transfer_fee: '', salary: '', contract_length: '', bonuses: '', agent_commission: '', deadline: '', last_contact: today(), next_step: '', confidential: false, status: 'Active' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="PLAYER NAME"><Input value={f.player_name} onChange={e => u('player_name', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="COUNTERPARTY"><Input value={f.counterparty} onChange={e => u('counterparty', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>
      <F label="STAGE">
        <Select value={f.stage} onValueChange={v => u('stage', v)}>
          <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{['Initial contact','Terms exchange','Offer received','Counter','Agreed','Closed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </F>
      <div className="grid grid-cols-2 gap-3">
        <F label="TRANSFER FEE"><Input value={f.transfer_fee} onChange={e => u('transfer_fee', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
        <F label="SALARY / YEAR"><Input value={f.salary} onChange={e => u('salary', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
        <F label="CONTRACT LENGTH"><Input value={f.contract_length} onChange={e => u('contract_length', e.target.value)} className="bg-muted border-none mt-1" placeholder="e.g. 2 years" /></F>
        <F label="AGENT COMMISSION"><Input value={f.agent_commission} onChange={e => u('agent_commission', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
        <F label="DEADLINE"><Input type="date" value={f.deadline} onChange={e => u('deadline', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="LAST CONTACT"><Input type="date" value={f.last_contact} onChange={e => u('last_contact', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
      </div>
      <F label="NEXT STEP"><Input value={f.next_step} onChange={e => u('next_step', e.target.value)} className="bg-muted border-none mt-1" /></F>
      <Button onClick={() => save(f, `Deal — ${f.player_name || 'Unknown'} · ${f.stage}`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE NEGOTIATION'}
      </Button>
    </div>
  );
}

// ─── Contract / Document ──────────────────────────────────────────────────────
function ContractDocForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ doc_type: 'Representation agreement', parties: '', date_drafted: today(), date_signed: '', expiry_date: '', file_url: '', notes: '', status: 'Draft' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="DOCUMENT TYPE">
          <Select value={f.doc_type} onValueChange={v => u('doc_type', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Representation agreement','Transfer contract','NDA','Power of attorney','Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="STATUS">
          <Select value={f.status} onValueChange={v => u('status', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Draft','Signed','Expired'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </F>
      </div>
      <F label="PARTIES INVOLVED"><Input value={f.parties} onChange={e => u('parties', e.target.value)} className="bg-muted border-none mt-1" /></F>
      <div className="grid grid-cols-3 gap-3">
        <F label="DATE DRAFTED"><Input type="date" value={f.date_drafted} onChange={e => u('date_drafted', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="DATE SIGNED"><Input type="date" value={f.date_signed} onChange={e => u('date_signed', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="EXPIRY DATE"><Input type="date" value={f.expiry_date} onChange={e => u('expiry_date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
      </div>
      <F label="FILE URL"><Input value={f.file_url} onChange={e => u('file_url', e.target.value)} className="bg-muted border-none mt-1" placeholder="https://drive.google.com/..." /></F>
      <F label="NOTES"><Textarea value={f.notes} onChange={e => u('notes', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <Button onClick={() => save(f, `Doc — ${f.doc_type}`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE DOCUMENT'}
      </Button>
    </div>
  );
}

// ─── FIFA Exam Prep ───────────────────────────────────────────────────────────
function FifaExamForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ topic: 'FFAR', hours: '', materials: '', mock_score: '', confidence: 3, notes: '', date: today() });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="TOPIC">
          <Select value={f.topic} onValueChange={v => u('topic', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['FFAR','RSTP','Case studies','Mock exam'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="DATE"><Input type="date" value={f.date} onChange={e => u('date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="HOURS STUDIED"><Input type="number" value={f.hours} onChange={e => u('hours', e.target.value)} className="bg-muted border-none mt-1 font-mono" step="0.5" /></F>
        <F label="MOCK SCORE (if any)"><Input value={f.mock_score} onChange={e => u('mock_score', e.target.value)} className="bg-muted border-none mt-1 font-mono" placeholder="e.g. 75%" /></F>
      </div>
      <F label="MATERIALS USED"><Input value={f.materials} onChange={e => u('materials', e.target.value)} className="bg-muted border-none mt-1" placeholder="URLs or names..." /></F>
      <F label="CONFIDENCE (1–5)">
        <div className="flex gap-2 mt-1">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => u('confidence', n)}
              className={`flex-1 py-1.5 rounded-lg font-mono text-sm border transition-all ${f.confidence === n ? 'border-purple-500 bg-purple-500/20 text-purple-400' : 'border-border bg-muted text-muted-foreground'}`}
            >{n}</button>
          ))}
        </div>
      </F>
      <F label="NOTES"><Textarea value={f.notes} onChange={e => u('notes', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <Button onClick={() => save(f, `FIFA Prep — ${f.topic} · ${f.hours}h`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE STUDY SESSION'}
      </Button>
    </div>
  );
}

// ─── Tryout ───────────────────────────────────────────────────────────────────
function TryoutForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ player_name: '', club_hosting: '', date: today(), location: '', duration: '', coaches: '', drills: '', performance_summary: '', outcome: 'Pending', next_action: '' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <F label="PLAYER NAME"><Input value={f.player_name} onChange={e => u('player_name', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="CLUB HOSTING"><Input value={f.club_hosting} onChange={e => u('club_hosting', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="DATE"><Input type="date" value={f.date} onChange={e => u('date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="DURATION (min)"><Input type="number" value={f.duration} onChange={e => u('duration', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
        <F label="LOCATION"><Input value={f.location} onChange={e => u('location', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="COACHES PRESENT"><Input value={f.coaches} onChange={e => u('coaches', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>
      <F label="DRILLS OBSERVED"><Textarea value={f.drills} onChange={e => u('drills', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <F label="PLAYER PERFORMANCE SUMMARY"><Textarea value={f.performance_summary} onChange={e => u('performance_summary', e.target.value)} className="bg-muted border-none mt-1" rows={3} /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="OUTCOME">
          <Select value={f.outcome} onValueChange={v => u('outcome', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Signed','Pending','Rejected','Returning'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="NEXT ACTION"><Input value={f.next_action} onChange={e => u('next_action', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>
      <Button onClick={() => save(f, `Trial — ${f.player_name || 'Unknown'} @ ${f.club_hosting || '?'}`)} disabled={saving || !f.player_name} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE TRIAL'}
      </Button>
    </div>
  );
}

// ─── Travel ───────────────────────────────────────────────────────────────────
function TravelForm({ workType, onSaved, onClose }) {
  const { save, saving } = useSave(workType, onSaved, onClose);
  const [f, setF] = useState({ purpose: '', destination: '', departure: today(), return_date: '', linked_players: '', estimated_cost: '', booking_status: 'Not booked', notes: '', status: 'Planned' });
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3 pt-2">
      <F label="PURPOSE"><Input value={f.purpose} onChange={e => u('purpose', e.target.value)} className="bg-muted border-none mt-1" /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="DESTINATION"><Input value={f.destination} onChange={e => u('destination', e.target.value)} className="bg-muted border-none mt-1" /></F>
        <F label="BOOKING STATUS">
          <Select value={f.booking_status} onValueChange={v => u('booking_status', v)}>
            <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{['Not booked','Booked','Confirmed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </F>
        <F label="DEPARTURE"><Input type="date" value={f.departure} onChange={e => u('departure', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="RETURN"><Input type="date" value={f.return_date} onChange={e => u('return_date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" /></F>
        <F label="ESTIMATED COST"><Input value={f.estimated_cost} onChange={e => u('estimated_cost', e.target.value)} className="bg-muted border-none mt-1 font-mono" /></F>
        <F label="LINKED PLAYERS / MEETINGS"><Input value={f.linked_players} onChange={e => u('linked_players', e.target.value)} className="bg-muted border-none mt-1" /></F>
      </div>
      <F label="NOTES"><Textarea value={f.notes} onChange={e => u('notes', e.target.value)} className="bg-muted border-none mt-1" rows={2} /></F>
      <Button onClick={() => save(f, `Trip — ${f.destination || 'Unknown'}`)} disabled={saving} className="w-full font-mono" style={{ background: workType.color, color: '#000' }}>
        {saving ? 'SAVING...' : 'SAVE TRIP'}
      </Button>
    </div>
  );
}

// Shared label wrapper
function F({ label, children }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground font-mono">{label}</Label>
      {children}
    </div>
  );
}