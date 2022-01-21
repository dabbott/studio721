function triggerCopyEvent() {
  const isSafari = /Apple Computer/.test(navigator.vendor);

  if (isSafari) {
    const range = document.createRange();
    range.selectNode(document.body);

    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }

  document.execCommand('copy');

  if (isSafari) {
    window.getSelection()?.removeAllRanges();
  }
}

export function copyToClipboard(text: string) {
  const handler = (event: ClipboardEvent) => {
    event.preventDefault();
    event.clipboardData?.setData('text/plain', text);
  };

  document.addEventListener('copy', handler);

  triggerCopyEvent();

  document.removeEventListener('copy', handler);
}
