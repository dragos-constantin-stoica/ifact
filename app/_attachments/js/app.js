//Main layout of the application
var myApp = {

    init: function() {
        myApp.showUI();
        /*
		if(USERNAME.getUSERNAME()){
            myApp.showUI();
		}else{
			logic.login();
        }
        */
    },

    showUI: function() {
        if (!webix.isUndefined($$('mainLayout'))) $$('mainLayout').destructor();
        if (!webix.isUndefined($$('sidemenu'))) $$('sidemenu').destructor();
        webix.ui(webix.copy(myApp.ui));
        webix.ui(webix.copy(myApp.sidemenu));

        if (!$$("menu").config.hidden) $$("menu").hide();
        $$('page-1').show();
        loadData("1");
        $$('breadcrumb').setValue('iFact - Supplier');

    },

    ui: {
        id: "mainLayout",
        view: "layout",
        rows: [{
                view: "toolbar",
                id: "toolbar",
                elements: [{
                        view: "icon",
                        icon: "fas fa-bars",
                        click: function() {
                            if ($$("menu").config.hidden) {
                                $$("menu").show();
                            } else
                                $$("menu").hide();
                        }
                    },
                    { view: "label", id: "breadcrumb", label: "iFact" },
                    {},
                    {
                        view: "button",
                        type: "iconButton",
                        icon: "fas fa-sign-out-alt",
                        label: "Logout",
                        autowidth: true,
                        click: "logic.logout"
                    }
                ]
            },
            {
                id: "mainPage",
                view: "multiview",
                cells: [
                    supplier.ui,
                    customers.ui,
                    //contracts.ui,
                    invoice.ui,
                    payments.ui,
                    dashboard.ui()
                ],
                fitBiggest: true
            }
        ]
    },


    views: [
        supplier.ui,
        customers.ui,
        //contracts.ui,
        invoice.ui,
        payments.ui,
        dashboard.ui
    ],

    sidemenu: {
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        state: function(state) {
            var toolbarHeight = $$("toolbar").$height;
            state.top = toolbarHeight;
            state.height -= toolbarHeight;
        },
        body: {
            view: "list",
            borderless: true,
            scroll: false,
            template: "<span class='webix_icon #icon#'></span> #value#",
            data: [
                { id: 1, value: "Supplier", icon: "fas fa-anchor" },
                { id: 2, value: "Clients & Contracts", icon: "fas fa-user-circle" },
                //{id: 3, value: "Contracts", icon: "fas fa-briefcase"},
                { id: 4, value: "Invoice", icon: "fas fa-calculator" },
                { id: 5, value: "Payments", icon: "fab fa-bitcoin" },
                { id: 6, value: "Dashboard", icon: "fas fa-chart-line" }
            ],
            select: true,
            type: {
                height: 40
            },
            on: {
                onItemClick: function(id, e, node) {
                    var item = this.getItem(id);
                    if (!$$("menu").config.hidden) $$("menu").hide();
                    preprocess(id);
                    $$('breadcrumb').setValue('iFact - ' + node.textContent);
                }
            }
        }
    }


};