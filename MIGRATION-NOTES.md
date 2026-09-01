# Migration notes

The old project used separate HTML pages with large inline style/script sections. This version keeps the same core NailBook flow but moves repeated work into reusable React components.

- `components/Layout.tsx` contains the shared navigation and footer.
- `components/ArtistCard.tsx` contains the repeated artist card.
- `lib/auth.ts` contains the Supabase authentication helpers.
- `lib/artists.ts` handles the artist list and demo fallback.
- `pages/` contains the screens.
- `styles.css` contains the shared responsive styling.
- `legacy/` contains the original files for reference.

The demo artist records use Unsplash images so the project has usable visuals without a local assets folder.
