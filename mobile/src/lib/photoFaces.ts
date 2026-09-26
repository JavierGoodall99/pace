import {
  createImageFaceDetector,
  type ImageFaceDetector,
} from 'react-native-vision-camera-face-detector';

// Counts faces in a picked photo with ML Kit, on the phone. Used to make
// sure profile photos actually show a person, so a card can't be built
// from objects, scenery or screenshots. It can't tell *whose* face it is
// or whether the photo was downloaded or AI-made — that needs a server
// check (see liveness.ts).

let detector: ImageFaceDetector | null = null;

// Number of faces, or null when the photo couldn't be checked.
export function countFaces(uri: string): number | null {
  try {
    detector ??= createImageFaceDetector({ performanceMode: 'accurate', minFaceSize: 0.1 });
    return detector.detectFaces(uri).length;
  } catch (e) {
    console.warn('Face check failed:', e);
    return null;
  }
}
