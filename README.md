# OG Cine Matrix 🎬

> A movies and anime discovery app — watch trailers, read reviews, and find out exactly where a title is streaming.

<!-- Drop a screenshot or GIF of the app here -->

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## About

Searching for something to watch usually means jumping between three or four sites — one for the trailer, one for reviews, another to figure out which service actually has it. This app puts all of that on a single page.

Search any movie or anime and you get the trailer, the ratings and reviews, and a list of the platforms streaming it in your region.

## Features

- 🔍 **Search** movies and anime by title
- ▶️ **Trailers** embedded and playable in-app
- ⭐ **Ratings & reviews** pulled in for each title
- 📺 **Where to watch** — streaming, rent, and buy options by platform
- 🎞️ **Details** — synopsis, cast, genre, release year, runtime
- 📱 **Responsive** layout that works on phone and desktop

## Tech Stack

| Layer | Used |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Data | TMDB API (movies, trailers, watch providers) |
| Anime data | Jikan / MyAnimeList API |
| AI | Google Gemini API |

<!-- Trim this table to whatever you actually used -->

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_TMDB_API_KEY=your_tmdb_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
```

Get a TMDB key free at [themoviedb.org](https://www.themoviedb.org/settings/api) and a Gemini key at [Google AI Studio](https://aistudio.google.com/app/apikey).

> ⚠️ Never commit your `.env` file. Make sure `.env` is listed in `.gitignore`.

### Run it

```bash
npm run dev
```

The app will be live at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # UI components (SearchBar, MovieCard, TrailerModal...)
├── pages/          # Page-level views
├── services/       # API calls (TMDB, anime, Gemini)
├── hooks/          # Custom React hooks
├── assets/         # Images and icons
└── App.jsx
```

## Roadmap

- [ ] User accounts and a personal watchlist
- [ ] Filter by genre, year, and rating
- [ ] Recommendations based on what you've watched
- [ ] Dark / light theme toggle
- [ ] Region selector for accurate streaming availability

## Contributing

Pull requests are welcome. For a big change, open an issue first so we can talk it through.

1. Fork the repo
2. Create your branch (`git checkout -b feature/thing`)
3. Commit your changes (`git commit -m 'Add thing'`)
4. Push the branch (`git push origin feature/thing`)
5. Open a Pull Request

## Acknowledgements

- [TMDB](https://www.themoviedb.org/) for movie data and trailers — this product uses the TMDB API but is not endorsed or certified by TMDB
- [Jikan API](https://jikan.moe/) for anime data
- Built with [Google AI Studio](https://aistudio.google.com/)

## License

Distributed under the MIT License. See `LICENSE` for details.

Website link - https://ogcinematrix.netlify.app/

---

Built by [Anubhab Karmakar](https://github.com/<your-username>)
