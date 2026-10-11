export function buildSteamIconUrl(appid, imgIconUrl) {
  if (!appid || !imgIconUrl) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${imgIconUrl}.jpg`;
}

export function mapSteamGame(game) {
  const appid = game?.appid;
  const name = game?.name ?? '';
  if (!appid || !name) return null;

  const lastPlayedAt =
    typeof game?.rtime_last_played === 'number' && game.rtime_last_played > 0
      ? new Date(game.rtime_last_played * 1000).toISOString()
      : null;

  return {
    name,
    playtimeMinutes: game?.playtime_2weeks ?? 0,
    lastPlayedAt,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
    iconUrl: buildSteamIconUrl(appid, game?.img_icon_url),
  };
}

export function getRecentGamesFromOwned(ownedGames, limit) {
  const recent = ownedGames.filter((game) => (game?.playtime_2weeks ?? 0) > 0);
  const hasLastPlayed = recent.some((game) => (game?.rtime_last_played ?? 0) > 0);

  if (hasLastPlayed) {
    recent.sort((a, b) => (b?.rtime_last_played ?? 0) - (a?.rtime_last_played ?? 0));
  } else {
    recent.sort((a, b) => (b?.playtime_2weeks ?? 0) - (a?.playtime_2weeks ?? 0));
  }

  return recent.slice(0, limit).map(mapSteamGame).filter(Boolean);
}

export function getSteamGamesNote(games) {
  if (games.length > 0) return null;

  return 'No games played in the last 2 weeks. Make sure Game details is set to Public on your Steam profile.';
}

export function clampRequestLimit(limit, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}
