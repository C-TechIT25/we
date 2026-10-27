export const PROFILE_STYLES = [
  { value: 'normal', label: 'Normal', description: 'Classic brand header and a clean profile.' },
  { value: 'image', label: 'Image header', description: 'Your company banner behind the profile.' },
  { value: 'modern', label: 'Animated modern', description: 'Blueprint social hub with branded platform cards and subtle motion.' },
];

export function getProfileStyle(value) {
  return PROFILE_STYLES.some(style => style.value === value) ? value : 'normal';
}
