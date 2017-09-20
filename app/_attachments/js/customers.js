var customers = {
  
    ui: {
        id: "page-2",
        cols:[ 
            {
                rows:
                [
                    {
                        view:"list", 
                        id:"customersList",
                        template:"#nume#",
                        select:true,
                        //autowidth:true,
                        minWidth:100,
                        url: "CouchDB->../../_design/globallists/_list/toja/customer/getcustomer",
                        save: "CouchDB->../../_design/customer/_update/rest"
                    },
                    { 
                        view:"button", label:"New", click: function(){
                            var itemID = $$('customersList').add({nume:"Client nou"},0);
                            $$('customersList').select(itemID);
                        }
                    }
                ]
            },
            {view:"resizer"},
            {
                id: "customersForm",
                view: "form",
                elements:[
                    {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii", labelWidth:180},
                    {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de ordine in Registrul Comertului", labelWidth:180},
                    {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare", labelWidth:180},
                    {view:"textarea", name:"adresa" , label:"Adresa", height:110, labelPosition:"top", placeholder: "Strada , Nr. , Apt. \nLocalitatea, Judetul, Cod Postal" },
                    {view:"text", name:"banca", label:"Banca", placeholder:"Banca", labelWidth:180},
                    {view:"text", name:"sucursala", label:"Sucursala", placeholder:"Sucursala bancii", labelWidth:180},
                    {view:"text", name:"IBAN", label:"IBAN", placeholder:"IBAN", labelWidth:180},
                    {view:"button", name:"submit", value:"SAVE", click: '$$("customersForm").save()'}
                ]
            }
        ]
    }
    
};