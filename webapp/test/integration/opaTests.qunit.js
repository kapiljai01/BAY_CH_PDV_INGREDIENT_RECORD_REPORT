/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["zmaterialsteward/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
