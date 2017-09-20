var settings = {

    save: function(){
        var doc = $$("page-1").getValues();
        doc.conturi = [];
        $$("conturi").data.each(function(obj){ delete obj.id; doc.conturi.push(obj); });
        doc.doctype = "SUPPLIER";
        //console.log(doc);
        $.couch.db(DBNAME).saveDoc(doc, {
            success: function(data) {
                //console.log(data);
                $$('page-1').setValues({_id:data.id, _rev:data.rev}, true);
                webix.message("Datele firmei au fost salvate cu succes!");
            },
            error: function(status) {
                console.log(status);
                webix.message({type:"error", text:status});
            }
        });
    },
    
    edit: function(id, e){
        var item_id = $$('conturi').locate(e);
        webix.ui({
            view:"window",
            id: "conturiwindow",
            width:400,
            position:"top",
            head:"Administrare Conturi Bancare",
            body: webix.copy(settings.conturiForm)
        }).show();
        $$('conturiform').clear();
        $$('conturiform').setValues($$('conturi').getItem(item_id));
    },

    delete: function(id, e){
        var item_id = $$('conturi').locate(e);
        $$('conturi').remove(item_id);
        $$('conturi').refresh();
        webix.message("Bank Account Deleted Successfully!");
    },

    add: function(){
        webix.ui({
            view:"window",
            id: "conturiwindow",
            width:400,
            position:"top",
            head:"Administrare Conturi Bancare",
            body: webix.copy(settings.conturiForm)
        }).show();
        $$('conturiform').clear();
        $$('conturiform').setValues({"id":"new"});
    },

    conturiForm: {
        id: "conturiform",			
        view:"form", 
        width:400,

        elements:[
            { view:"text", type:"text", label:"Banca", name:"banca"},
            { view:"text", type:'text', label:"Sucursala", name:"sucursala"},
            { view:"text", type:'text', label:"IBAN", name:"IBAN"},
            { view:"text", type:'text', label:"SWIFT", name:"SWIFT"},
            { view:"text", type:'text', label:"BIC", name:"BIC"},
            { view:"text", type:'text', label:"Valuta", name:"valuta"},
            
            { view:"button", label:"Save" , type:"form", click:function(){
                if (!this.getParentView().validate()){
                    webix.message({ type:"error", text:"Banca, sucursala si IBAN sunt obligatorii!" });
                }else{
                    var result = $$('conturiform').getValues();
                    if (result.id == "new"){
                        delete result.id;
                        $$('conturi').add(result,0);
                        $$('conturi').refresh();
                    }else{
                        $$('conturi').updateItem(result.id, result);
                        $$('conturi').refresh();
                    }
                    $$("conturiform").hide();						
                }
             }
            }
        ],
        rules:{
            "banca":webix.rules.isNotEmpty,
            "sucursala":webix.rules.isNotEmpty,
            "IBAN":webix.rules.isNotEmpty
        }
    },

    ui: {
        id: "page-1",
        view: "form",
        elementsConfig:{ labelWidth: 180 },
        elements:[
            {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii"},
            {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de Ordine in Registrul Comertului"},
            {view:"text", name:"EUNORG", label:"NORC European", placeholder:"Numar de ordine European in Registrul Comertului"},
            {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare"},
            {view:"text", name:"TVA" ,label:"TVA EU", placeholder:"TVA European"},            
            {view:"textarea", name:"adresa" , label:"Adresa", height:110, labelPosition:"left", 
                placeholder: "Str. , Nr. , Bl., Sc., Apt., Cod Postal, Localitatea, Comuna, Judetul/Sector, Tara" 
            },

            { view:"forminput", label:"Conturi", 
                body:{
                    rows:[
                        {
                            view:"activeList",autoheight:true, autowidth:true, select:true, id:"conturi",
                            type:{
                                height:58
                            },
                            activeContent:{
                                deleteButton:{
                                    id:"deleteButtonId",
                                    view:"button",
                                    type:"icon",
                                    icon:"trash-o",
                                    width: 32,
                                    click:"settings.delete"
                                },
                                editButton:{
                                    id:"editButtonId",
                                    view:"button",
                                    type: "icon",
                                    icon:"pencil-square-o",
                                    width: 32,
                                    click:"settings.edit"
                                }
                            },
                            template: "<div style='overflow: hidden;float:left;'>Banca: #banca#, Sucursala: #sucursala#" +
                                "<br/>IBAN: #IBAN# SWIFT: #SWIFT# BIC: #BIC# [#valuta#]</div>" +
                                "<div style='height: 50px; padding-left: 10px;padding-top:10px;float:right;'>{common.deleteButton()}</div>" +
                                "<div style='height: 50px; padding-left: 10px;padding-top:10px;float:right;'>{common.editButton()}</div>"
                        },
                        {view:"button", type:"icon", icon:"plus-square", label: "Add", width: 80, click: "settings.add"}
                    ]
                }
            },
            {view:"button", type:"form", value:"SAVE", width: 100, click: "settings.save()"}
        ]
    }
};