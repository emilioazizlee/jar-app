/**
 * Built-in project templates for the "New Project" gallery.
 */

export const PROJECT_TEMPLATES = [
  {
    id: 'football_agent',
    name: 'Football Agent',
    description: 'Manage scouting, negotiations, contracts, and player development.',
    icon: 'Briefcase',
    color: '#ff9f43',
    work_types: [
      { key: 'scouting_report', label: 'Scouting Report', color: '#39ff14', short: 'SR', fields: [
        { key: 'player_name', label: 'Player Name', field_type: 'text' },
        { key: 'position', label: 'Position', field_type: 'text' },
        { key: 'current_club', label: 'Current Club', field_type: 'text' },
        { key: 'overall', label: 'Rating (1-10)', field_type: 'number' },
        { key: 'recommendation', label: 'Recommendation', field_type: 'select', options: ['Sign', 'Monitor', 'Pass'] },
        { key: 'match_date', label: 'Match Date', field_type: 'date' },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'tryout', label: 'Try-out / Trial', color: '#4da6ff', short: 'TT', fields: [
        { key: 'player_name', label: 'Player Name', field_type: 'text' },
        { key: 'club_hosting', label: 'Club Hosting', field_type: 'text' },
        { key: 'outcome', label: 'Outcome', field_type: 'select', options: ['Signed', 'Pending', 'Rejected', 'Returning'] },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'meeting', label: 'Meeting', color: '#a855f7', short: 'MT', fields: [
        { key: 'person_org', label: 'Person / Org', field_type: 'text' },
        { key: 'meeting_type', label: 'Type', field_type: 'select', options: ['Client', 'Club', 'Coach', 'Family', 'Federation'] },
        { key: 'key_points', label: 'Key Points', field_type: 'textarea' },
        { key: 'follow_up', label: 'Follow-up', field_type: 'textarea' },
      ]},
      { key: 'match_watch', label: 'Match to Watch', color: '#ffd60a', short: 'MW', fields: [
        { key: 'home_team', label: 'Home Team', field_type: 'text' },
        { key: 'away_team', label: 'Away Team', field_type: 'text' },
        { key: 'players_to_watch', label: 'Players to Watch', field_type: 'text' },
        { key: 'post_match_notes', label: 'Post-match Notes', field_type: 'textarea' },
      ]},
      { key: 'negotiation', label: 'Negotiation', color: '#ff9f43', short: 'ND', fields: [
        { key: 'player_name', label: 'Player Name', field_type: 'text' },
        { key: 'counterparty', label: 'Counterparty', field_type: 'text' },
        { key: 'stage', label: 'Stage', field_type: 'select', options: ['Initial contact', 'Terms exchange', 'Offer received', 'Counter', 'Agreed', 'Closed'] },
        { key: 'transfer_fee', label: 'Transfer Fee', field_type: 'text' },
        { key: 'salary', label: 'Salary/Year', field_type: 'text' },
      ]},
      { key: 'contract_doc', label: 'Contract / Doc', color: '#ff2d2d', short: 'CD', fields: [
        { key: 'doc_type', label: 'Document Type', field_type: 'select', options: ['Representation agreement', 'Transfer contract', 'NDA', 'Power of attorney', 'Other'] },
        { key: 'parties', label: 'Parties', field_type: 'text' },
        { key: 'expiry_date', label: 'Expiry Date', field_type: 'date' },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'fifa_exam', label: 'FIFA Exam Prep', color: '#e040fb', short: 'FE', fields: [
        { key: 'topic', label: 'Topic', field_type: 'select', options: ['FFAR', 'RSTP', 'Case studies', 'Mock exam'] },
        { key: 'hours', label: 'Hours Studied', field_type: 'number' },
        { key: 'mock_score', label: 'Mock Score', field_type: 'text' },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'travel', label: 'Travel / Trip', color: '#40c4ff', short: 'TR', fields: [
        { key: 'destination', label: 'Destination', field_type: 'text' },
        { key: 'purpose', label: 'Purpose', field_type: 'text' },
        { key: 'departure', label: 'Departure', field_type: 'date' },
        { key: 'return_date', label: 'Return', field_type: 'date' },
        { key: 'estimated_cost', label: 'Estimated Cost', field_type: 'text' },
      ]},
    ],
  },
  {
    id: 'studies',
    name: 'Studies',
    description: 'Track coursework, exams, readings, and academic progress.',
    icon: 'GraduationCap',
    color: '#4da6ff',
    work_types: [
      { key: 'coursework', label: 'Coursework', color: '#4da6ff', short: 'CW', fields: [
        { key: 'subject', label: 'Subject', field_type: 'text' },
        { key: 'assignment_type', label: 'Type', field_type: 'select', options: ['Essay', 'Problem Set', 'Project', 'Lab Report', 'Presentation'] },
        { key: 'due_date', label: 'Due Date', field_type: 'date' },
        { key: 'grade', label: 'Grade', field_type: 'text' },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'exam_prep', label: 'Exam Prep', color: '#ff2d2d', short: 'EP', fields: [
        { key: 'subject', label: 'Subject', field_type: 'text' },
        { key: 'exam_date', label: 'Exam Date', field_type: 'date' },
        { key: 'hours_studied', label: 'Hours Studied', field_type: 'number' },
        { key: 'topics_covered', label: 'Topics Covered', field_type: 'textarea' },
        { key: 'confidence', label: 'Confidence (1-5)', field_type: 'number' },
      ]},
      { key: 'reading', label: 'Reading', color: '#39ff14', short: 'RD', fields: [
        { key: 'title', label: 'Title', field_type: 'text' },
        { key: 'author', label: 'Author', field_type: 'text' },
        { key: 'pages_read', label: 'Pages Read', field_type: 'number' },
        { key: 'key_takeaways', label: 'Key Takeaways', field_type: 'textarea' },
      ]},
      { key: 'lecture_notes', label: 'Lecture Notes', color: '#ffd60a', short: 'LN', fields: [
        { key: 'subject', label: 'Subject', field_type: 'text' },
        { key: 'professor', label: 'Professor', field_type: 'text' },
        { key: 'summary', label: 'Summary', field_type: 'textarea' },
        { key: 'action_items', label: 'Action Items', field_type: 'textarea' },
      ]},
      { key: 'group_work', label: 'Group Work', color: '#a855f7', short: 'GW', fields: [
        { key: 'project_name', label: 'Project Name', field_type: 'text' },
        { key: 'members', label: 'Members', field_type: 'text' },
        { key: 'my_contribution', label: 'My Contribution', field_type: 'textarea' },
        { key: 'deadline', label: 'Deadline', field_type: 'date' },
      ]},
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    description: 'Track clients, projects, invoices, and deliverables.',
    icon: 'Laptop',
    color: '#06d6a0',
    work_types: [
      { key: 'client_project', label: 'Client Project', color: '#06d6a0', short: 'CP', fields: [
        { key: 'client', label: 'Client', field_type: 'text' },
        { key: 'project_name', label: 'Project Name', field_type: 'text' },
        { key: 'budget', label: 'Budget', field_type: 'number' },
        { key: 'deadline', label: 'Deadline', field_type: 'date' },
        { key: 'status', label: 'Status', field_type: 'select', options: ['Proposal', 'Active', 'Review', 'Delivered', 'Paid'] },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'invoice', label: 'Invoice', color: '#ffd60a', short: 'INV', fields: [
        { key: 'client', label: 'Client', field_type: 'text' },
        { key: 'amount', label: 'Amount', field_type: 'number' },
        { key: 'due_date', label: 'Due Date', field_type: 'date' },
        { key: 'status', label: 'Status', field_type: 'select', options: ['Sent', 'Paid', 'Overdue'] },
      ]},
      { key: 'client_call', label: 'Client Call', color: '#a855f7', short: 'CC', fields: [
        { key: 'client', label: 'Client', field_type: 'text' },
        { key: 'agenda', label: 'Agenda', field_type: 'textarea' },
        { key: 'outcomes', label: 'Outcomes', field_type: 'textarea' },
        { key: 'next_steps', label: 'Next Steps', field_type: 'textarea' },
      ]},
    ],
  },
  {
    id: 'startup',
    name: 'Startup / Founder',
    description: 'Manage investor calls, sprints, hiring, and growth.',
    icon: 'Rocket',
    color: '#ff2d2d',
    work_types: [
      { key: 'investor_call', label: 'Investor Call', color: '#ffd60a', short: 'IC', fields: [
        { key: 'investor', label: 'Investor / Fund', field_type: 'text' },
        { key: 'stage', label: 'Stage', field_type: 'select', options: ['Cold outreach', 'First call', 'Deep dive', 'Term sheet', 'Passed'] },
        { key: 'outcome', label: 'Outcome', field_type: 'textarea' },
        { key: 'follow_up', label: 'Follow-up', field_type: 'textarea' },
      ]},
      { key: 'product_sprint', label: 'Product Sprint', color: '#39ff14', short: 'PS', fields: [
        { key: 'sprint_goal', label: 'Sprint Goal', field_type: 'text' },
        { key: 'completed', label: 'Completed', field_type: 'textarea' },
        { key: 'blockers', label: 'Blockers', field_type: 'textarea' },
      ]},
      { key: 'hiring', label: 'Hiring Interview', color: '#4da6ff', short: 'HI', fields: [
        { key: 'candidate', label: 'Candidate', field_type: 'text' },
        { key: 'role', label: 'Role', field_type: 'text' },
        { key: 'verdict', label: 'Verdict', field_type: 'select', options: ['Strong Yes', 'Yes', 'No', 'Strong No'] },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
    ],
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Track shoots, edits, client deliverables, and gear.',
    icon: 'Camera',
    color: '#e040fb',
    work_types: [
      { key: 'shoot', label: 'Shoot', color: '#e040fb', short: 'SH', fields: [
        { key: 'client', label: 'Client', field_type: 'text' },
        { key: 'location', label: 'Location', field_type: 'text' },
        { key: 'type', label: 'Type', field_type: 'select', options: ['Portrait', 'Wedding', 'Event', 'Commercial', 'Street'] },
        { key: 'photos_taken', label: 'Photos Taken', field_type: 'number' },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'edit', label: 'Edit Session', color: '#4da6ff', short: 'ED', fields: [
        { key: 'project', label: 'Project', field_type: 'text' },
        { key: 'photos_edited', label: 'Photos Edited', field_type: 'number' },
        { key: 'hours', label: 'Hours', field_type: 'number' },
        { key: 'delivered', label: 'Delivered?', field_type: 'select', options: ['Yes', 'No', 'Partial'] },
      ]},
    ],
  },
  {
    id: 'musician',
    name: 'Musician',
    description: 'Track recording sessions, mixes, live shows, and songwriting.',
    icon: 'Music',
    color: '#ffd60a',
    work_types: [
      { key: 'recording', label: 'Recording Session', color: '#ffd60a', short: 'RS', fields: [
        { key: 'track', label: 'Track Name', field_type: 'text' },
        { key: 'studio', label: 'Studio', field_type: 'text' },
        { key: 'hours', label: 'Hours', field_type: 'number' },
        { key: 'status', label: 'Status', field_type: 'select', options: ['Demo', 'Tracking', 'Mix', 'Master', 'Released'] },
        { key: 'notes', label: 'Notes', field_type: 'textarea' },
      ]},
      { key: 'live_show', label: 'Live Show', color: '#ff2d2d', short: 'LS', fields: [
        { key: 'venue', label: 'Venue', field_type: 'text' },
        { key: 'setlist', label: 'Setlist', field_type: 'textarea' },
        { key: 'attendance', label: 'Attendance', field_type: 'number' },
        { key: 'fee', label: 'Fee', field_type: 'number' },
      ]},
      { key: 'songwriting', label: 'Songwriting', color: '#39ff14', short: 'SW', fields: [
        { key: 'title', label: 'Working Title', field_type: 'text' },
        { key: 'lyrics_draft', label: 'Lyrics Draft', field_type: 'textarea' },
        { key: 'chords', label: 'Chords / Progression', field_type: 'text' },
      ]},
    ],
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Start from scratch — define your own work types.',
    icon: 'FolderOpen',
    color: '#7a7a7a',
    work_types: [],
  },
];

export const ICON_OPTIONS = [
  'Briefcase', 'GraduationCap', 'Laptop', 'Rocket', 'Camera', 'Music',
  'Heart', 'Star', 'Zap', 'Globe', 'Book', 'Code2', 'Dumbbell',
  'Palette', 'Film', 'Mic', 'Trophy', 'Building2', 'Plane', 'Leaf',
  'FolderOpen', 'Target', 'Activity', 'PenTool', 'Users',
];

export const COLOR_OPTIONS = [
  '#39ff14', '#ffd60a', '#ff9f43', '#4da6ff', '#a855f7',
  '#ff2d2d', '#06d6a0', '#e040fb', '#40c4ff', '#ff6b6b',
  '#7a7a7a', '#f97316', '#84cc16', '#14b8a6', '#8b5cf6',
];