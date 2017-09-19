var contracts = {

    contractForm: {
        id: "newContractForm",
        view: "form",
        width: 400,
        elements:[
            {
                view:"combo", name:"newnume", label:"Customer",
                options:"CouchDB->../../_design/customer/_list/toja/getcustomername"
            },
            {view:"text", name:"newcontract", label:"Contract", value:""}
            ,                                      
            {view:"button", label:"CREATE", type:"form", click: function(){
                    var name = $$('newnume').getInputNode().value;
                    var supplier_id = $$('newnume').getValue();
                    var contract = $$('newContractForm').getValues().newcontract;
                    var itemID = $$('contractList').add({
                        nume: name, 
                        supplier_id: supplier_id,
                        contract: contract, 
                        start_date: myDateFormat(new Date()),
                        end_date: myDateFormat(new Date())
                    },false);
                    $$('contractList').select(itemID);
                    $$('newContractWindow').hide();
                }
            }
        ]
    },
    
    contractWindow: function(){
        //Select customer name from a prepopulated drop down list
        
        webix.ui(
            {
                view: "window",
                id: "newContractWindow",
                width:400,
                position: "top",
                head: "Contract nou",
                body: webix.copy(contracts.contractForm)
            }
        ).show();
        
    },
    
    ui: {
        id: "page-3",
        cols:[
            {
                rows:[
                    {
                        view:"unitlist", 
                        id: "contractList",
                        sort:{
                            by:"#nume#",
                            dir: 'asc'
                        },
                        uniteBy:function(obj){
                            return obj.nume; 
                        },
                        type:{//setting item properties, optional
                            height:60,
                            headerHeight:30,
                        },
                        template:"#contract#</br>#start_date# - #end_date#",
                        select: true,
                        url: "CouchDB->../../_design/contract/_list/toja/getcontract",
                        save: "CouchDB->../../_design/contract/_update/rest"
                    },
                    {
                        view:"button", label:"NEW", click: "contracts.contractWindow();"
                    }
                ]
            },       
            {view:"resizer"},
            {
                id:"contractForm",
                view: "form",
                elements:[
                    {view:"text", name:"nume", label:"Nume", placeholder:"Numele societatii", labelWidth:180, readonly:true},
                    {view:"text", name:"contract", label:"Contract", placeholder:"Contract", labelWidth:180},
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"start_date", label:"Data inceput", placeholder:"Data inceput", labelWidth:180},
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"end_date", label:"Data incheiere", placeholder:"Data sfarsit", labelWidth:180},
                    {view:"textarea", name:"detalii", label:"Detalii", height:110, labelPosition:"top", placeholder:"Detalii despre contract: facturare, rate etc"},
                    {view:"button", name:"submit", value:"SAVE", click:'$$("contractForm").save();'}
                ]
            }
        ]
    }
    
};