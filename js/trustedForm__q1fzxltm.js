(function () {
    var field = 'xxTrustedFormCertUrl';
    var provideReferrer = false;
    var invertFieldSensitivity = true;
    var tf = document.createElement('script');
    tf.type = 'text/javascript';
    tf.async = true;
    tf.src = 'http' + ('https:' == document.location.protocol ? 's' : '') +
        '://api.trustedform.com/trustedform.js?provide_referrer=' + escape(provideReferrer) + '&field=' + escape(field) + '&l=' + new Date().getTime() + Math.random() + '&invert_field_sensitivity=' + invertFieldSensitivity;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(tf, s);
})();