import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { countFaces } from './photoFaces';

// The image picker hands back files in a temporary cache the OS may clear
// at any time, so a saved profile photo could vanish. Copy each picked
// image into the app's document folder and store that uri instead. Web
// has no file system: picked images there are blob/data uris, kept as is.

const DIR_NAME = 'photos';

function photoDir(): Directory {
  const dir = new Directory(Paths.document, DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function extensionOf(uri: string): string {
  const match = /\.(jpe?g|png|heic|webp|gif)(\?|$)/i.exec(uri);
  return match ? match[1].toLowerCase() : 'jpg';
}

export function isKept(uri: string): boolean {
  return uri.includes(`/${DIR_NAME}/`) && uri.startsWith(Paths.document.uri);
}

// Returns a uri that survives cache clears. Falls back to the original
// uri if the copy fails, so picking never breaks.
export function keepPhoto(uri: string): string {
  if (Platform.OS === 'web' || isKept(uri)) return uri;
  try {
    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(uri)}`;
    const dest = new File(photoDir(), name);
    new File(uri).copySync(dest);
    return dest.uri;
  } catch (e) {
    console.warn('Could not keep photo, using the picker copy:', e);
    return uri;
  }
}

export function keepPhotos(uris: string[]): string[] {
  return uris.map(keepPhoto);
}

// Frees the stored copy once a photo is no longer used.
export function forgetPhoto(uri: string) {
  if (Platform.OS === 'web' || !isKept(uri)) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Already gone.
  }
}

// Keeps each picked photo and counts the faces in it (see photoFaces.ts).
export function keepAndCheck(uris: string[]): { uri: string; faces: number | null }[] {
  return keepPhotos(uris).map((uri) => ({ uri, faces: countFaces(uri) }));
}
