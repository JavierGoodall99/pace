/**
 * @startingPoint section="Core" subtitle="Circular grayscale profile photo, stackable" viewport="700x110"
 */
export interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  ring?: boolean;
  /** negative-margins left for a stacked/overlapping cluster */
  overlap?: boolean;
}
