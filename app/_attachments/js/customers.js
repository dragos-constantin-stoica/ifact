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
                        width: 400,
                        url: "CouchDB->../../_design/globallists/_list/toja/customer/getcustomer",
                        save: "CouchDB->../../_design/customer/_update/rest"
                    },
                    { 
                        view:"button", label:"New", width:100, align:"center", click: function(){
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
                //width: 600,
                elementsConfig:{ labelWidth: 180, minWidth:300 },
                elements:[
                    {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii"},
                    {view:"text", name:"NORG", label:"Nr. Ord. Reg. Com.", placeholder:"Numar de Ordine in Registrul Comertului"},
                    {view:"text", name:"CUI" ,label:"C.U.I", placeholder:"Cod Unic de Identificare"},
                    {view:"textarea", name:"adresa" , label:"Adresa", height:110, 
                        placeholder: "Str. , Nr. , Bl., Sc., Apt., Cod Postal, Localitatea, Comuna, Judetul/Sector, Tara" },
                    {view:"text", name:"banca", label:"Banca", placeholder:"Banca"},
                    {view:"text", name:"sucursala", label:"Sucursala", placeholder:"Sucursala bancii"},
                    {view:"text", name:"IBAN", label:"IBAN", placeholder:"IBAN"},
                    {view:"button", type:"form", value:"SAVE", align:"center", click: '$$("customersForm").save()'}
                ]
            }
        ]
    }
    
};