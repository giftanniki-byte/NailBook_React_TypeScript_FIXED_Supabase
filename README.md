# NailBook — React + TypeScript

This is the cleaned-up React + TypeScript version of the NailBook project. The old HTML pages were turned into reusable React pages and components instead of keeping one large file for every screen.

## Run the project

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## Supabase setup

1. Create a `.env.local` file from `.env.example`.
2. Add your Supabase URL and publishable/anon key.
3. Run `nailbook.sql` in the Supabase SQL editor.
4. Enable the authentication options you want in Supabase.

The browser only needs the public/publishable key. Do not put a `service_role` key in `.env.local`.

## Main routes

- `/` — Home
- `/artists` — Find Artist
- `/artist/:id` — Artist profile
- `/login` — Account selection
- `/login/client` — Client login
- `/login/artist` — Artist login
- `/signup` — Account selection
- `/signup/client` — Client signup
- `/signup/artist` — Artist signup
- `/dashboard/client` — Client dashboard
- `/dashboard/artist` — Artist dashboard
- `/contact` — Contact
- `/help` — Help & Support

The code is deliberately split into small files so it is easier to edit later.

## Supabase artist directory

The Find Artist page reads from `v_artist_directory` rather than selecting artist-specific
fields from `profiles`. In the NailBook schema, `profiles` contains account fields such as
`user_id`, `role`, `full_name`, `email`, `phone`, and `city`. Artist-specific fields live in
`artist_profiles`, while services are linked through `artist_services` and `services`.

If the database has not been set up yet, run the supplied `nailbook.sql` in the Supabase SQL Editor.
