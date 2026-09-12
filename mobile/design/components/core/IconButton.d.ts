/**
 * @startingPoint section="Core" subtitle="Circular icon-only button — back/close/social auth" viewport="700x120"
 */
export interface IconButtonProps {
  children: React.ReactNode;
  tone?: "neutral" | "accent";
  size?: number;
  onClick?: () => void;
  ariaLabel?: string;
}
