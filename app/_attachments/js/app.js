//Main layout of the application
var myApp = {
    
    init : function(){
		if(USERNAME.getUSERNAME()){
            myApp.showUI();
		}else{
			logic.login();
		}
    },
    
    showUI: function(){
        if(!webix.isUndefined($$('mainLayout'))) $$('mainLayout').destructor();
        if(!webix.isUndefined($$('sidemenu'))) $$('sidemenu').destructor();
        webix.ui(myApp.ui);
        webix.ui(myApp.sidemenu);

        if(! $$("menu").config.hidden) $$("menu").hide();
        $$('page-1').show();
        loadData("1");
        $$('breadcrumb').setValue('iFact - Supplier');

    },
    
    ui: {
        id: "mainLayout",
        rows:[
            {
                view: "toolbar", 
                id:"toolbar", 
                elements:[
                    {
                        view: "icon", icon: "bars",
                        click: function(){
                            if( $$("menu").config.hidden){
                                $$("menu").show();
                            }
                            else
                                $$("menu").hide();
                        }
                    },
                    { view: "label",id:"breadcrumb", label: "iFact"},
                    {},
                    {   
                        view:"button", 
                        type:"iconButton", 
                        icon:"sign-out", 
                        label:"Logout", 
                        autowidth:true, 
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
                    contracts.ui,
                    invoice.ui,
                    payments.ui,
                    config.ui
                ],
                fitBiggest:true
            }
        ]
    },
    
    sidemenu: {
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        state:function(state){
            var toolbarHeight = $$("toolbar").$height;
            state.top = toolbarHeight;
            state.height -= toolbarHeight;
        },
        body:{
            view:"list",
            borderless:true,
            scroll: false,
            template: "<span class='webix_icon fa-#icon#'></span> #value#",
            data:[
                {id: 1, value: "Supplier", icon: "anchor"},
                {id: 2, value: "Clients", icon: "user-circle-o"},
                {id: 3, value: "Contracts", icon: "briefcase"},
                {id: 4, value: "Invoice", icon: "calculator"},
                {id: 5, value: "Payments", icon: "bitcoin"},
                {id: 6, value: "Config", icon: "cog"}
            ],
            select:true,
            type:{
                height: 40
            },
            on:{
                onItemClick: function(id, e, node){
                    var item = this.getItem(id);
                    //console.log("Selected item id: " + id);
                    //... some code here ... 
                    if(! $$("menu").config.hidden) $$("menu").hide();
                    $$('page-' + id).show();
                    $$('breadcrumb').setValue('iFact - ' + node.textContent);
                    loadData(id);
                }
            }
        }
    }
    
    
};







