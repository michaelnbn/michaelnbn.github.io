(function () {
  var formHost = /(^|\.)(nbndesign\.net|michaelnbn\.github\.io)$/.test(location.hostname);

  // Quote form: sends the request to Zoho CRM as a new lead, then Zoho redirects to our thank-you page.
  var form = document.getElementById('quote-form');
  if (form) {
    var note = document.getElementById('form-note');
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type="submit"]');
    var extras = [
      ['Site address', 'site'], ['State or territory', 'state'], ['Development type', 'category'],
      ['Lots or dwellings', 'lots'], ['NBN reference', 'reference'], ['Plans link', 'plans'],
      ['Calculator estimate', 'calculator-estimate'], ['Additional information', 'message']
    ];
    form.addEventListener('submit', function (e) {
      if (!formHost) { e.preventDefault(); note.hidden = false; return; }
      var company = document.getElementById('company');
      if (!company.value.trim()) company.value = 'Not provided';
      var lines = ['Source: nbndesign.net quote form'];
      extras.forEach(function (x) {
        var el = document.getElementById(x[1]);
        if (el && el.value.trim()) lines.push(x[0] + ': ' + el.value.trim());
        if (el && el.name) el.disabled = true;
      });
      document.getElementById('zoho-description').value = lines.join('\n');
      btn.disabled = true;
      status.textContent = 'Sending your request...';
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
      avg: document.getElementById('calc-avg')
    };
    var quoteLink = document.getElementById('calc-quote');
    var quoteBase = quoteLink ? quoteLink.getAttribute('href') : '';
    var update = function () {
      var n = parseInt(input.value, 10);
      if (!(n >= 1) || n > 100000) {
        out.total.textContent = 'Enter 1 or more units';
        out.avg.textContent = '';
        if (quoteLink) quoteLink.setAttribute('href', quoteBase);
        return;
      }
      var total = priceFor(n);
      out.total.textContent = money(total, 0);
      out.avg.textContent = money(total / n, 2);
      if (quoteLink) quoteLink.setAttribute('href', quoteBase + (quoteBase.indexOf('?') < 0 ? '?' : '&') + 'units=' + n);
    };
    input.addEventListener('input', update);
    update();
  }
  // Quote page: carry the calculator estimate over from the pricing page.
  var estBox = document.getElementById('quote-estimate');
  if (estBox) {
    var m = /[?&]units=(\d+)/.exec(location.search);
    var u = m ? parseInt(m[1], 10) : 0;
    if (u >= 1 && u <= 100000) {
      var lots = document.getElementById('lots');
      if (lots && !lots.value) lots.value = u;
      var est = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(window.nbnPrice(u));
      estBox.textContent = 'Your estimate: ' + u + ' units, ' + est + ' including GST. We confirm the final price in your quote.';
      estBox.hidden = false;
      document.getElementById('calculator-estimate').value = u + ' units, ' + est + ' incl GST';
    }
  }

})();
