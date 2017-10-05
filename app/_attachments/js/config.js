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
            },
            {
                cols: [
                    {
                        rows:[
                            {
                                view: "template",
                                template: "Year to Date invoiced vs. payed RON",
                                type:"header"
                            },
                            {
                                view:"chart",
                                type:"line",
                                preset:"simple",
                                xAxis:{ template:"#year#", title:"Month"},
                                yAxis:{ title:"Amount (RON)"},
                                legend:{
                                    values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                    align:"right",
                                    valign:"middle",
                                    layout:"y",
                                    width: 100,
                                    margin: 8
                                },
                                series:[
                                    {
                                        value:"#sales3#",
                                        item:{
                                            borderColor: "#1293f8",
                                            color: "#ffffff"
                                        },
                                        line:{
                                            color:"#1293f8",
                                            width:3
                                        },
                                        tooltip:{
                                            template:"#sales3#"
                                        }
                                    },
                                    {
                                        value:"#sales2#",
                                        item:{
                                            borderColor: "#66cc00",
                                            color: "#ffffff"
                                        },
                                        line:{
                                            color:"#66cc00",
                                            width:3
                                        },
                                        tooltip:{
                                            template:"#sales2#"
                                        }
                                    }
                                ],
                                data:  [
                                    { sales:"20", sales2:"35", sales3:"55", year:"02" },
                                    { sales:"40", sales2:"24", sales3:"40", year:"03" },
                                    { sales:"44", sales2:"20", sales3:"27", year:"04" },
                                    { sales:"23", sales2:"50", sales3:"43", year:"05" },
                                    { sales:"21", sales2:"36", sales3:"31", year:"06" },
                                    { sales:"50", sales2:"40", sales3:"56", year:"07" },
                                    { sales:"30", sales2:"65", sales3:"75", year:"08" },
                                    { sales:"90", sales2:"62", sales3:"55", year:"09" },
                                    { sales:"55", sales2:"40", sales3:"60", year:"10" },
                                    { sales:"72", sales2:"45", sales3:"54", year:"11" }
                                ]
                                
                            }
                        ]},
                        {
                        rows:[
                            {
                                view: "template",
                                template: "Year to Date invoiced vs. payed EUR",
                                type:"header"
                            },
                            {
                                view:"chart",
                                type:"line",
                                preset:"simple",
                                xAxis:{ template:"#year#", title:"Month"},
                                yAxis:{ title:"Amount (EUR)"},
                                legend:{
                                    values:[{text:"Invoiced",color:"#1293f8"},{text:"Payed",color:"#66cc00"}],
                                    align:"right",
                                    valign:"middle",
                                    layout:"y",
                                    width: 100,
                                    margin: 8
                                },
                                series:[
                                    {
                                        value:"#sales#",
                                        item:{
                                            borderColor: "#1293f8",
                                            color: "#ffffff"
                                        },
                                        line:{
                                            color:"#1293f8",
                                            width:3
                                        },
                                        tooltip:{
                                            template:"#sales#"
                                        }
                                    },
                                    {
                                        value:"#sales2#",
                                        item:{
                                            borderColor: "#66cc00",
                                            color: "#ffffff"
                                        },
                                        line:{
                                            color:"#66cc00",
                                            width:3
                                        },
                                        tooltip:{
                                            template:"#sales2#"
                                        }
                                    }
                                ],
                                data:  [
                                    { sales:"20", sales2:"35", sales3:"55", year:"02" },
                                    { sales:"40", sales2:"24", sales3:"40", year:"03" },
                                    { sales:"44", sales2:"20", sales3:"27", year:"04" },
                                    { sales:"23", sales2:"50", sales3:"43", year:"05" },
                                    { sales:"21", sales2:"36", sales3:"31", year:"06" },
                                    { sales:"50", sales2:"40", sales3:"56", year:"07" },
                                    { sales:"30", sales2:"65", sales3:"75", year:"08" },
                                    { sales:"90", sales2:"62", sales3:"55", year:"09" },
                                    { sales:"55", sales2:"40", sales3:"60", year:"10" },
                                    { sales:"72", sales2:"45", sales3:"54", year:"11" }
                                ]
                                
                            }
                        ]
                    }
                ]

            }
        ]
    }
    
};