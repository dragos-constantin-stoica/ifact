var config = {
  
    save: function(){
        var doc = $$("page-6").getValues();
        doc.doctype = "INVOICE_CFG";
        
        if (typeof doc._id !== 'undefined'){
        
            webix.ajax().header({
                    "Content-type":"application/json"
            }).post("../../_design/config/_update/sn/" + doc["_id"], JSON.stringify(doc), 
                function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json()
                    if('action' in msg){
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('page-6').setValues(msg.doc);
                    }
                }
            );
        }else{
            webix.ajax().header({
			    "Content-type":"application/json"
			}).post("../../_design/config/_update/sn/", JSON.stringify(doc), 
				function(text, data, xhr){
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json()
                    if('action' in msg){
                        msg.doc._id = xhr.getResponseHeader('X-Couch-Id');
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('page-6').setValues(msg.doc);
                    }
				}
			);
        }
        
    },
    
    ui: {
        id: "page-6",
        view: "form",
        elements:[
            { view:"fieldset", label:"Serii Facturi", body:{
                 rows:[
                    { view:"text", label:"SERIA:", placeholder:"Seria", name:"SERIA", labelWidth:180},
                    { view:"counter", label:"NUMARUL:", step:1, min:0, name:"NUMARUL", labelWidth:180}    
                 ]
                 }
            },
            {view:"button", value:"SAVE", click:'config.save()'}
        ]
    }
    
};