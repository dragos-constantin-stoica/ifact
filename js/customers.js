var customers = {

    customersForm: {
        id: "customersForm",
        view: "form",
        width: 600,
        elementsConfig:{ labelWidth: 180, minWidth:300 },
        elements:[
            {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii"},
            {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de Ordine in Registrul Comertului"},
            {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare"},
            {view:"text", name:"TVA" ,label:"TVA EU", placeholder:"TVA European"},                                
            {view:"textarea", name:"adresa" , label:"Adresa", height:110, 
                placeholder: "Str. , Nr. , Bl., Sc., Apt., Cod Postal, Localitatea, Comuna, Judetul/Sector, Tara" },
            {view:"text", name:"banca", label:"Banca", placeholder:"Banca"},
            {view:"text", name:"sucursala", label:"Sucursala", placeholder:"Sucursala bancii"},
            {view:"text", name:"IBAN", label:"IBAN", placeholder:"IBAN"},
            {view:"button", type:"form", value:"SAVE", align:"center", 
                click: function(){
                    var result = $$('customersForm').getValues();
                    if (result.id == "new"){
                        //new customer
                        delete result.id;
                        $$('customersList').add(result,0);
                    }else{
                        //update customer
                        $$('customersList').updateItem(result.id, result);
                    }
                    $$('customersList').refresh();
                    $$("customersForm").hide();
                }
            }
        ]
    },
  
    editCustomer: function(id, e){
        var item_id = $$('customersList').locate(e);     
        webix.ui(
            {
                view: "window",
                id: "newCustomerWindow",
                width:600,
                position: "top",
                head: "Modifica date Client",
                body: webix.copy(customers.customersForm)
            }
        ).show();
        $$('customersForm').clear();
        $$('customersForm').setValues({"doctype":"CUSTOMER"}, true);
        $$('customersForm').setValues($$('customersList').getItem(item_id) , true);
    },

    newCustomer: function(){
        webix.ui(
            {
                view: "window",
                id: "newCustomerWindow",
                width:600,
                position: "top",
                head: "Client Nou",
                body: webix.copy(customers.customersForm)
            }
        ).show();
        $$('customersForm').clear();
        $$('customersForm').setValues({"id":"new", "doctype":"CUSTOMER"});       
    },

    contractForm: {   
        id:"contractForm",
        view: "form",
        width: 600,
        elements:[
            {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii", labelWidth:180, readonly:true},
            {view:"text", name:"contract", label:"Contract", placeholder:"Contract", labelWidth:180},
            {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"start_date", label:"Data inceput", placeholder:"Data inceput", labelWidth:180},
            {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"end_date", label:"Data incheiere", placeholder:"Data sfarsit", labelWidth:180},
            {view:"textarea", name:"detalii", label:"Detalii", height:140, labelPosition:"top", placeholder:"Detalii despre contract: facturare, rate etc"},
            {view:"button", value:"SAVE", 
                click: function(){
                    var result = $$("contractForm").getValues();
                    if (result.id == "new"){
                        //add new contract for this customer
                        delete result.id;
                        $$("customersContractsList").add(result, 0);
                    }else{
                        //update existing contract
                        $$("customersContractsList").updateItem(result.id, result);
                    }
                    $$("customersContractsList").refresh();
                    $$('newContractWindow').hide();
                }
            }
        ]

    },

    editContract: function(id, e){
        var item_id = $$('customersContractsList').locate(e);
        webix.ui(
            {
                view: "window",
                id: "newContractWindow",
                width:600,
                position: "top",
                head: "Contract nou",
                body: webix.copy(customers.contractForm)
            }
        ).show();
        $$('contractForm').clear();
        $$('contractForm').setValues({"doctype":"CONTRACT"}, true);
        $$('contractForm').setValues($$('customersContractsList').getItem(item_id), true); 
    },

    newContract: function(id,e){
        var item_id = $$('customersList').locate(e); 
        webix.ui(
            {
                view: "window",
                id: "newContractWindow",
                width:600,
                position: "top",
                head: "Contract nou",
                body: webix.copy(customers.contractForm)
            }
        ).show();
        $$('contractForm').clear();
        $$('contractForm').setValues({
            "id":"new", 
            "doctype":"CONTRACT",
            "supplier_id": $$('customersList').getItem(item_id)._id,
            "nume": $$('customersList').getItem(item_id).nume
        }, true);
    },

    ui: {
        id: "page-2",
        cols:[ 
            {
                rows:
                [
                    { view: "template", template: "Customers", type:"header" },
                    {
                        view:"activeList", 
                        id:"customersList",
                        activeContent:{
                            addContractButton:{
                                id:"addContractButtonId",
                                view:"button",
                                type:"icon",
                                icon:"briefcase",
                                width: 32,
                                click:"customers.newContract"
                            },
                            editButton:{
                                id:"editButtonId",
                                view:"button",
                                type: "icon",
                                icon:"pencil-square-o",
                                width: 32,
                                click:"customers.editCustomer"
                            }
                        },
                        //template:"#nume#",
                        template: function(obj, common) {
                            return "<div style='display: flex;justify-content: space-between;'><div><strong>" + obj.nume + "</strong><br/>" +
                                "Adresa: " + obj.adresa.replace(new RegExp('\r?\n','g'), '<br />') + "</br>" + 
                                "CUI: " + obj.CUI + " | Nr. Ord. Reg. Com.: " + obj.NORG + " | TVA EU: " + obj.TVA + "<br/>" +
                                "Banca: " + obj.banca + " - Sucursala: " + obj.sucursala + "<br/>" +
                                "<strong>IBAN: " + obj.IBAN + "</strong></div>" +
                                "<div style='height: 50px; padding-left: 2px;padding-top:1px;'>" +
                                common.editButton(obj, common) + common.addContractButton(obj, common) + "</div></div>";
                        },
                        select:true,
                        //autowidth:true,
                        width: 600,
                        type:{
                            height: 200
                        },
                        on:{
                            "onItemClick": function(id, e, node){
                                var item = this.getItem(id);
                                $$("customersContractsList").filter("#supplier_id#", item._id);
                            }
                        },
                        url: "PouchDB->customer/all",
                        save: "PouchDB->upsert"
                    },
                    { view:"button", type:"icon", icon:"plus-square", label:"Add", width:80, align:"center", click:"customers.newCustomer" }
                ]
            },
            {view:"resizer"},
            {
                rows:
                [
                    { view: "template", template: "Contracts", type:"header" },
                    {
                        view:"activeList", 
                        id: "customersContractsList",
                        type:{//setting item properties, optional
                            height:200
                        },
                        activeContent:{
                            editButton:{
                                id:"editContractButtonId",
                                view:"button",
                                type: "icon",
                                icon:"pencil-square-o",
                                width: 32,
                                click:"customers.editContract"
                            }
                        },
                        template: function(obj, common) { 
                            return "<div style='display: flex;justify-content: space-between;'><div><strong>" + obj.contract + 
                                   "</strong> [<em>" + obj.start_date + "</em> - <em>" + obj.end_date + "</em>]<br/>" +
                                   obj.detalii.replace(new RegExp('\r?\n','g'), '<br />') + "</div>" +
                                   "<div style='height: 50px; padding-left: 2px;padding-top:1px;'>" +
                                   common.editButton(obj, common) + "</div></div>";
                        },
                        select: true,
                        url: "PouchDB->contract/all",
                        save: "PouchDB->upsert"
                    }
                ]
            }
        ]
    }
    
};