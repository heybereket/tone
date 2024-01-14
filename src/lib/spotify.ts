export async function fetchSpotifyAPI({
  token,
  endpoint,
}: {
  token: string;
  endpoint: string;
}) {
  return fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
}
