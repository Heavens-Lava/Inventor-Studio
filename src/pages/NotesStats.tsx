import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStorage } from '@/hooks/useNotesStorage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Star, TrendingUp, Book, Target } from 'lucide-react';
import {
  calculateNotePoints,
  calculateNotesLevel,
  getNextNotesLevelPoints,
  checkNotesBadgeEarned,
  NOTES_BADGES,
} from '@/lib/notesGamification';
import { NotesUserStats } from '@/types/note';

export default function NotesStats() {
  const navigate = useNavigate();
  const { notes, settings, isLoaded } = useNotesStorage();

  // Calculate user stats from notes
  const userStats: NotesUserStats = useMemo(() => {
    if (!settings.userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: NOTES_BADGES.map((b) => ({ ...b })),
        notesCreated: 0,
        totalWords: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
    const totalPoints = notes.reduce((sum, note) => sum + (note.points || 0), 0);
    const level = calculateNotesLevel(totalPoints);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;

    notes.forEach((note) => {
      if (note.streak) {
        currentStreak = Math.max(currentStreak, note.streak.currentStreak);
        longestStreak = Math.max(longestStreak, note.streak.longestStreak);
      }
    });

    // Update badge progress
    const badges = NOTES_BADGES.map((badge) => {
      const earned = checkNotesBadgeEarned(
        badge,
        {
          ...settings.userStats!,
          notesCreated: notes.length,
          totalWords,
          currentStreak,
          longestStreak,
          totalPoints,
        },
        notes
      );

      return {
        ...badge,
        earnedAt: earned ? badge.earnedAt || new Date() : undefined,
        progress: badge.id.includes('note') && badge.id !== 'long-note'
          ? notes.length
          : badge.id.includes('wordsmith')
          ? totalWords
          : badge.id.includes('streak')
          ? currentStreak
          : undefined,
      };
    });

    return {
      totalPoints,
      level,
      badges,
      notesCreated: notes.length,
      totalWords,
      currentStreak,
      longestStreak,
    };
  }, [notes, settings.userStats]);

  const nextLevelPoints = getNextNotesLevelPoints(userStats.level);
  const currentLevelMinPoints = userStats.level === 1 ? 0 : getNextNotesLevelPoints(userStats.level - 1);
  const levelProgress =
    ((userStats.totalPoints - currentLevelMinPoints) /
      (nextLevelPoints - currentLevelMinPoints)) *
    100;

  const earnedBadges = userStats.badges.filter((b) => b.earnedAt);
  const unearnedBadges = userStats.badges.filter((b) => !b.earnedAt);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/notes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
            <div>
              <h1 className="text-4xl font-bold">Writing Stats</h1>
              <p className="text-muted-foreground mt-1">
                Track your writing progress and achievements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
            <Trophy className="h-6 w-6" />
            <div className="text-left">
              <div className="text-2xl font-bold">Level {userStats.level}</div>
              <div className="text-xs opacity-90">
                {userStats.totalPoints} XP
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Level Progress
            </h2>
            <div className="text-sm text-muted-foreground">
              {userStats.totalPoints} / {nextLevelPoints} XP
            </div>
          </div>
          <Progress value={levelProgress} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {nextLevelPoints - userStats.totalPoints} XP until Level{' '}
            {userStats.level + 1}
          </p>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Total Notes</h3>
            </div>
            <p className="text-3xl font-bold">{userStats.notesCreated}</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Total Words</h3>
            </div>
            <p className="text-3xl font-bold">{userStats.totalWords.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="font-semibold text-gray-600">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold">{userStats.currentStreak} days</p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-600">Badges</h3>
            </div>
            <p className="text-3xl font-bold">
              {earnedBadges.length}/{userStats.badges.length}
            </p>
          </Card>
        </div>

        {/* Earned Badges */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </h2>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 border border-green-200 rounded-lg bg-green-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{badge.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        {badge.description}
                      </p>
                      {badge.earnedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Start writing to earn your first badge!
            </p>
          )}
        </Card>

        {/* Locked Badges */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gray-400" />
            Locked Badges ({unearnedBadges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl opacity-40">{badge.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {badge.description}
                    </p>
                    {badge.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>
                            {badge.progress} / {badge.requirement}
                          </span>
                        </div>
                        <Progress
                          value={(badge.progress / badge.requirement) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Writing Insights */}
        <Card className="p-6 mt-8 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Writing Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Average Words/Note</p>
              <p className="text-3xl font-bold text-blue-600">
                {notes.length > 0
                  ? Math.round(userStats.totalWords / notes.length)
                  : 0}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Longest Streak</p>
              <p className="text-3xl font-bold text-purple-600">
                {userStats.longestStreak} days
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Tagged Notes</p>
              <p className="text-3xl font-bold text-green-600">
                {notes.filter(n => n.tags && n.tags.length > 0).length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
