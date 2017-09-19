var invoice = {
    
    localData:{
        SERIA:"",
        NUMARUL:"",
        FURNIZOR:{},
        BENEFICIAR:{},
        TVA:0.00,
        INVOICE_DATE:"",
        DUE_DATE:"",
        CURS_BNR:{
            data:"",
            eur_ron:0.00
        },
        INVOICE_LINE:[],
        INVOICE_SUM:0.00,
        INVOICE_TVA_SUM:0.00,
        INVOICE_TOTAL:0.00
    },
  
    setlocalData: function(createNewInvoice){
        //clean-up existing data
        invoice.localData = {
            SERIA:"",
            NUMARUL:"",
            FURNIZOR:{},
            BENEFICIAR:{},
            TVA:0.00,
            INVOICE_DATE:"",
            DUE_DATE:"",
            CURS_BNR:{
                data:"",
                eur_ron:0.00
            },
            INVOICE_LINE:[],
            INVOICE_SUM:0.00,
            INVOICE_TVA_SUM:0.00,
            INVOICE_TOTAL:0.00
        };
        
        //get supplier data        
        var promise_supplier = webix.ajax(SERVER_URL+DBNAME+"/" + $$("invoiceForm").getValues().supplier);
        //get customer data
        var promise_customer = webix.ajax(SERVER_URL+DBNAME+"/" + $$("customer_contract").getSelectedItem().supplier_id);
        var promise_invoice_no = null;
        //get new invoice number if createNewInvoice = true
        if(createNewInvoice){
            promise_invoice_no = webix.ajax().put(SERVER_URL + DBNAME + '/_design/config/_update/sn' +LOAD_URL[4]);
        }else{
            promise_invoice_no = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[4]);
        }
        
        webix.promise.all([promise_supplier, promise_customer, promise_invoice_no]).then(function(realdata){
            var result = realdata[2].json();
            invoice.localData.FURNIZOR = realdata[0].json();
            invoice.localData.BENEFICIAR = realdata[1].json();
            if(createNewInvoice){
                invoice.localData.SERIA = result.doc.SERIA;
                invoice.localData.NUMARUL = result.doc.NUMARUL;
            }else{
                $$("invoiceForm").setValues({"serial_number":result.SERIA + " " + result.NUMARUL}, true);
                invoice.localData.SERIA = result.SERIA;
                invoice.localData.NUMARUL = result.NUMARUL;
            };
            
            var form_data = $$('invoiceForm').getValues();
            
            invoice.localData.TVA = (typeof form_data.TVA === 'string')?parseFloat(form_data.TVA):form_data.TVA;
            invoice.localData.CURS_BNR.data = form_data.invoice_date;
            invoice.localData.CURS_BNR.eur_ron = (typeof form_data.exchange_rate === 'string')?parseFloat(form_data.exchange_rate):form_data.exchange_rate;
            
            invoice.localData.INVOICE_DATE = form_data.invoice_date;
            invoice.localData.DUE_DATE = form_data.due_date;
            
            //TODO - Add iterator for multiple invoice lines. Change the form control in a grid
            var invoice_line_item = {};
            
            invoice_line_item.details = form_data.invoice_details;
            invoice_line_item.um = form_data.invoice_mu;
            invoice_line_item.qty = form_data.invoice_qty;
            invoice_line_item.up = eval(form_data.invoice_formula);
            invoice_line_item.line_value = invoice_line_item.up;
            invoice_line_item.line_tva = (invoice_line_item.line_value*invoice.localData.TVA)/100.00;
            //Add this line to line array
            invoice.localData.INVOICE_LINE.push(invoice_line_item);
            
            invoice.localData.INVOICE_SUM += invoice_line_item.line_value;
            invoice.localData.INVOICE_TVA_SUM += invoice_line_item.line_tva;
            invoice.localData.INVOICE_TOTAL += (invoice.localData.INVOICE_SUM + invoice.localData.INVOICE_TVA_SUM);
            
            if (createNewInvoice){
                //TODO - Save the document, it has new invoice number
                var doc = webix.copy(invoice.localData);
                doc.doctype = "INVOICE";
                $.couch.db(DBNAME).saveDoc(doc, {
                    success: function(data) {
                        console.log(data);
                        webix.message("Factura " + invoice.localData.SERIA + " - " + invoice.localData.NUMARUL +
                                      " a fost salvata in baza de date cu succes!");
                    },
                    error: function(status) {
                        console.log(status);
                    }
                });
            }
            
            invoice.generatePDF();
            
        }).fail(function(err){
            //error
        })
    },
    
    generatePDF: function(){
        
        PDF_DOC = {
            // a string or { width: number, height: number }
            pageSize: 'A4',

            // by default we use portrait, you can change it to landscape if you wish
            pageOrientation: 'portrait',

            // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
            pageMargins: [ 40, 60 ],
            
            content: [
                {
                    columns:[
                        {
                            width: '50%',
                            text: 'Exemplarul nr. 1'
                        },
                        {
                            width: '50%',
                            text:[
                                'SERIA: ',
                                {text:invoice.localData.SERIA, fontSize:13, bold:true},
                                ' NR.: ',
                                {text:''+invoice.localData.NUMARUL, fontSize:13, bold:true}
                            ],
                            alignment:'right'
                        }
                    ]
                },
                '\n\n',
                {text:'FACTURA FISCALA', style:'header'},
                '\n\n',
                {
                    columns:[
                        {
                            width: '47%',
                            text: [
                                'FURNIZOR:\n',
                                { text: invoice.localData.FURNIZOR.nume + '\n', bold:true},
                                'Nr.Ord.Reg.Com.: ' + invoice.localData.FURNIZOR.NORG + '\n',
                                'C.U.I: ' + invoice.localData.FURNIZOR.CUI + '\n',
                                'Sediul: ' + invoice.localData.FURNIZOR.adresa + '\n',
                                'Banca: ' + invoice.localData.FURNIZOR.banca + ' - Sucursala ' + invoice.localData.FURNIZOR.sucursala + '\n',
                                'Cod IBAN: ' + invoice.localData.FURNIZOR.IBAN
                            ]
                        },
                        {
                          width: '6%',
                            text:''
                        },
                        {
                            width: '47%',
                            text: [
                                'BENEFICIAR:\n',
                                {text: invoice.localData.BENEFICIAR.nume + '\n', bold:true},
                                'Nr.Ord.Reg.Com.: ' + invoice.localData.BENEFICIAR.NORG + '\n',
                                'C.U.I: ' + invoice.localData.BENEFICIAR.CUI + '\n',
                                'Sediul: ' + invoice.localData.BENEFICIAR.adresa + '\n',
                                'Banca: ' + invoice.localData.BENEFICIAR.banca + ' - Sucursala ' + invoice.localData.BENEFICIAR.sucursala + '\n',
                                'Cont IBAN: ' + invoice.localData.BENEFICIAR.IBAN
                            ]
                        }
                    ]                    
                },
                '\n\n',
                {
                    columns:[
                        {
                            width: '33%',
                            text: ''
                        },
                        {
                            table: {
                                body: [
                                        [{text:'Numar factura: ' + invoice.localData.NUMARUL , style: 'tableCell'}],
                                        [{text:'Data emiterii: ' + invoice.localData.INVOICE_DATE , style: 'tableCell'}],
                                        [{text:'Data scadentei: ' + invoice.localData.DUE_DATE, style: 'tableCell'}]
                                ],
                                widths:[180]
                            }        
                        },
                        {
                            width: '33%',
                            text: ''
                        }
                        
                    ]
                    
                },
                '\n\n',
                {
                    columns:[
                        {
                            width: '50%',
                            text: 'Cota TVA = ' + invoice.localData.TVA + "%"
                        },
                        {
                            width: '50%',
                            text:'Curs BNR din '+ invoice.localData.CURS_BNR.data +': 1EUR = ' +
                            invoice.localData.CURS_BNR.eur_ron +' RON',  
                            alignment:'right'
                        }
                    ]
				},
                '\n',
                {
                    table: {
                            widths: [15, '*', 15, 20, 50, 50, 50],
                            body: [
                                [ 
                                    {text:'Nr. crt.', style:'tableHeader'}, 
                                    {text:'Denumirea produselor sau a serviciilor', style:'tableHeader'}, 
                                    {text:'UM', style:'tableHeader'}, 
                                    {text:'Cant.', style:'tableHeader'},
                                    {text:'Pret unitar (fara TVA)', style:'tableHeader'},
                                    {text:'Valoarea', style:'tableHeader'},
                                    {text:'Valoarea TVA', style:'tableHeader'}
                                ],
                                [ 
                                    {text:'0', style:'tableHeader'}, 
                                    {text:'1', style:'tableHeader'},
                                    {text:'2', style:'tableHeader'},
                                    {text:'3', style:'tableHeader'},
                                    {text:'4', style:'tableHeader'},
                                    {text:'5', style:'tableHeader'},
                                    {text:'6', style:'tableHeader'}
                                ],
                                [ 
                                    {text:'1', alignment:'center'}, 
                                    {text:invoice.localData.INVOICE_LINE[0].details
                                    },
                                    {text:''+invoice.localData.INVOICE_LINE[0].um, alignment:'center'},
                                    {text:''+invoice.localData.INVOICE_LINE[0].qty, alignment:'center'},
                                    {text:''+invoice.localData.INVOICE_LINE[0].up.toFixed(2), alignment:'right'},
                                    {text:''+invoice.localData.INVOICE_LINE[0].line_value.toFixed(2), alignment:'right'},
                                    {text:''+invoice.localData.INVOICE_LINE[0].line_tva.toFixed(2), alignment:'right'}
                                ],
                                [
                                    {colSpan:4, rowSpan:2, text:' '},
                                    '','','',
                                    {text: 'TOTAL', bold:true, alignment:'center'},
                                    {text: ''+invoice.localData.INVOICE_SUM.toFixed(2), bold:true, alignment:'right'},
                                    {text: ''+invoice.localData.INVOICE_TVA_SUM.toFixed(2), bold:true, alignment:'right'}
                                ],
                                [
                                    '','','','',
                                    {text: 'TOTAL DE PLATA', bold:true, fontSize:13, alignment:'center'},
                                    {colSpan:2, text:"\n" + invoice.localData.INVOICE_TOTAL.toFixed(2) , bold:true, fontSize:13, alignment:'center'}
                                ]
                            ]
                    }
				},
                '\n\n',
                {
                    widths: ['*'],
                    table: {
                        body: [
                            [
                                {
                                    text:[
                                        'Termen de plata: ',
                                        {text: ''+invoice.localData.DUE_DATE + '\n', bold:true},
                                        'Nota: Pentru ordinul de plata, va rog sa treceti la descrierea platii: ',
                                        {text: invoice.localData.SERIA + "-" + invoice.localData.NUMARUL , bold:true}
                                    ] , 
                                    margin: [5, 5, 33, 5], 
                                    fontSize:13
                                }
                            ]
                        ]
                    }
                },
                '\n\n',
                {
                    columns:[
                        {
                            width: '50%',
                            text: 'Semnatura si stampila furnizorului'
                        },
                        {
                            width: '50%',
                            text:'Semnatura de primire beneficiar',  
                            alignment:'right'
                        }
                    ]
                }
            ],
            styles: {
                header: {
                    bold:true, 
                    fontSize: 18, 
                    alignment: 'center'
                },
                tableHeader: {
                    color: 'black',
                    alignment: 'center'
                },
                tableCell: {
                    margin: [3, 5, 3, 5]
                },
            },
            defaultStyle: {
                // alignment: 'justify'
                fontSize: 10
            }
        };
        
        pdfMake.createPdf(PDF_DOC).getDataUrl(function(outDoc) {
            $$("frame-body").load(outDoc);
        });  
    },

    confirmNew: function(){
        
        webix.confirm({
            title:"Create new INVOICE",
            ok:"Create", 
            cancel:"PREVIEW",
            type:"confirm-error",
            text:"Please confirm that<br/>you want to create<br/>NEW invoice!",
            callback:function(result){ //setting callback
                invoice.setlocalData(result);
           }
        });
    },
    
    ui: {
        id: "page-4",
        cols:[
            {
                id:"invoiceForm",
                view: "form",
                scroll:'y',
                minWidth:300,
                elements:[
                    {view:"counter", step:1, value:1, min:1, max:5, name:"copies", label:"Numarul de copii:", labelWidth:180},
                    {view:"text", name:"serial_number", label:"Seria-Nr.:", placeholder:"get the current serial number", readonly:true, labelWidth:180},
                    {view:"combo", name:"supplier", label:"Furnizor:", labelWidth:180, options:"CouchDB->../../_design/supplier/_list/toja/getsuppliername"},
                    {view:"unitlist", id:"customer_contract", name:"customer_contract", label:"Beneficiar:", labelWidth:180,
                        sort:{
                            by:"#nume#",
                            dir:"asc"
                        },
                        uniteBy:function(obj){
                            return obj.nume; 
                        },
                        type:{//setting item properties, optional
                            height:60,
                            headerHeight:30,
                        },
                        height:'auto',
                        template:"#contract# din data de #start_date# (exp.: #end_date#)<br/>#detalii#",
                        select: true,
                        url: "CouchDB->../../_design/contract/_list/toja/getcontract"
                    },
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"invoice_date",label:"Data emiterii:", placeholder:"select date of issue", labelWidth:180},
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"due_date", label:"Data scadentei:", placeholder:"select payment due date", labelWidth:180},
                    {view:"text", name:"TVA", label:"TVA:", placeholder:"input VAT value", labelWidth:180},
                    {view:"text", name:"exchange_rate", label:"Curs BNR:", placeholder:"BNR exchage rate EUR->RON at invoice date", labelWidth:180},
                    {view:"textarea", name:"invoice_details", label:"Detalii factura:", placeholder:"input the description of services or goods invoiced", labelWidth:180, height:110, labelPosition:"top",},
                    {view:"text", name:"invoice_mu", label:"UM:", placeholder:"measuring unit", labelWidth:180},
                    {view:"text", name:"invoice_qty", label:"Cantitatea:", placeholder:"quantity", labelWidth:180},
                    {view:"textarea", name:"invoice_formula", label:"Formula de calcul:", placeholder:"ammount calculation - formula", labelWidth:180, height:110, labelPosition:"top",},
                    {view:"button", value:"CREATE INVOICE", click:"invoice.confirmNew();"}
                ]
            },
            {view:"resizer"},
            {
                view:"iframe", 
                id:"frame-body", 
                src:""
            }
        ]
    }
    
};