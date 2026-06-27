export interface User {
  id: number;
  name: string;
  email: string;
  role: 'player' | 'team_captain' | 'admin';
  role_label: string;
  avatar: string | null;
  avatar_url: string;
  riot_id: string | null;
  is_banned: boolean;
  email_verified: boolean;
  last_active_at: string | null;
  created_at: string;
  teams?: Team[];
  team_memberships?: Team[];
  pivot?: { is_substitute: boolean; team_id: number };
}

export interface Team {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  logo: string | null;
  logo_url: string | null;
  captain_id: number;
  captain: User;
  game: string;
  is_active: boolean;
  total_wins: number;
  total_losses: number;
  total_matches: number;
  win_rate: number;
  points: number;
  members?: User[];
  members_count?: number;
  matches?: Match[];
  created_at: string;
  pivot?: { is_substitute: boolean };
}

export interface Tournament {
  id: number;
  name: string;
  description: string | null;
  game: string;
  type: string;
  status: 'pending' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  max_teams: number;
  entry_fee: number;
  prize_pool: number;
  prize_description: string | null;
  start_date: string;
  registration_end_date: string | null;
  bracket_json: any;
  winner_id: number | null;
  winner: Team | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  completed_at: string | null;
  participants?: Team[];
  participants_count?: number;
  matches?: Match[];
  rewards?: Reward[];
  chat_rooms?: any[];
  created_at: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  tournament: Tournament;
  round: number;
  match_number: number;
  team1_id: number | null;
  team1: Team | null;
  team2_id: number | null;
  team2: Team | null;
  winner_id: number | null;
  winner: Team | null;
  status: 'scheduled' | 'ongoing' | 'awaiting_confirmation' | 'confirmed' | 'disputed' | 'completed';
  scheduled_at: string | null;
  played_at: string | null;
  team1_score: number | null;
  team2_score: number | null;
  confirmed_by_team1: boolean;
  confirmed_by_team2: boolean;
  confirmed_at: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
  notes: string | null;
  results?: MatchResult[];
  created_at: string;
}

export interface MatchResult {
  id: number;
  match_id: number;
  team_id: number;
  submitted_by: number;
  submitter: User;
  score: number;
  screenshot: string | null;
  notes: string | null;
  type: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  user: User;
  team_id: number | null;
  type: 'global' | 'team' | 'admin';
  message: string;
  attachment: string | null;
  attachment_type: string | null;
  is_pinned: boolean;
  pinned_by: number | null;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Ranking {
  id: number;
  team_id: number;
  team: Team;
  season_id: number;
  season: Season;
  points: number;
  wins: number;
  losses: number;
  total_matches: number;
  win_rate: number;
  rank: number;
}

export interface Season {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

export interface Reward {
  id: number;
  tournament_id: number;
  tournament: Tournament;
  team_id: number;
  team: Team;
  rank: number;
  prize: string;
  description: string | null;
  approved_by: number | null;
  approver: User | null;
  approved_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  team: Team;
  user_id: number;
  user: User;
  invited_by: number;
  inviter: User;
  status: 'pending' | 'accepted' | 'declined';
  expires_at: string;
  responded_at: string | null;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_teams: number;
  active_tournaments: number;
  completed_tournaments: number;
  total_matches: number;
  pending_matches: number;
  banned_users: number;
}

export interface Bracket {
  rounds: BracketRound[];
  total_rounds: number;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface BracketMatch {
  match_id: number;
  round: number;
  match_number: number;
  team1: { id: number; name: string } | null;
  team2: { id: number; name: string } | null;
  winner: { id: number; name: string } | null;
  status: string;
  scores: { team1: number | null; team2: number | null };
}
