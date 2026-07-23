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
    const toCopy = url || text;
    if (!toCopy) return 'unsupported';
    await navigator.clipboard.writeText(toCopy);
    return 'copied';
  }
  return 'unsupported';
}