/**
 * @startingPoint section="Core" subtitle="Bento surface — ash fill or full-bleed media, hover edge-accent" viewport="700x260"
 */
export interface CardProps {
  children: React.ReactNode;
  /** true = transparent, expects a full-bleed image + gradient overlay as children */
  media?: boolean;
  style?: React.CSSProperties;
}
