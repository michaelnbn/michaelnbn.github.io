(function () {
  var formHost = /(^|\.)(nbndesign\.net|michaelnbn\.github\.io)$/.test(location.hostname);

  // Quote form: send with fetch so the visitor lands on our own thank-you page (used for conversion tracking).
  var form = document.getElementById('quote-form');
  if (form) {
    var note = document.getElementById('form-note');
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!formHost) { note.hidden = false; return; }
      btn.disabled = true;
      status.textContent = 'Sending your request...';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('Request failed');
          window.location.href = '/thank-you';
        })
        .catch(function () {
          btn.disabled = false;
          status.textContent = 'Your request did not send. Please check your details and try again.';
        });
    });
  }

  // Price calculator: graduated bands, prices include GST.
  var BANDS = [[10, 120], [25, 108], [50, 95], [100, 82], [null, 70]];
  function priceFor(n) {
    var total = 0, prev = 0;
    for (var i = 0; i < BANDS.length; i++) {
      var top = BANDS[i][0] === null ? Infinity : BANDS[i][0];
      if (n > prev) total += (Math.min(n, top) - prev) * BANDS[i][1];
      prev = top;
    }
    return total;
  }
  window.nbnPrice = priceFor;

  var input = document.getElementById('units');
  if (input) {
    var money = function (v, d) {
      return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
    };
    var out = {
      total: document.getElementById('calc-total'),
      ex: document.getElementById('calc-ex'),
      gst: document.getElementById('calc-gst'),
      avg: document.getElementById('calc-avg')
    };
    var update = function () {
      var n = parseInt(input.value, 10);
      if (!(n >= 1) || n > 100000) {
        out.total.textContent = 'Enter 1 or more units';
        out.ex.textContent = out.gst.textContent = out.avg.textContent = '';
        return;
      }
      var total = priceFor(n);
      out.total.textContent = money(total, 0);
      out.ex.textContent = money(total / 1.1, 2);
      out.gst.textContent = money(total - total / 1.1, 2);
      out.avg.textContent = money(total / n, 2);
    };
    input.addEventListener('input', update);
    update();
  }
})();
