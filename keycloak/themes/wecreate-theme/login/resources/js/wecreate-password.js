(function () {
  document.querySelectorAll('.wecreate-password-toggle').forEach((button) => {
    const targetId = button.getAttribute('data-target');
    const input = targetId ? document.getElementById(targetId) : null;
    if (!input) {
      return;
    }

    const showLabel = button.getAttribute('aria-label') || 'Show password';
    const hideLabel = button.dataset.hideLabel || 'Hide password';

    button.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      button.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
      button.setAttribute('aria-label', isHidden ? hideLabel : showLabel);
      button.classList.toggle('is-revealed', isHidden);
    });
  });
})();
