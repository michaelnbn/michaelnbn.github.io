(function () {
  // Fill these in once the Google accounts exist. Nothing loads while they are empty.
  var GA4_ID = '';          // Google Analytics 4 measurement ID, e.g. 'G-XXXXXXXXXX'
  var ADS_ID = '';          // Google Ads account tag, e.g. 'AW-123456789'
  var ADS_LEAD_LABEL = '';  // Conversion label for the quote request, from the Ads conversion setup

  var live = /(^|\.)nbndesign\.net$/.test(location.hostname);
  window.nbnLead = function () {};
  var ids = [GA4_ID, ADS_ID].filter(Boolean);
  if (!live || !ids.length) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ids[0]);
  document.head.appendChild(s);
  window.gtag('js', new Date());
  ids.forEach(function (id) { window.gtag('config', id); });

  // Called on the thank-you page after a quote request is sent.
  window.nbnLead = function () {
    window.gtag('event', 'generate_lead', { currency: 'AUD' });
    if (ADS_ID && ADS_LEAD_LABEL) {
      window.gtag('event', 'conversion', { send_to: ADS_ID + '/' + ADS_LEAD_LABEL });
    }
  };
})();
