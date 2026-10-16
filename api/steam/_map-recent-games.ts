interface SteamGameInput {
  appid?: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever?: number;
  rtime_last_played?: number;
  img_icon_url?: string;
}

export function buildSteamIconUrl(
  appid: number | string | null | undefined,
  imgIconUrl: string | null | undefined,
) {
  if (!appid || !imgIconUrl) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${imgIconUrl}.jpg`;
}

export function mapSteamGame(game: SteamGameInput | null | undefined) {
  const appid = game?.appid;
  const name = game?.name ?? '';
  if (!appid || !name) return null;

  const lastPlayedAt =
    typeof game?.rtime_last_played === 'number' && game.rtime_last_played > 0
      ? new Date(game.rtime_last_played * 1000).toISOString()
      : null;

  return {
    appid,
    name,
    playtimeMinutes: game?.playtime_forever ?? game?.playtime_2weeks ?? 0,
    lastPlayedAt,
    storeUrl: `https://store.steampowered.com/app/${appid}`,
    iconUrl: buildSteamIconUrl(appid, game?.img_icon_url),
  };
}

function hasBeenPlayed(game: SteamGameInput) {
  return (game?.rtime_last_played ?? 0) > 0 || (game?.playtime_forever ?? 0) > 0 || (game?.playtime_2weeks ?? 0) > 0;
}

export function getRecentGamesFromOwned(ownedGames: SteamGameInput[], limit: number) {
  const recent = ownedGames.filter(hasBeenPlayed);
  const hasLastPlayed = recent.some((game) => (game?.rtime_last_played ?? 0) > 0);

  if (hasLastPlayed) {
    recent.sort((a, b) => (b?.rtime_last_played ?? 0) - (a?.rtime_last_played ?? 0));
  } else {
    recent.sort(
      (a, b) =>
        (b?.playtime_forever ?? b?.playtime_2weeks ?? 0) - (a?.playtime_forever ?? a?.playtime_2weeks ?? 0),
    );
  }

  return recent.slice(0, limit).map(mapSteamGame).filter((game): game is NonNullable<typeof game> => Boolean(game));
}

export function getSteamGamesNote(games: unknown[]) {
  if (games.length > 0) return null;

  return 'No recent games yet. Make sure Game details is set to Public on your Steam profile.';
}

export function clampRequestLimit(limit: unknown, defaultLimit = 3, max = 50) {
  return Math.min(Math.max(Number(limit) || defaultLimit, 1), max);
}
