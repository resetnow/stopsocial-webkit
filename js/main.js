/* global chrome, updater */
/* global stopSocial: true */
/* jshint strict: true */
/* jshint globalstrict: true */

'use strict';

function getDomain(url) {
	var t = url.match(/:\/\/(.[^/]+)/);
	return (t) ? t[1].replace(/^www\./i,'') : false;
}

var CSSBlocklist = function() {
	this.state = false;
	/*
	 *	load settings
	 */
	this.reload = function() {
		this.domainList = stopSocial.settings('css-domain-list');
		this.domainListUser = stopSocial.settings('css-domain-list-user');
		this.css = stopSocial.settings('css-filter');
	};
	// once created, call reload
	this.reload();
	/*
	 *	set state
	 */
	this.setState = function(state, writeSettings) {
		if (state && !this.state)
			this.state = true;
		else if (!state && this.state)
			this.state = false;
		if (writeSettings)
			stopSocial.settings("enable-css-filter", state);
	};
	/*
	 *	alias for setState(true)
	 */
	this.enable = function() { this.setState(true); };
	/*
	 *	alias for setState(false)
	 */
	this.disable = function() { this.setState(false);	};
	this.onCommittedHandler = function(details) {
		if ((details.frameId !== 0) || (!stopSocial.CSSBlocklist.state))
			return;
		if (
			(stopSocial.CSSBlocklist.checkDomain(getDomain(details.url))) && 
			(/^(http|https)/.test(details.url))
		) {
			chrome.tabs.insertCSS(details.tabId, {
				code: stopSocial.CSSBlocklist.css,
				allFrames: true,
				runAt: "document_start"
			});
		}
	};
	/*
	 *	returns true if CSS should be inserted
	 */
	this.checkDomain = function(domain) {
		var 
			defaultValue = (this.domainList[domain] !== undefined) ? this.domainList[domain] : true;
		return (
			(this.domainListUser[domain] !== undefined) ?
				this.domainListUser[domain] :
				defaultValue
		);
	};
	/*
	 *	Set domain blocking state and save domainListUSer
	 */
	this.setDomainState = function(domain, state) {
		this.domainListUser[domain] = state;
		stopSocial.settings("css-domain-list-user", this.domainListUser);
	};
	// attach event listeners
	chrome.webNavigation.onCommitted.addListener(this.onCommittedHandler); 
};

var URLBlocklist = function() {
	this.state = false;
	this.tabs = {};
	
	// get info about existing tabs
	chrome.tabs.query({}, function(tabs) {
		for (var i = 0, c = tabs.length; i < c; i++)
			stopSocial.URLBlocklist.tabs[tabs[i].id] = getDomain(tabs[i].url);
	});
	
	/*
	 *	Create array containing domains for onBeforeRequest setting
	 */
	this.getBlocklistArray = function() {
		var l = [];
		for (var i = 0, c = this.blocklist.length; i < c; i++) {
			if (!this.disabledItems[i])
				l = l.concat(this.blocklist[i].p);
		}
		return l;
	};
	/*
	 *	onBeforeRequest handler
	 */
	this.onBeforeRequestHandler = function(details) {
		//
		// TODO: don't perform any checks if url-domain-list(-user) is empty
		//
		if  (stopSocial.URLBlocklist.checkDomain(
				stopSocial.URLBlocklist.tabs[details.tabId]
			))
			return { redirectUrl: "about:blank" };
	};
	this.onTabRemovedHandler = function(tabId) {
		delete stopSocial.URLBlocklist.tabs[tabId];
	};
	this.onTabUpdatedHandler = function(tabId, changeInfo) {
		if (changeInfo.url)
			stopSocial.URLBlocklist.tabs[tabId] = getDomain(changeInfo.url);
	};
	/*
	 *	set state
	 */
	this.setState = function(state, writeSettings) {
		if (state && !this.state) {
			var blocklistArray = this.getBlocklistArray();
			if (blocklistArray.length === 0)
				return;
			chrome.webRequest.onBeforeRequest.addListener(
				this.onBeforeRequestHandler,
				{
					urls: this.getBlocklistArray()
				},
				['blocking']
			);
			this.state = true;
		} else if (!state && this.state) {
			chrome.webRequest.onBeforeRequest.removeListener(
				this.onBeforeRequestHandler
			);
			this.state = false;
		}
		if (writeSettings)
			stopSocial.settings("enable-url-filter", state);
	};
	/*
	 *	alias for setState(true)
	 */
	this.enable = function() { this.setState(true); };
	/*
	 *	alias for setState(false)
	 */
	this.disable = function() { this.setState(false);	};
	/*
	 *	returns true if domain isn't whitelisted by blocklist or user
	 */
	this.checkDomain = function(domain) {
		var 
			defaultValue = (this.domainList[domain] !== undefined) ? this.domainList[domain] : true;
		return (
			(this.domainListUser[domain] !== undefined) ?
				this.domainListUser[domain] :
				defaultValue
		);
	};
	this.reload = function() {
		this.blocklist = stopSocial.settings('url-blocklist');
		this.domainList = stopSocial.settings('url-domain-list');
		this.domainListUser = stopSocial.settings('url-domain-list-user');
		this.disabledItems = stopSocial.settings('url-disabled-items');
		this.disable();
		this.enable();
	};
	this.reload();
	/*
	 *	Set domain blocking state and save domainListUSer
	 */
	this.setDomainState = function(domain, state) {
		this.domainListUser[domain] = state;
		stopSocial.settings("url-domain-list-user", this.domainListUser);
	};
	// attach tab event listeners
	chrome.tabs.onRemoved.addListener(this.onTabRemovedHandler);
	chrome.tabs.onUpdated.addListener(this.onTabUpdatedHandler);
};

var stopSocial = {
	version: "2.1",
	CSSBlocklist: undefined,
	URLBlocklist: undefined,
	_settings: {},
	settings: function(name, value) {
		if (value === undefined)
			return this._settings[name];
		localStorage[name] = JSON.stringify(value);
		this._settings[name] = value;
	},
	domainHasSettings: function(domain) {
		return (function(o, domain){
			for (var a in o)
			if (this.settings(o[a])[domain] !== undefined)
					return true;
			return false;
		}).call(this, [
			"css-domain-list",
			"url-domain-list",
			"css-domain-list-user",
			"url-domain-list-user"
		], domain);
	},
	enable: function() {
		this.CSSBlocklist.setState(true, true);
		this.URLBlocklist.setState(true, true);
	},
	disable: function() {
		this.CSSBlocklist.setState(false, true);
		this.URLBlocklist.setState(false, true);
	},
	checkSettings: function() {
		(function(o){
			var a;
			for (a in o) {
				if (localStorage[a] === undefined) {
					for (var b in o)
						localStorage[b] = JSON.stringify(o[b]);
					break;
				}
			}
			for (a in o)
				this._settings[a] = JSON.parse(localStorage[a]);
		}).call(this, {
			"update": true,
			"enable-css-filter": true,
			"enable-url-filter": true,
			"css-domain-list": {},
			"css-domain-list-user": {},
			"css-filter": "",
			"url-blocklist": [],
			"blocklist-version": 0,
			"url-domain-list": {},
			"url-domain-list-user": {},
			// see http://jsperf.com/indexof-vs-associative-array
			"url-disabled-items": {}
		});
	},
	init: function() {
		this.checkSettings();
		this.CSSBlocklist = new CSSBlocklist();
		this.CSSBlocklist.setState(
			this.settings("enable-css-filter")
		);
		this.URLBlocklist = new URLBlocklist();
		this.URLBlocklist.setState(
			this.settings("enable-url-filter")
		);
		setTimeout(function() {
			updater.init();
		}, 5000);
	}
};

document.addEventListener("DOMContentLoaded", function() {
	stopSocial.init();
});