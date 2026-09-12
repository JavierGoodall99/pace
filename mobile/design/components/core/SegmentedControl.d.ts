/**
 * @startingPoint section="Core" subtitle="Single-select pill group — gender, cadence, terrain" viewport="700x120"
 */
export interface SegmentedControlProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}
