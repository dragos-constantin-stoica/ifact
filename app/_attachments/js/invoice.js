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
                            widths: [15, '*', 20, 25, 50, 50, 50],
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
                    
                    table: {
                        widths: ['*'],
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
   
    ui: {
        id: "page-4",
        cols:[
            {
                id:"invoiceForm",
                view: "form",
                scroll:'y',
                minWidth:500,
                elementsConfig:{ labelWidth: 180 },
                elements:[
                    {view:"counter", step:1, value:1, min:1, max:5, name:"copies", label:"Numarul de copii:"},
                    {view:"text", name:"serial_number", label:"Seria-Nr.:", placeholder:"get the current serial number", readonly:true},
                    {view:"combo", name:"supplier", label:"Furnizor:", 
                        options:"CouchDB->../../_design/globallists/_list/toja/supplier/getsuppliername"},
                    {view:"unitlist", id:"customer_contract", name:"customer_contract", label:"Beneficiar:",
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
                        url: "CouchDB->../../_design/globallists/_list/toja/contract/getcontract"
                    },
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"invoice_date",label:"Data emiterii:", 
                    placeholder:"data emiterii facturii"},
                    {view:"datepicker", stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name:"due_date", label:"Data scadentei:", 
                    placeholder:"data scadenta"},
                    {view:"text", name:"TVA", label:"TVA:", placeholder:"TVA in procente"},
                    {view:"text", name:"exchange_rate", label:"Curs BNR:", placeholder:"Cursul BNR pentru €$£->RON la data emiterii facturii"},
                    {view:"textarea", name:"invoice_details", label:"Detalii factura:", 
                    placeholder:"descrierea bunurilor si a serviciilor", height:110},
                    {view:"text", name:"invoice_mu", label:"UM:", placeholder:"unitatea de masura"},
                    {view:"text", name:"invoice_qty", label:"Cantitatea:", placeholder:"cantiatea"},
                    {view:"textarea", name:"invoice_formula", label:"Formula de calcul:", placeholder:"formula de calcul a sumei toatale", height:110},
                    { margin: 10, cols:[
                        {view:"button",type:"danger",  value:"CREATE INVOICE", click:"invoice.setlocalData(true);"},
                        {view:"button", type:"form",  value:"Preview", click:"invoice.setlocalData(false);"}
                    ]}
                    
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