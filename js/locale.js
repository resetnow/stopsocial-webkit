/* global e, chrome */ 

e(function() {
	e(".i18n").each(function(index, element) {
		element.innerHTML = chrome.i18n.getMessage(element.getAttribute("data-text"));
	});
});