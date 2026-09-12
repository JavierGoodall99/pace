/**
 * @startingPoint section="Core" subtitle="Pill text field — email, phone, name" viewport="700x120"
 */
export interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  type?: string;
}
