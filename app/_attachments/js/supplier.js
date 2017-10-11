var supplier = {

    export: function(){  

        var promise_xls = webix.ajax(SERVER_URL + DBNAME + "/_design/globallists/_list/toxls/charts/export2Excel");

        promise_xls.then(function(realdata) {
            //success
            /* original data */
            var data = realdata.json();
            var ws_name = "Invoices";
            
            function Workbook() {
                if(!(this instanceof Workbook)) return new Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            }
            
            var wb = new Workbook(),  ws = XLSX.utils.aoa_to_sheet(data);
            
            /* add worksheet to workbook */
            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
            
            function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "financialstatement.xlsx");
            
        }).fail(function(err) {
            //error
            webix.message({ type: "error", text: err });
            console.log(err);
        });
    },

    //TODO - export all entities in JSON format
    exportJSON: function(){

    },

    //TODO - import all entities from a JSON file
    importJSON: function(){

    },

    //TODO - sync data with another CouchDB replication protocol aware database, like Cloudant
    sync: function(){

    },

    saveseriifacturi: function(){
        var doc = $$("page-1").getValues().INVOICE_CFG;
        doc.doctype = "INVOICE_CFG";
        
        if (typeof doc._id !== 'undefined'){
        
            webix.ajax().header({
                    "Content-type":"application/json"
            }).post(SERVER_URL + DBNAME + "/_design/config/_update/sn/" + doc._id, JSON.stringify(doc), 
                function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    webix.message("Informatia despre seria si numarul a fost salvata cu succes!");
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('page-1').setValues({INVOICE_CFG:msg.doc}, true);
                    }
                }
            );
        }else{
            webix.ajax().header({
			    "Content-type":"application/json"
			}).post(SERVER_URL + DBNAME + "/_design/config/_update/sn/", JSON.stringify(doc), 
				function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    webix.message("Informatia despre seria si numarul a fost salvata cu succes!");
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._id = xhr.getResponseHeader('X-Couch-Id');
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('page-1').setValues({INVOICE_CFG: msg.doc},true);
                    }
				}
			);
        }
        
    },

    save: function(){
        var doc = $$("page-1").getValues();
        doc.conturi = [];
        $$("conturi").data.each(function(obj){ 
            var cpy = {};
            for (var key in obj) {
                cpy[key] = obj[key];
            }
            delete cpy.id; 
            doc.conturi.push(cpy); 
        });
        if (typeof doc.INVOICE_CFG !== 'undefined') delete doc.INVOICE_CFG;
        if (typeof doc.submit !== 'undefined') delete doc.submit;
        
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
            body: webix.copy(supplier.conturiForm)
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
            body: webix.copy(supplier.conturiForm)
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
        scroll: 'y',
        complexData:true,
        elementsConfig:{ labelWidth: 180 },
        elements:[
                { template:"Date Furnizor", type:"section"},
                {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii"},
                {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de Ordine in Registrul Comertului"},
                {view:"text", name:"EUNORG", label:"NORC European", placeholder:"Numar de ordine European in Registrul Comertului"},
                {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare"},
                {view:"text", name:"TVA" ,label:"TVA EU", placeholder:"TVA European"},            
                {view:"textarea", name:"adresa" , label:"Adresa", height:110,  
                    placeholder: "Str. , Nr. , Bl., Sc., Apt., Cod Postal, Localitatea, Comuna, Judetul/Sector, Tara" 
                },

                { view:"forminput", label:"Conturi", 
                    body:{
                        rows:[
                            {
                                view:"activeList",autoheight:true, autowidth:true, id:"conturi",
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
                                        click:"supplier.delete"
                                    },
                                    editButton:{
                                        id:"editButtonId",
                                        view:"button",
                                        type: "icon",
                                        icon:"pencil-square-o",
                                        width: 32,
                                        click:"supplier.edit"
                                    }
                                },
                                template: "<div style='overflow: hidden;float:left;'>Banca: #banca#, Sucursala: #sucursala#" +
                                    "<br/>IBAN: #IBAN# SWIFT: #SWIFT# BIC: #BIC# [#valuta#]</div>" +
                                    "<div style='height: 50px; padding-left: 10px;padding-top:10px;float:right;'>{common.deleteButton()}</div>" +
                                    "<div style='height: 50px; padding-left: 10px;padding-top:10px;float:right;'>{common.editButton()}</div>"
                            },
                            {view:"button", type:"icon", icon:"plus-square", label: "Add", width: 80, click: "supplier.add"}
                        ]
                    }
                },
                {view:"button", type:"form", label:"SAVE", align:"center", width: 100, click: "supplier.save"},

                {template:"Serii facturi", type:"section"},
                { view:"text", label:"SERIA:", placeholder:"Seria", name:"INVOICE_CFG.SERIA"},
                { view:"counter", label:"NUMARUL:", step:1, min:0, name:"INVOICE_CFG.NUMARUL"},
                { view:"button", label:"SAVE", type:"danger", width: 100, align:"center", click:'supplier.saveseriifacturi'}, 

                { template:"Export/Import date ", type:"section"},
                { view:"button", type:"iconButton", icon:"file-excel-o", autowidth:true, align:"center", label:"Export Finacial Statement to Excel", click:'supplier.export'},
                { view:"button", type:"iconButton", icon:"", autowidth:true, align:"center", label:"Export Entities to JSON", click:'supplier.exportJSON'},
                { view:"button", type:"iconButton", icon:"", autowidth:true, align:"center", label:"Import Entities from JSON", click:'supplier.importJSON'},
                { view:"button", type:"iconButton", icon:"", autowidth:true, align:"center", label:"Sync with Cloud", click:'supplier.sync'}                
               
        ]
    }
};