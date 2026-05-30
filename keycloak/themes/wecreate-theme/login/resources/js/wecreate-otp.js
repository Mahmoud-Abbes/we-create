(function () {
  const form = document.getElementById('kc-otp-login-form');
  if (!form) {
    return;
  }

  const digits = Array.from(document.querySelectorAll('.wecreate-otp-digit'));
  const hidden = document.getElementById('email-otp');
  const resendBtn = document.getElementById('kc-resend-email');
  const statusEl = document.getElementById('wecreate-otp-status');
  const serverStatusEl = document.getElementById('wecreate-otp-server-status');
  const RESEND_KEY = 'wecreateOtpResendUntil';
  const RESEND_PENDING_KEY = 'wecreateOtpResendPending';
  const COOLDOWN_MS = 45000;
  const RESENT_MSG = 'A new code has been sent to your e-mail.';

  if (!digits.length || !hidden) {
    return;
  }

  function normalizeChar(value) {
    return value.replace(/[^a-zA-Z0-9]/g, '').slice(-1);
  }

  function syncHidden() {
    hidden.value = digits.map((d) => d.value).join('');
  }

  function focusIndex(index) {
    if (index >= 0 && index < digits.length) {
      digits[index].focus();
      digits[index].select();
    }
  }

  function showStatus(text) {
    if (!statusEl || !text) {
      return;
    }
    statusEl.textContent = text;
    statusEl.hidden = false;
    statusEl.classList.add('wecreate-otp-status--visible');
  }

  function getResendUntil() {
    return parseInt(sessionStorage.getItem(RESEND_KEY) || '0', 10);
  }

  function setResendCooldown() {
    sessionStorage.setItem(RESEND_KEY, String(Date.now() + COOLDOWN_MS));
  }

  function lockResendButton() {
    if (!resendBtn) {
      return;
    }
    resendBtn.disabled = true;
    resendBtn.classList.add('is-loading');
    resendBtn.setAttribute('aria-busy', 'true');
  }

  function updateResendButton() {
    if (!resendBtn) {
      return;
    }
    if (resendBtn.classList.contains('is-loading')) {
      resendBtn.disabled = true;
      return;
    }

    const left = getResendUntil() - Date.now();
    const defaultLabel = resendBtn.dataset.defaultLabel || resendBtn.textContent.trim();

    if (left > 0) {
      resendBtn.disabled = true;
      resendBtn.textContent = defaultLabel + ' (' + Math.ceil(left / 1000) + 's)';
    } else {
      resendBtn.disabled = false;
      resendBtn.textContent = defaultLabel;
    }
  }

  if (resendBtn && !resendBtn.dataset.defaultLabel) {
    resendBtn.dataset.defaultLabel = resendBtn.textContent.trim();
  }

  if (serverStatusEl && /sent|resent|new code|new one/i.test(serverStatusEl.textContent)) {
    setResendCooldown();
    showStatus(serverStatusEl.textContent.trim());
    sessionStorage.removeItem(RESEND_PENDING_KEY);
  } else if (sessionStorage.getItem(RESEND_PENDING_KEY) === '1') {
    sessionStorage.removeItem(RESEND_PENDING_KEY);
    const hasTopError = !!document.getElementById('wecreate-otp-top-error');
    if (!hasTopError) {
      setResendCooldown();
      showStatus(RESENT_MSG);
    }
  }

  digits.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = normalizeChar(input.value);
      syncHidden();
      if (input.value && index < digits.length - 1) {
        focusIndex(index + 1);
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        focusIndex(index - 1);
      }
      if (event.key === 'ArrowLeft') {
        focusIndex(index - 1);
      }
      if (event.key === 'ArrowRight') {
        focusIndex(index + 1);
      }
    });

    input.addEventListener('paste', (event) => {
      event.preventDefault();
      const pasted = (event.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, digits.length);
      pasted.split('').forEach((ch, i) => {
        digits[i].value = ch;
      });
      syncHidden();
      focusIndex(Math.min(pasted.length, digits.length - 1));
    });
  });

  form.addEventListener('submit', (event) => {
    const submitter = event.submitter;
    if (submitter && submitter.name === 'resend-email') {
      sessionStorage.setItem(RESEND_PENDING_KEY, '1');
      setResendCooldown();
      lockResendButton();
      return;
    }
    syncHidden();
    if (!hidden.value) {
      event.preventDefault();
      focusIndex(0);
    }
  });

  if (resendBtn) {
    resendBtn.addEventListener('click', lockResendButton);
    updateResendButton();
    window.setInterval(updateResendButton, 500);
  }

  focusIndex(0);
})();
