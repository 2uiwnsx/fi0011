sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/Locale",
    "sap/ui/model/Filter"
], (Controller, NumberFormat, Locale, Filter) => {
    "use strict";

    return Controller.extend("fi0011.controller.Main", {
        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("Main").attachPatternMatched(() => this._onPatternMatched());
        },

        onExit() {
            this.getView().destroyContent();
        },

        currencyFormat: function(sValue, sCurrency) {
            if (!sValue || !sCurrency) {
                return "";
            };

            var oLocale = new Locale("en");

            switch (sCurrency) {
                case "CNY":
                    oLocale = new Locale("zh-CN");
                    break;

                case "USD":
                    oLocale = new Locale("en-US");
                    break;
                
                case "EUR":
                    oLocale = new Locale("de-DE");
                    break;
                
                default:
                    oLocale = new Locale("ko-KR");
            }

            var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                currencyCode: true,
                locale: oLocale
            });
            
            return oCurrencyFormat.format(parseFloat(sValue), sCurrency);
        },

        _onPatternMatched() {

        },

        async onSearch(oEvent) {
            const oTable = this.byId("fi0011.treeTable");

            oTable.setBusy(true);

            const oSmartFilterBar = this.byId("fi0011.smartFilterBar");
            const oFilterData = oSmartFilterBar.getFilterData();

            const sPostingYear = oFilterData.PostingYear;
            const aSalesOffices = oFilterData.SalesOffice?.items;
            const aCustomers = oFilterData.Customer?.items;

            let aFilters;

            aFilters = await this._setFilters(sPostingYear, aSalesOffices, aCustomers);

            let aParentNode = new Set();
            let aParentFilters = [];

            // 레벨 2
            let aFetchedData = await this._fetchData(aFilters);

            if (aFetchedData.length === 0) {
                oTable.setBusy(false);
                return;
            }

            aFetchedData.forEach(function (oFetchedData) {
                if (!aParentNode.has(oFetchedData.ParentNodeID)) {
                    aParentNode.add(oFetchedData.ParentNodeID);
                    aParentFilters.push(new Filter("NodeID", "EQ", oFetchedData.ParentNodeID));
                }
            });

            aFilters = [];

            aFilters.push(new Filter(aParentFilters, false));

            // 레벨 2
            aParentNode.clear();
            aParentFilters = [];

            aFetchedData = await this._fetchData(aFilters);
                                         

            aFetchedData.forEach(function (oFetchedData) {
                if (!aParentNode.has(oFetchedData.SalesOffice)) {
                    aParentNode.add(oFetchedData.SalesOffice);
                    aParentFilters.push(new Filter("SalesOffice", "EQ", oFetchedData.SalesOffice));
                }
            });

            aFilters = [];

            aFilters.push(new Filter(aParentFilters, false));

            oTable.bindRows({
                path: "/ZFI_C_0011_01",
                filters: aFilters,
                parameters: {					
					countMode: "Inline",
					treeAnnotationProperties:  {
						hierarchyLevelFor : "HierarchyLevel",
	                    hierarchyNodeFor : "NodeID",
	                    hierarchyParentNodeFor : "ParentNodeID",
	                    hierarchyDrillStateFor : "DrillState"
					}
				}
            });

            this.byId("fi0011.postingYear").setValue(sPostingYear);

            if (aSalesOffices && aSalesOffices.length > 0) {
                let sValue = "";

                aSalesOffices.forEach(oSalesOffice => {
                    sValue += oSalesOffice.key + ", ";
                });
                
                sValue = sValue.slice(0, -2);
                
                this.byId("fi0011.salesOffice").setValue(sValue);
            }

            if (aCustomers && aCustomers.length > 0) {
                let sValue = "";

                aCustomers.forEach(oCustomer => {
                    sValue += oCustomer.key + ", ";
                });

                sValue = sValue.slice(0, -2);

                this.byId("fi0011.salesOffice").setValue(sValue);
            }

            oTable.setBusy(false);
        },

        _setFilters(sPostingYear, aSalesOffices, aCustomers) {
            const aFilters = [];
        
            if (sPostingYear) {
                aFilters.push(new Filter("PostingYear", "EQ", sPostingYear));
            }
        
            if (aSalesOffices && aSalesOffices.length > 0) {
                const aSalesOfficeFilters = aSalesOffices.map(oSalesOffice =>
                    new Filter("SalesOffice", "EQ", oSalesOffice.key)
                );

                aFilters.push(new Filter(aSalesOfficeFilters, false));
            }
        
            if (aCustomers && aCustomers.length > 0) {
                const aCustomerFilters = aCustomers.map(oCustomer =>
                    new Filter("Customer", "EQ", oCustomer.key)
                );

                aFilters.push(new Filter(aCustomerFilters, false));
            }
        
            return aFilters;
        },

        _fetchData(aFilters) {
            const oModel = this.getView().getModel();

            return new Promise((resolve, reject) => {
                oModel.read("/ZFI_C_0011_01", {
                    filters: aFilters || [],
                    success: function(oReturn) {
                        resolve(oReturn.results);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        }
    });
});