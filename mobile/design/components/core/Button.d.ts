/**
 * @startingPoint section="Core" subtitle="Pill CTA button — primary/secondary/ghost" viewport="700x160"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** primary = ember fill; secondary = bone (inverse) fill; ghost = outline only */
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  disabled?: boolean;
  onClick?: () => void;
}
