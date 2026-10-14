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
      ['Service', 'service'], ['Add-ons', 'addons-text'],
      ['Calculator estimate', 'calculator-estimate'], ['Additional information', 'message']
    ];
    form.addEventListener('submit', function (e) {
      if (!formHost) { e.preventDefault(); note.hidden = false; return; }
      var company = document.getElementById('company');
      if (!company.value.trim()) company.value = 'Not provided';
      var lotsEl = document.getElementById('lots');
      var nUnits = lotsEl ? parseInt(String(lotsEl.value).replace(/[^0-9]/g, ''), 10) : 0;
      var opts = quoteOpts();
      var addonsBox = document.getElementById('addons-text');
      if (addonsBox) addonsBox.value = opts.list.join(', ');
      if (nUnits >= 1 && nUnits <= 100000 && window.nbnEstimate) {
        var est = window.nbnEstimate(nUnits, opts);
        var estAud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(est.total);
        document.getElementById('calculator-estimate').value = nUnits + ' units = ' + estAud + ' (website price' + (est.label ? ', ' + est.label : '') + ')';
      }
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

  function quoteOpts() {
    var svc = document.getElementById('service');
    var c = document.getElementById('addon-concierge'), r = document.getElementById('addon-rush');
    var o = { asbuilt: !!(svc && /As-built/.test(svc.value)), concierge: !!(c && c.checked), rush: !!(r && r.checked), list: [] };
    if (o.concierge) o.list.push('NBN application concierge');
    if (o.rush) o.list.push('Rush turnaround');
    return o;
  }

  // Price calculator: graduated bands.
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
  // Add-ons (proposed): as-built only $50/unit; concierge $250 per stage; rush +30% of design fee; duplex package $450.
  function estimate(n, o) {
    o = o || {};
    var design = o.asbuilt ? n * 50 : priceFor(n);
    var total = design, parts = [];
    if (o.asbuilt) parts.push('as-built only');
    if (o.rush) { total += Math.round(design * 0.3); parts.push('rush'); }
    if (o.concierge) { total += 250; parts.push('concierge'); }
    var pkg = false;
    if (!o.asbuilt && n === 2 && o.concierge && !o.rush && total > 450) { total = 450; pkg = true; parts = ['duplex package']; }
    return { total: total, pkg: pkg, label: parts.join(', ') };
  }
  window.nbnEstimate = estimate;

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
      var o = calcOpts();
      var est = estimate(n, o);
      out.total.textContent = money(est.total, 0);
      out.avg.textContent = money(est.total / n, 2);
      var pkgNote = document.getElementById('calc-pkg');
      if (pkgNote) pkgNote.hidden = !est.pkg;
      var q = 'units=' + n + (o.asbuilt ? '&svc=asbuilt' : '') + (o.concierge ? '&c=1' : '') + (o.rush ? '&r=1' : '');
      if (quoteLink) quoteLink.setAttribute('href', quoteBase + (quoteBase.indexOf('?') < 0 ? '?' : '&') + q);
    };
    var calcOpts = function () {
      var s = document.querySelector('input[name="svc"]:checked');
      var c = document.getElementById('opt-concierge'), r = document.getElementById('opt-rush');
      return { asbuilt: !!(s && s.value === 'asbuilt'), concierge: !!(c && c.checked), rush: !!(r && r.checked) };
    };
    input.addEventListener('input', update);
    document.querySelectorAll('.calc input[type="radio"], .calc input[type="checkbox"]').forEach(function (el) { el.addEventListener('change', update); });
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
      var qs = location.search;
      if (/[?&]svc=asbuilt/.test(qs)) { var sv = document.getElementById('service'); if (sv) sv.value = 'As-built design only'; }
      if (/[?&]c=1/.test(qs)) { var cc = document.getElementById('addon-concierge'); if (cc) cc.checked = true; }
      if (/[?&]r=1/.test(qs)) { var rr = document.getElementById('addon-rush'); if (rr) rr.checked = true; }
      var e2 = estimate(u, quoteOpts());
      var est = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(e2.total);
      estBox.textContent = 'Your estimate: ' + u + ' units' + (e2.label ? ' (' + e2.label + ')' : '') + ', ' + est + '. We confirm the final price in your quote.';
      estBox.hidden = false;
      document.getElementById('calculator-estimate').value = u + ' units, ' + est + '';
    }
  }

})();
