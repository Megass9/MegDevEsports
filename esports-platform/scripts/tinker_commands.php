$user = \App\Models\User::where('email', 'emre@admin.com')->first();
echo 'User: ' . $user->name . ' (ID: ' . $user->id . ')' . "\n";
$team = $user->teams()->first();
if (!$team) {
    $team = \App\Models\Team::create(['name' => 'Admin Test Takimi', 'captain_id' => $user->id, 'game' => 'valorant', 'description' => 'Test']);
    $team->members()->attach($user->id, ['role' => 'captain']);
    echo 'Team created: ' . $team->name . "\n";
} else {
    echo 'Existing team: ' . $team->name . "\n";
}
$tournament = \App\Models\Tournament::where('status', 'in_progress')->first();
if (!$tournament) { $tournament = \App\Models\Tournament::where('status', 'registration')->first(); }
echo 'Tournament: ' . $tournament->name . ' (Status: ' . $tournament->status . ')' . "\n";
if (!$tournament->participants()->where('team_id', $team->id)->exists()) {
    $tournament->participants()->attach($team->id);
    echo 'Team registered.' . "\n";
} else {
    echo 'Already registered.' . "\n";
}
if ($tournament->status === 'in_progress') {
    $matches = $tournament->matches()->where(function($q) use ($team) { $q->where('team1_id', $team->id)->orWhere('team2_id', $team->id); })->get();
    echo 'Matches: ' . $matches->count() . "\n";
    foreach ($matches as $m) { echo '  Match #' . $m->id . ': ' . ($m->team1->name ?? 'TBD') . ' vs ' . ($m->team2->name ?? 'TBD') . ' (' . $m->status . ')' . "\n"; }
}
