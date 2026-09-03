# RYANTV — Web TV frontend

This branch adds a simple static Web TV UI that reads the M3U playlist stored in the repository and provides a browser player.

Files added:
- `index.html` — frontend UI
- `style.css` — basic styling, responsive
- `app.js` — loads and parses the M3U playlist, renders channels, playback

How to test locally

1. Clone the repo and checkout the branch `web-tv-ui`:

   git clone https://github.com/RYANTVv3/Bmtvniryan.git
   cd Bmtvniryan
   git checkout web-tv-ui

2. Run a simple static server in the repository root. Example (Python 3):

   python3 -m http.server 8000

3. Open http://localhost:8000 in your browser. The app will fetch the playlist from:

   https://raw.githubusercontent.com/RYANTVv3/Bmtvniryan/main/Bmtvniryan

Notes & limitations

- The app uses the raw GitHub URL to fetch the playlist. If you want to serve a different playlist file in the repo, update the RAW_PL constant in `app.js`.
- Not all stream URLs are playable directly in browsers (e.g., MKV or some remote servers). The "Open in new tab" link lets you open the source directly or use an external player.
- If you want me to open a Pull Request to merge this branch into `main`, tell me and I will provide the PR link instruction. I cannot create the PR automatically from this toolset.

Next steps I can take for you (pick any):
- Open a PR (I'll give you the exact command/link to create it) or give step-by-step to create one yourself.
- Deploy to GitHub Pages and provide the live URL.
- Add features: favorites, thumbnails, grouping UI improvements, performance for very large playlists.
