export async function fetchSpotifyAPI({
    token,
    endpoint,
    method = "GET",
  }: {
    token: string;
    endpoint: string;
    method?: string;
  }) {
    return fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
    }).then((res) => res.json());
  }
  