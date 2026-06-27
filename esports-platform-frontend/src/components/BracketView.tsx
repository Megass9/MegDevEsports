import { Link } from 'react-router-dom';
import type { Bracket, BracketMatch } from '../types';

const MATCH_WIDTH = 220;
const MATCH_HEIGHT = 80;
const ROUND_GAP = 60;

function BracketMatchCard({ match, roundIndex, matchIndex, totalRounds }: {
  match: BracketMatch;
  roundIndex: number;
  matchIndex: number;
  totalRounds: number;
}) {
  const isLastRound = roundIndex === totalRounds - 1;
  const score1 = match.scores?.team1;
  const score2 = match.scores?.team2;
  const winnerId = match.winner?.id;

  return (
    <Link
      to={`/matches/${match.match_id}`}
      className={`block p-3 border rounded-lg transition-all hover:border-valorant/50 min-w-[${MATCH_WIDTH}px] ${
        match.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
        match.status === 'ongoing' ? 'border-blue-500/30 bg-blue-500/5 animate-pulse' :
        match.status === 'disputed' ? 'border-red-500/30 bg-red-500/5' :
        'border-gray-700 bg-surface-400'
      }`}
      style={{ minWidth: MATCH_WIDTH }}
    >
      <div className={`flex items-center justify-between py-1.5 px-2 rounded ${match.team1 ? (winnerId === match.team1.id ? 'bg-green-500/10' : '') : ''}`}>
        <span className={`text-sm font-medium truncate flex-1 ${match.team1 ? 'text-white' : 'text-gray-600'}`}>
          {match.team1?.name || 'TBD'}
        </span>
        {score1 !== null && <span className={`text-sm font-bold ml-2 ${match.team1 && winnerId === match.team1.id ? 'text-green-400' : 'text-gray-400'}`}>{score1}</span>}
      </div>
      <div className="border-t border-gray-700/50 my-1" />
      <div className={`flex items-center justify-between py-1.5 px-2 rounded ${match.team2 ? (winnerId === match.team2.id ? 'bg-green-500/10' : '') : ''}`}>
        <span className={`text-sm font-medium truncate flex-1 ${match.team2 ? 'text-white' : 'text-gray-600'}`}>
          {match.team2?.name || 'TBD'}
        </span>
        {score2 !== null && <span className={`text-sm font-bold ml-2 ${match.team2 && winnerId === match.team2.id ? 'text-green-400' : 'text-gray-400'}`}>{score2}</span>}
      </div>
      {isLastRound && match.status !== 'completed' && (
        <div className="text-center mt-2">
          <span className="text-[10px] text-yellow-500 font-medium">🏆 Final</span>
        </div>
      )}
    </Link>
  );
}

function BracketConnectors({ roundIndex, matchCount, nextMatchCount }: { roundIndex: number; matchCount: number; nextMatchCount: number }) {
  if (roundIndex === 0) return null;
  const height = 120 + (Math.pow(2, roundIndex - 1) - 1) * 80;
  return null;
}

export default function BracketView({ bracket, tournamentId }: { bracket: Bracket; tournamentId: number }) {
  if (!bracket?.rounds?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Bracket oluşturulmamış.
      </div>
    );
  }

  const totalRounds = bracket.total_rounds || bracket.rounds.length;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max" style={{ gap: ROUND_GAP }}>
        {bracket.rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col" style={{ gap: 0 }}>
            <div className="text-center text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">
              {ri === totalRounds - 1 ? 'Final' : ri === totalRounds - 2 ? 'Yarı Final' : `Round ${ri + 1}`}
            </div>
            {round.matches.map((match, mi) => (
              <div
                key={match.match_id}
                className="flex items-center"
                style={{
                  height: `${MATCH_HEIGHT}px`,
                  marginTop: mi > 0 ? `${Math.pow(2, ri) * 40 - MATCH_HEIGHT / 2}px` : '0',
                }}
              >
                <BracketMatchCard
                  match={match}
                  roundIndex={ri}
                  matchIndex={mi}
                  totalRounds={totalRounds}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
