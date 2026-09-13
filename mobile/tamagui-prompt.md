# Tamagui Project Config — Pace (mobile)

Generated for agent reference from `tamagui.config.ts` (sources: `src/theme/tokens.ts` + `@tamagui/config/v4` `defaultConfig`). The `npx tamagui generate-prompt` CLI is not installed in this project; this file was written from the live config values.

## Config file

- `mobile/tamagui.config.ts` — `createTamagui({ ...defaultConfig, tokens, fonts, themes })`
- Design-token source of truth: `mobile/src/theme/tokens.ts`

## Critical setting: `onlyAllowShorthands: true`

The v4 `defaultConfig.settings` used by this project sets `onlyAllowShorthands: true`. Consequences:

- Longhand style props **with a shorthand are NOT typed as props** — `alignItems` → `items`, `justifyContent` → `justify`, `backgroundColor` → `bg`, `borderRadius` → `rounded`, `paddingHorizontal` → `px`, `paddingVertical` → `py`, `marginHorizontal` → `mx`, `marginVertical` → `my`, `marginTop` → `mt`, `minWidth` → `minW`, `maxWidth` → `maxW`, `minHeight` → `minH`, `maxHeight` → `maxH`, `textAlign` → `text`, `top/left/right/bottom` → `t/l/r/b`, `zIndex` → `z`, `flexGrow`/`flexShrink` → `grow`/`shrink`, `alignSelf` → `self`, `alignContent` → `content`.
- Props WITHOUT a shorthand still work as normal props: `width`, `height`, `gap`, `flex`, `flexDirection`, `flexWrap`, `borderWidth`, `borderColor`, `borderBottomWidth/Color`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`, `color`, `fontFamily`, `opacity`, `overflow`, `shadowColor/Opacity/Radius/Offset`, `elevation`.
- Alternatives: pass full longhand styles inside the `style` prop (with hex values, not `$` tokens), or put `$`-token styles in shorthand props.

## Shorthands (exact map from config)

```
text → textAlign      b → bottom        bg → backgroundColor   content → alignContent
grow → flexGrow       items → alignItems justify → justifyContent  l → left
m → margin            maxH → maxHeight  maxW → maxWidth        mb → marginBottom
minH → minHeight      minW → minWidth   ml → marginLeft        mr → marginRight
mt → marginTop        mx → marginHorizontal  my → marginVertical
p → padding           pb → paddingBottom pl → paddingLeft      pr → paddingRight
pt → paddingTop       px → paddingHorizontal  py → paddingVertical
r → right             rounded → borderRadius  select → userSelect
self → alignSelf      shrink → flexShrink t → top               z → zIndex
```

## Tokens

### Color — NOT a token category in this config

Colors are **theme keys**, not `tokens.color` (v4 moved colors into themes). Reference as `$ember`, `$coal`, … — resolution goes through the theme system.

Brand palette (from `src/theme/tokens.ts`, exposed as dark-theme keys):

| Key | Value | Key | Value |
|---|---|---|---|
| `$ink` | `#0a0a0d` | `$fog` | `#8f8d97` |
| `$coal` | `#0f0f14` | `$line` | `rgba(244,241,234,0.09)` |
| `$ash` | `#15151c` | `$lineHover` | `rgba(244,241,234,0.25)` |
| `$ember` | `#ff4d2e` | `$emberSoft` | `rgba(255,77,46,0.08)` |
| `$flare` | `#ff8a6b` | `$emberBorder` | `rgba(255,77,46,0.3)` |
| `$bone` | `#f4f1ea` | `$mint` | `#3ddc84` |

### radius (v4 defaults + app extras)

`0–12`, `true` (= 9) plus app tokens: `full` 9999, `3xl` 24, `2xl` 16, `lg` 8. Usage: `rounded="$full"`, `rounded={16}`, `rounded={20}`.

### space

v4 `$0`–`$20` scale + `$true`, plus app tokens: `gutter` 20, `safeAreaBottom` 34.

### size

v4 `$0`–`$20` scale.

### zIndex

v4 default scale (`0`–`5`); use `z` shorthand.

## Fonts

| Token | Family | Faces |
|---|---|---|
| `$display` | `Anton_400Regular` | 400 |
| `$body` | `Archivo_400Regular` | 400, 600 (`Archivo_600SemiBold`) |
| `$mono` | `JetBrainsMono_400Regular` | 400, 700 (`JetBrainsMono_700Bold`) |
| `$heading` | v4 default heading (system) — kept as-is | — |

Weight switching: `fontFamily="$mono" fontWeight="700"` resolves via the font's `face` map to the bold family. There is no `$monoBold` token.

## Themes

- **`dark`** (default — set via `TamaguiProvider defaultTheme="dark"`) — built from `defaultConfig.themes.dark` with semantic roles overridden to the app palette and brand keys added (list above).
- Semantic overrides: `background`=`$ink`, `color`=`$bone`, `borderColor`=`$line`, `borderColorHover/Press/Focus`=`$lineHover`, `backgroundHover/Press`=`$ash`, `backgroundFocus`=`$coal`, `placeholderColor`=`$fog`, `outlineColor`=`$lineHover`, `accentBackground`=`$ember`, `accentColor`=`$bone`, `shadowColor`=`#000000`.
- `light` + 292 derived component themes remain from `@tamagui/config/v4` defaults (unused by the app).

## Media queries (v4 defaults)

| Name | Rule | | Name | Rule |
|---|---|---|---|---|
| `2xs` | minWidth 340 | | `max2xs` | maxWidth 340 |
| `xs` | minWidth 460 | | `maxXs` | maxWidth 460 |
| `sm` | minWidth 640 | | `maxSm` | maxWidth 640 |
| `md` | minWidth 768 | | `maxMd` | maxWidth 768 |
| `lg` | minWidth 1024 | | `maxLg` | maxWidth 1024 |
| `xl` | minWidth 1280 | | `maxXl` | maxWidth 1280 |
| `2xl` | minWidth 1536 | | `max2Xl` | maxWidth 1536 |

Usage: `$gtSm={{ ... }}` etc. (this config registers min-width keys; promote base props first, responsive overrides after).

## Animations

`defaultConfig.animations` (CSS-style easing map, cross-platform via native fallback) is active: names `0ms, 30ms, 50ms, 75ms, 100ms, 200ms, 250ms, 300ms, 400ms, 500ms, superBouncy, bouncy, kindaBouncy, superLazy, lazy, medium, slowest, slow, quick, quickLessBouncy, tooltip, quicker, quickerLessBouncy, quickest, quickestLessBouncy`.

Usage: the `transition` prop (there is **no** `animation` prop), e.g. `transition="quick"`, `enterStyle={{ opacity: 0 }}`, `exitStyle={{ opacity: 0 }}` — exits require an `AnimatePresence` parent and a `key`. Spring physics is NOT supported by this driver (easing strings only).

## Components / patterns in use

- Primitives: `XStack` (row), `YStack` (column), `Text` (SizableText, defaults to `$body`), `ScrollView` (contentContainerStyle accepts shorthand keys: `{ pt: … }`), `Image` (RN), `Switch` (`checked`/`onCheckedChange`, track styled via `backgroundColor`/`borderColor`, thumb via `<Switch.Thumb backgroundColor="…" />`), `Input` (used `unstyled` + explicit styles).
- Shared design-system kit (custom, not preset components): `src/components/ui.tsx` — `Badge, Chip, Button, IconButton, Input, SegmentedControl, ProgressBar, ToggleRow, ScreenHeading` (+ `ActivityPanel`, `PhotoSlot`, `Confetti`, `Icon` (svg)).
- Custom brand colors are passed with `$` shorthand props: `bg="$emberSoft"`, `borderColor="$emberBorder"`, `color="$bone"`, `fontFamily="$mono"`.
- Animations in this app mostly use RN `Animated` directly (onboarding choreography, toast, confetti, discover swipe) — kept as-is; those wrappers take plain hex ViewStyle objects, not `$` tokens.