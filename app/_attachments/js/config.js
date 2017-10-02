var config = {
  
    save: function(){
        var doc = $$("configForm").getValues();
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
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('configForm').setValues(msg.doc);
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
                    var msg = data.json();
                    if('action' in msg){
                        msg.doc._id = xhr.getResponseHeader('X-Couch-Id');
                        msg.doc._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        $$('configForm').setValues(msg.doc);
                    }
				}
			);
        }
        
    },

    export: function(){
        

        var promise_xls = webix.ajax(SERVER_URL + DBNAME + "/_design/globallists/_list/toxls/config/export2Excel");

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
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "invoices.xlsx");
            
        }).fail(function(err) {
            //error
            webix.message({ type: "error", text: err });
            console.log(err);
        });
    },
    
    ui: {
        id: "page-6",
        rows:[
            {
                view: "form",
                id: "configForm",
                elements:[
                    { view:"fieldset", label:"Serii Facturi", body:{
                        rows:[
                            { view:"text", label:"SERIA:", placeholder:"Seria", name:"SERIA", labelWidth:180},
                            { view:"counter", label:"NUMARUL:", step:1, min:0, name:"NUMARUL", labelWidth:180}    
                        ]
                        }
                    },
                    {view:"button", label:"SAVE", click:'config.save()'}
                ]
            },
            {
                view: "form", 
                id: "exportForm",
                elements:[
                    { view:"button", label:"Export to Excel", click:'config.export'}
                ]
            }
        ]
    }
    
};