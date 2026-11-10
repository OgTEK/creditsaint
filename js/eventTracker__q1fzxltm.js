function EventTracker(csrfToken, sessionId) {
    this.csrfToken = csrfToken;
    this.sessionId = sessionId;

    this.track = function(eventName, properties, subEventName = false, async = true, includeSessionId = false) {
        referrer = document.referrer;
        properties = properties || {};

        if (includeSessionId && this.sessionId) {
            properties['sessionId'] = this.sessionId;
        }

        data =  {
            'eventName': eventName,
            'properties': properties,
            'path': document.location.pathname,
            'url': document.URL,
            'host': document.location.host,
            'userAgent': navigator.userAgent,
            _token: this.csrfToken
        };
        if(referrer) {
            data['referrer'] = referrer
        }

        if(false !== subEventName) {
            data['subEventName'] = subEventName;
        }

        $.ajax({
            url: '/event-track',
            async: async,
            data: data,
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                const trackingInfo = { tracked: eventName };
                if (includeSessionId) trackingInfo.sessionId = this.sessionId;
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                const errorInfo = { failed: textStatus };
                if (includeSessionId) errorInfo.sessionId = this.sessionId;
                console.log(errorInfo);
            }
        });
    }
}
