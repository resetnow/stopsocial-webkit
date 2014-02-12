/* global 
	chrome,
	e
*/
/* jshint strict: true */
/* jshint globalstrict: true */
/* jshidnt latedef: false */

'use strict';

var 
	bg = chrome.extension.getBackgroundPage(),
	stopSocial = bg.stopSocial;

function changeHandler() {
	/* jshint validthis: true */
	var i = e(this).attr("data-blocklist-item-id");
	if (this.checked)
		delete stopSocial.URLBlocklist.disabledItems[i];
	else
		stopSocial.URLBlocklist.disabledItems[i] = true;
		stopSocial.settings("url-disabled-items", stopSocial.URLBlocklist.disabledItems);
		stopSocial.URLBlocklist.reload();
}
	
function loadSettings() {
	var 
		a = stopSocial.CSSBlocklist.state,
		b = stopSocial.URLBlocklist.state; 
	e("#enable-css-filter").prop("checked", a);
	e("#enable-url-filter").prop("checked", b);
	if (!(a || b)) {
		e("#enable-css-filter, #enable-url-filter").prop("disabled", true);
		e("#disable-stopsocial").prop("checked", true);
	}
	for (var i = 0, c = stopSocial.URLBlocklist.blocklist.length; i < c; i++) {
		e(document.createElement("input"))
			.attr({
				"type": "checkbox",
				"data-blocklist-item-id": i,
				"id": "blocklist-item-" + i,
				"class": "blocklist-item"
			})
			.prop("checked", (stopSocial.URLBlocklist.disabledItems[i] === undefined))
			.change(changeHandler)
			.appendTo("#blocklist-items-container");
		var labelHTML = 
			(stopSocial.URLBlocklist.blocklist[i].n) ? 
			stopSocial.URLBlocklist.blocklist[i].n : 
			chrome.i18n.getMessage("other");
		e(document.createElement("label"))
			.attr("for", "blocklist-item-" + i)
			.html(labelHTML)
			.appendTo("#blocklist-items-container");
	}
}
	
e(function() {
	e("#enable-css-filter").change(function() {
		if (this.checked)
			stopSocial.CSSBlocklist.setState(true, true);
		else
			stopSocial.CSSBlocklist.setState(false, true);
	});
	e("#enable-url-filter").change(function() {
		if (this.checked)
			stopSocial.URLBlocklist.setState(true, true);
		else
			stopSocial.URLBlocklist.setState(false, true);
	});
	e("#enable-css-filter, #enable-url-filter").change(function() {
		var checked = e("#enable-css-filter, #enable-url-filter").prop("checked");
		if (!(checked[0] || checked[1]))
			e("#disable-stopsocial").trigger("click");
	});
	e("input[name=enable]").change(function() {
		if (this.value == 'true') {
			e("#enable-css-filter, #enable-url-filter")
				.prop("disabled", false)
				.prop("checked", true);
			stopSocial.enable();
		} else {
			e("#enable-css-filter, #enable-url-filter")
				.prop("disabled", true)
				.prop("checked", false);
			stopSocial.disable();
		}
	});
	e("input.auto")
		.change(function() {
			stopSocial.settings(e(this).attr("name"), this.checked);
		})
		.each(function(key, value) {
			if (stopSocial.settings(e(value).attr("name")))
				e(value).prop("checked", true);
		});
	loadSettings();
	var l = chrome.i18n.getMessage("@@ui_locale");
	if ((l == "uk") || (l == "ru"))
		e("#yandex-money").show();
});