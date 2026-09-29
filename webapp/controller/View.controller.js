sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

], (Controller, MessageToast, MessageBox) => {
    "use strict";
    var data = [];
    var _sMode;


    return Controller.extend("zmaterialsteward.controller.View", {
        onInit: function () {
            _sMode = "UPDATE";
        },

        onRadioSelect: function (oEvent) {
            var iIndex = oEvent.getSource().getSelectedIndex();

            if (iIndex === 0) {
                _sMode = "UPDATE";
                this.byId("updateBox").setVisible(true);
                this.byId("reuploadBox").setVisible(false);
            } else {
                _sMode = "REUPLOAD";
                this.byId("updateBox").setVisible(false);
                this.byId("reuploadBox").setVisible(true);
            }
        },

        onFileChange: function (e) {

            debugger;
            var oFile = this.byId("fuUpdate").oFileUpload.files[0];
            if (!oFile) {
                oFile = this.byId("fuReupload").oFileUpload.files[0];
            }
            var that = this;

            if (!oFile) {
                sap.m.MessageBox.error("Select a CSV file");
                return;
            }

            var reader = new FileReader();

            reader.onload = function (e) {
                var sCSV = e.target.result;
                var aLines = sCSV.split(/\r\n|\n/).filter(Boolean);

                for (var i = 1; i < aLines.length; i++) {
                    var cols = aLines[i].split(",");

                    data.push({
                        SpcNo: cols[0] ? cols[0].trim() : "",
                        CommName: cols[1] ? cols[1].trim() : "",
                        InciName: cols[2] ? cols[2].trim() : "",
                        ENum: cols[3] ? cols[3].trim() : "",
                        CasNum: cols[4] ? cols[4].trim() : "",
                        Category: cols[5] ? cols[5].trim() : "",
                        NpdrText: cols[6] ? cols[6].trim() : "",
                        ExstPrd: cols[7] ? cols[7].trim() : "",
                        ChngExstPrd: cols[8] ? cols[8].trim() : ""
                    });
                }

                console.log(data);
                // that.getView().getModel("local").setProperty("/dataArray", data);
            };

            reader.readAsText(oFile);

        },

        onUpload: function () {
            var that = this;

            var aTableDetails = [];

            data.forEach(function (item) {
                aTableDetails.push({
                    SpcNo: item.SpcNo,
                    CommName: item.CommName,
                    InciName: item.InciName,
                    ENum: item.ENum,
                    CasNum: item.CasNum,
                    Category: item.Category,
                    NpdrText: item.NpdrText,
                    ExstPrd: item.ExstPrd,
                    ChngExstPrd: item.ChngExstPrd
                });
            });

            var oPayload = {
                "Name": _sMode,
                "Nav_Table": aTableDetails
            };


            sap.ui.core.BusyIndicator.show(0);
            var oModel = that.getView().getModel();

            oModel.create("/ProcessSet", oPayload, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("File uploaded successfully");
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Error uploading file");
                }
            });


        },

        onDownloadSample: function () {

            var aHeaders = ["Specification No", "Common Name", "Incident Name", "E Number", "CAS Number", "Category", "NPDR Text", "Existing Product", "Change Existing Product"];

            var aRows = [
                ["126000000106", "Lanolin", "LANOLIN", "E 913", "8006-54-0", "Animal Origin", "Avoid use in NPD's and rollouts, usage requires prior approval from MSC if no viable alternatives are available; allowed as an ingredient in limited circumstances", "Allowed to remain in existing products", "Continue use while assessing pros and cons on a case-by-case basis depending on product profile"],
                ["126000000132", "Silicon Dioxide", "", "", "7631-87-5", "Mineral Origin", "Used in various applications, requires safety data for handling and disposal", "Allowed to remain in existing products", "Continue use while assessing pros and cons on a case-by-case basis depending on product profile"]
            ];

            // Header row
            var sCSVContent = aHeaders.map(function (header) {
                return '"' + header.replace(/"/g, '""') + '"';
            }).join(",") + "\n";

            // Data rows
            aRows.forEach(function (aRow) {
                aRow[0] = '="' + aRow[0] + '"';   // correct place to avoid 1.26E+11

                sCSVContent += aRow.map(function (value) {
                    return '"' + String(value).replace(/"/g, '""') + '"';
                }).join(",") + "\n";
            });

            var oBlob = new Blob(["\uFEFF" + sCSVContent], {
                type: "text/csv;charset=utf-8;"
            });

            var sFileName = "Sample_File.csv";

            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(oBlob, sFileName);
            } else {
                var oLink = document.createElement("a");
                var sUrl = URL.createObjectURL(oBlob);

                oLink.setAttribute("href", sUrl);
                oLink.setAttribute("download", sFileName);
                oLink.style.visibility = "hidden";

                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
            }

            //     var sCSVContent = aHeaders.join(",") + "\n";

            //     aRows.forEach(function (aRow) {
            //         sCSVContent += aRow.join(",") + "\n";
            //     });

            //     var oBlob = new Blob([sCSVContent], {
            //         type: "text/csv;charset=utf-8;"
            //     });

            //     var sFileName = "Sample_File.csv";

            //     if (window.navigator.msSaveOrOpenBlob) {
            //         window.navigator.msSaveOrOpenBlob(oBlob, sFileName);
            //     } else {
            //         var oLink = document.createElement("a");
            //         var sUrl = URL.createObjectURL(oBlob);

            //         oLink.setAttribute("href", sUrl);
            //         oLink.setAttribute("download", sFileName);
            //         oLink.style.visibility = "hidden";

            //         document.body.appendChild(oLink);
            //         oLink.click();
            //         document.body.removeChild(oLink);
            //     }


        },

        onClear: function () {
            data = [];
            // this.getView().getModel("local").setProperty("/dataArray", []);
            this.byId("fuUpdate").clear();
            this.byId("fuReupload").clear();
        }

    });
});