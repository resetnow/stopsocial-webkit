/* global 
	chrome,
	e
*/
/* jshint strict: true */
/* jshint globalstrict: true */
/* jshint latedef: false */

'use strict';

var 
	bg = chrome.extension.getBackgroundPage(),
	console = bg.console,
	stopSocial = bg.stopSocial,
	pageDomain;

function trim(s) {
	return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function getCurrentSite() {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	},
	function(tab) {
		if (!/^(http|https)/.test(tab[0].url)) {
			e("#site-specific-container").hide();
			loadSettings();
			return;
		}
		var domain = bg.getDomain(tab[0].url);
		window.pageDomain = domain;
		loadSettings(domain);
	});
}

function loadSiteSettings(domain) {
	e("#mode-2").prop("checked", stopSocial.CSSBlocklist.checkDomain(domain));
	e("#mode-1").prop("checked", stopSocial.URLBlocklist.checkDomain(domain));
	e("#site-specific").prop("checked", true);
	if (
		(stopSocial.CSSBlocklist.domainList[domain] !== undefined) ||
		(stopSocial.URLBlocklist.domainList[domain] !== undefined)
	)
		e("#site-specific").prop("disabled", true);
	e("#site-domain").html(domain);
	e("#site-domain, #site-domain-for").show("inline");
}

function markDisabled(isDisabled) {
	if (isDisabled) {
		e("input.control")
			.prop("disabled", true)
			.prop("checked", false);
		e("#site-domain, #site-domain-for").hide();
	} else {
		e("input.control").prop("disabled", false);
		if (window.pageDomain && (stopSocial.domainHasSettings(window.pageDomain)))
			loadSiteSettings(window.pageDomain);
	}
}

function loadSettings(domain) {
	e("#mode-2").prop("checked", stopSocial.settings("enable-css-filter"));
	e("#mode-1").prop("checked", stopSocial.settings("enable-url-filter"));
	if (
		!stopSocial.settings("enable-css-filter") && 
		!stopSocial.settings("enable-url-filter")
	) {
		e("#disable-stopsocial").prop("checked", true);
		markDisabled(true);
		return;
	}
	markDisabled(false);
	if (domain && (stopSocial.domainHasSettings(domain)))
		loadSiteSettings(domain);
}

e(function() {
	getCurrentSite();
	e("#close-link").click(function() {
		window.close();
	});
	e("#disable-stopsocial").change(function() {
		if (this.checked) {
			stopSocial.disable();
			loadSettings(window.pageDomain);
		} else {
			stopSocial.enable();
			loadSettings(window.pageDomain);
		}
	});
	e("#site-specific").change(function() {
		if (this.checked) {
			stopSocial.CSSBlocklist.setDomainState(window.pageDomain, true);
			stopSocial.URLBlocklist.setDomainState(window.pageDomain, true);
			loadSettings(window.pageDomain);
		} else {
			e("#site-domain, #site-domain-for").hide();
			delete stopSocial.CSSBlocklist.domainListUser[window.pageDomain];
			stopSocial.settings(
				"css-domain-list-user", 
				stopSocial.CSSBlocklist.domainListUser
			);
			delete stopSocial.URLBlocklist.domainListUser[window.pageDomain];
			stopSocial.settings(
				"url-domain-list-user", 
				stopSocial.URLBlocklist.domainListUser
			);
			loadSettings(window.pageDomain);
		}
	});
	e("#mode-1, #mode-2").change(function() {
		var 
			value = e("#mode-1, #mode-2").prop("checked"),
			domainHasSettings = stopSocial.domainHasSettings(window.pageDomain);
		if (!value[0] && !value[1] && !domainHasSettings) {
			e("#disable-stopsocial").trigger("click");
			return;
		}
		(function(a, b, c){
			for (var d in a) {
				if (c)
					a[d].setDomainState(window.pageDomain, b[d]);
				else 
					a[d].setState(b[d], true);
			}
		})([
			stopSocial.CSSBlocklist,
			stopSocial.URLBlocklist
		],[
			value[0],
			value[1]
		],
			domainHasSettings
		);
	});
	e("#report-site").click(function() {
		e(".container").hide();
		e("#report-site-popup").show();
	});
	e("#report-cancel, #report-done").click(function() {
		e(".container").hide();
		e("#main-popup").show();
	});
	e("#report-continue").click(function() {
		chrome.tabs.query({
			currentWindow: true,
			active: true
		},
		function(tab) {
			var
				url = tab[0].url,
				request = new XMLHttpRequest(),
				callback = function() {
					e("#report-site-domain").html(bg.getDomain(url));
					e(".container").hide();
					e("#report-site-done").show();
				};
			
			request.open('POST', 'http://resetnow.ru/stopsocial/report', true);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			request.onload = callback;
			request.onerror = callback;
			request.send("url=" + encodeURI(url));
		});
	});
});