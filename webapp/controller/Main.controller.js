sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"
], (Controller, Filter) => {
    "use strict";
Q
    return Controller.extend("fi0011.controller.Main", {
        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("Main").attachPatternMatched(() => this._onPatternMatched());
        },

        onExit() {
            this.getView().destroyContent();
        },

        _onPatternMatched() {
            
        },

        onBeforeRebindTable(oEvent) {
            const oBindingParams = oEvent.getParameter("bindingParams");

            let aFilters = oBindingParams.filters || [];

            const oSelect = this.byId("fi0011.customSelect");
            const sSelectedKey = oSelect.getSelectedKey();
        
            let oNewFilter;

            if (sSelectedKey === "1") {
                oNewFilter = new Filter("TransactionCurrency", "EQ", "KRW");
            } else {
                oNewFilter = new Filter("TransactionCurrency", "NE", "KRW");
            }
        
            aFilters.push(oNewFilter);
        
            oBindingParams.filters = aFilters;

            oBindingParams.sorter = [
                new sap.ui.model.Sorter("SalesOffice", false),
                new sap.ui.model.Sorter("Customer", false),
                new sap.ui.model.Sorter("OrderNO", false)
            ];
        }
    });
});