if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.BASE_URL || ''}service-worker.js`)
      .then(reg => {})
      .catch(e => {});
  });
}
