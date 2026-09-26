import type { FaceReading } from '../data/liveness';

// The selfie check needs the native camera + ML Kit; web can't run it.
export const scannerSupported = false;

export function useScannerPermission() {
  return {
    hasPermission: false,
    canRequestPermission: false,
    requestPermission: async () => false,
  };
}

export function FaceScanner(_: {
  active: boolean;
  onFaces: (faces: FaceReading[]) => void;
  onError: (error: Error) => void;
}) {
  return null;
}
