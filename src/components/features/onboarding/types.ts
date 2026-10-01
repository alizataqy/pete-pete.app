export interface TourStep {
  targetId: string;
  badge: string;
  title: string;
  description: string;
}

export interface SpotlightTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
}
