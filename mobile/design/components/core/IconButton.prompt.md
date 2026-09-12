Circular icon-only control for back chevrons, close buttons, social auth (Apple/Google) and swipe-stack pass/like actions.

```jsx
<IconButton ariaLabel="Go back" tone="neutral"><ChevronLeftIcon/></IconButton>
<IconButton ariaLabel="Like" tone="accent"><HeartIcon/></IconButton>
```

Pass any 20–24px glyph as children (use `assets/icons/*.svg`). `tone="accent"` for ember-branded actions (like, verified), `neutral` for everything else.
