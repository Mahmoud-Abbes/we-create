(function () {
  const form = document.getElementById('kc-form-login');
  if (!form) {
    return;
  }

  const restartUrl = form.dataset.restartUrl;
  if (!restartUrl) {
    return;
  }

  window.addEventListener('pageshow', function (event) {
    if (!document.getElementById('username')) {
      window.location.replace(restartUrl);
      return;
    }
    if (event.persisted) {
      window.location.replace(restartUrl);
    }
  });
})();
