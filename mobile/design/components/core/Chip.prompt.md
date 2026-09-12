Selectable pill used for sport/discipline pickers, training windows, city selection — the onboarding flow's primary input pattern.

```jsx
<Chip selected={sports.includes("running")} onClick={() => toggle("running")}>Running</Chip>
```

Default: ash-ish coal bg, hairline border, fog text. Selected: solid ember bg, ink text, bold. Optional leading `icon` node.
