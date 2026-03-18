/**
 * uploadImage.js  –  helper to upload a File to Firebase Storage
 * Returns the download URL (string)
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export async function uploadImage(file, path) {
  if (!file) return null;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}
