var settings = {

    save: function(){
        var doc = $$("page-1").getValues();
        doc.doctype = "SUPPLIER";
        //console.log(doc);
        $.couch.db(DBNAME).saveDoc(doc, {
            success: function(data) {
                //console.log(data);
                $$('page-1').setValues({_id:data.id, _rev:data.rev}, true);
            },
            error: function(status) {
                console.log(status);
            }
        });
    },
    
    ui: {
        id: "page-1",
        view: "form",
        elements:[
            {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii", labelWidth:180},
            {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de ordine in Registrul Comertului", labelWidth:180},
            {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare", labelWidth:180},
            {view:"textarea", name:"adresa" , label:"Adresa", height:110, labelPosition:"top", placeholder: "Strada , Nr. , Apt. \nLocalitatea, Judetul, Cod Postal" },
            {view:"text", name:"banca", label:"Banca", placeholder:"Banca", labelWidth:180},
            {view:"text", name:"sucursala", label:"Sucursala", placeholder:"Sucursala bancii", labelWidth:180},
            {view:"text", name:"IBAN", label:"IBAN", placeholder:"IBAN", labelWidth:180},
            {view:"button", name:"submit", value:"SAVE", click: "settings.save()"}
        ]
    }
};