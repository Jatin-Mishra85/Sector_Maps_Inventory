export async function shareContent({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return 'copied';
  }
  return 'unsupported';
}