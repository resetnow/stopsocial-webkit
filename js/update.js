/* global 
	stopSocial,
	RSAKeyPair,
	decryptedString,
	md5,
	setMaxDigits
*/
/* jshint strict: true */
/* jshint globalstrict: true */

'use strict';

function ajaxLoad(url, callback, _this) {
	var x = new XMLHttpRequest();
	x.onreadystatechange = function () {        
		if ((x.readyState == 4) && (x.status == 200)) {        
			callback.call(_this, x.responseText);        
		}    
	};
	x.open('GET', url, true);
	x.send(null);
}

var updater = {
	applyUpdate: function(o) {
		(function(a){
			for (var b in a)
				stopSocial.settings(a[b][0], a[b][1]);
		})([
			["css-domain-list", o.CSSDomainList],
			["css-filter", o.CSSFilter],
			["url-domain-list", o.URLDomainList],
			["url-blocklist", o.URLBlocklist],
			['enable-error-reporting', o.enableErrorReporting],
			['blocklist-version', o.version]
		]);
		stopSocial.CSSBlocklist.reload();
		stopSocial.URLBlocklist.reload();
	},
	
	checkSignature: function(signature) {
		var o;
		try {
			o = JSON.parse(this.update);
		} catch (e) {
			return;
		}
		if (o.upToDate || (!o))
			return;
		var hash1 = decryptedString(this.keyPair, signature);
		var hash2 = md5(this.update);
		if (hash1 != hash2)
			return;
		this.applyUpdate(o);
	},
	
	getSignature: function(update) {
		this.update = update;
		ajaxLoad(this.signatureURL, this.checkSignature, this);
	},

	init: function() {
		setMaxDigits(19);
		this.keyPair = new RSAKeyPair("", "107d97101d36bcc74a1bff3e8d0aba21", "7fc2a3ea1659283a27315514dd063421");
		this.updateURL = "http://resetnow.ru/stopsocial/update?v=" + stopSocial.settings('blocklist-version') + '&w=' + stopSocial.version;
		this.signatureURL = "http://resetnow.ru/stopsocial/signature?w=" + stopSocial.version;
		ajaxLoad(this.updateURL, this.getSignature, this);
	}
};
