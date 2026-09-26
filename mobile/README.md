# Pace (mobile)

Expo Router + React Native + TypeScript build of the Pace app, ported from
the Claude Design mockup at `../Pace App.dc.html` (colors, type, spacing,
and copy all sourced from that file's design-system tokens).

There is no backend yet — everything is stored on the phone. What's waiting
on one (starting with photo verification) is listed in
[`../docs/backend-todo.md`](../docs/backend-todo.md).

## Stack

- Expo SDK 57, Expo Router (file-based navigation)
- TypeScript (strict)
- `react-native-svg` for icons (ported from `../assets/icons/*.svg`)
- `@expo-google-fonts/*` for Anton / Archivo / JetBrains Mono, matching the
  design system's font tokens

## Structure

```
app/
  _layout.tsx           root stack (fonts, theme, modal routes)
  (tabs)/
    _layout.tsx          tab bar (Discover, Activity, Chat, Planner, Profile)
    index.tsx            Discover
    feed.tsx             Activity feed
    chat.tsx             Chat list
    planner.tsx          Session planner
    profile.tsx          Profile
  athlete/[id].tsx        match detail (modal)
  thread/[athleteId].tsx  chat thread (modal)
src/
  components/            Icon, PhotoSlot, and the small Badge/Chip/Button/
                          Input/IconButton kit ported from the design system
  data/mockData.ts        the same mock athletes/threads/feed/sessions data
                          the .dc.html mockup used
  theme/tokens.ts          colors, fonts, spacing, radii
```

`PhotoSlot` stands in for the mockup's `<image-slot>` placeholders. It
renders a real `<Image>` when given a `source` (see `src/data/photos.ts`,
which maps mock athletes to the stock photos under `public/images`),
falling back to a tile with the subject's initial otherwise.

## Run it

```
cd mobile
npm install   # already run
npm run ios       # or android / web
```

Requires the Expo Go app or a simulator; `npm run web` works with no
extra setup for a quick look.
