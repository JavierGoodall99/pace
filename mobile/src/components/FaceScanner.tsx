import { StyleSheet } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { Camera, type Face } from 'react-native-vision-camera-face-detector';
import type { FaceReading } from '../data/liveness';

export const scannerSupported = true;

export function useScannerPermission() {
  return useCameraPermission();
}

function toReading(face: Face): FaceReading {
  return {
    trackingId: face.trackingId,
    leftEyeOpen: face.leftEyeOpenProbability,
    rightEyeOpen: face.rightEyeOpenProbability,
    smiling: face.smilingProbability,
    yaw: face.yawAngle,
  };
}

// Live front-camera preview that streams ML Kit face readings.
export function FaceScanner({
  active,
  onFaces,
  onError,
}: {
  active: boolean;
  onFaces: (faces: FaceReading[]) => void;
  onError: (error: Error) => void;
}) {
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device="front"
      isActive={active}
      resizeMode="cover"
      performanceMode="fast"
      runClassifications
      trackingEnabled
      minFaceSize={0.25}
      onFacesDetected={(faces) => onFaces(faces.map(toReading))}
      onError={onError}
    />
  );
}
