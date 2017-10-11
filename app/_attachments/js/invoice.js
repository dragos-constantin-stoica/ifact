var invoice = {

    localData: {
        COPIES: 1,
        TEMPLATE: 1,
        SERIA: "",
        NUMARUL: "",
        FURNIZOR: {},
        BENEFICIAR: {},
        TVA: 0.00,
        INVOICE_DATE: "",
        DUE_DATE: "",
        CURS_BNR: {
            data: "",
            eur_ron: 0.00
        },
        INVOICE_LINE: [],
        INVOICE_SUM: 0.00,
        INVOICE_TVA_SUM: 0.00,
        INVOICE_TOTAL: 0.00
    },

    setlocalData: function(createNewInvoice) {
        //clean-up existing data
        invoice.localData = {
            COPIES: 1,
            TEMPLATE: 1,
            SERIA: "",
            NUMARUL: "",
            FURNIZOR: {},
            BENEFICIAR: {},
            TVA: 0.00,
            INVOICE_DATE: "",
            DUE_DATE: "",
            CURS_BNR: {
                data: "",
                eur_ron: 0.00
            },
            INVOICE_LINE: [],
            INVOICE_SUM: 0.00,
            INVOICE_TVA_SUM: 0.00,
            INVOICE_TOTAL: 0.00
        };

        //get supplier data        
        var promise_supplier = webix.ajax(SERVER_URL + DBNAME + "/" + $$("invoiceForm").elements.supplier.getValue().substr(0, $$("invoiceForm").elements.supplier.getValue().indexOf("-")));
        //get customer data
        var promise_customer = webix.ajax(SERVER_URL + DBNAME + "/" + $$("customer_contract").getSelectedItem().supplier_id);
        var promise_invoice_no = null;
        //get new invoice number if createNewInvoice = true
        if (createNewInvoice) {
            promise_invoice_no = webix.ajax().put(SERVER_URL + DBNAME + '/_design/config/_update/sn' + LOAD_URL[4]);
        } else {
            promise_invoice_no = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[4]);
        }

        webix.promise.all([promise_supplier, promise_customer, promise_invoice_no]).then(function(realdata) {
            var result = realdata[2].json();
            invoice.localData.FURNIZOR = realdata[0].json();
            invoice.localData.BENEFICIAR = realdata[1].json();
            //Search for the bank account accroding to the currency
            //Supose there is only one account per currency
            invoice.localData.FURNIZOR.conturi.forEach(function(element) {
                if ($$("invoiceForm").elements.supplier.getText().indexOf(element.valuta) != -1) {
                    for (var prop in element) {
                        invoice.localData.FURNIZOR[prop] = element[prop];
                    }
                }
            }, this);
            if (createNewInvoice) {
                invoice.localData.SERIA = result.doc.SERIA;
                invoice.localData.NUMARUL = result.doc.NUMARUL;
            } else {
                $$("invoiceForm").setValues({ "serial_number": result.SERIA + " " + result.NUMARUL }, true);
                invoice.localData.SERIA = result.SERIA;
                invoice.localData.NUMARUL = result.NUMARUL;
            }

            var form_data = $$('invoiceForm').getValues();
            invoice.localData.COPIES = form_data.copies;
            invoice.localData.TEMPLATE = form_data.template;
            invoice.localData.TVA = (typeof form_data.TVA === 'string') ? parseFloat(form_data.TVA) : form_data.TVA;
            invoice.localData.CURS_BNR.data = form_data.invoice_date;
            invoice.localData.CURS_BNR.eur_ron = (typeof form_data.exchange_rate === 'string') ? parseFloat(form_data.exchange_rate) : form_data.exchange_rate;

            invoice.localData.INVOICE_DATE = form_data.invoice_date;
            invoice.localData.DUE_DATE = form_data.due_date;

            $$("invoice_line").data.each(function(obj){
                invoice.localData.INVOICE_LINE.push({
                    details: obj.invoice_details,
                    um: obj.invoice_mu,
                    qty: obj.invoice_qty,
                    up: obj.invoice_up,
                    line_value: obj.line_value,
                    line_tva: obj.line_tva
                }); 
                invoice.localData.INVOICE_SUM += obj.line_value;
                invoice.localData.INVOICE_TVA_SUM += obj.line_tva;
            });              
            invoice.localData.INVOICE_TOTAL += (invoice.localData.INVOICE_SUM + invoice.localData.INVOICE_TVA_SUM);

            if (createNewInvoice) {
                var doc = webix.copy(invoice.localData);
                doc.doctype = "INVOICE";
                doc._id = doc.SERIA + "___" + ("00000" + doc.NUMARUL).substr(-5);
                $.couch.db(DBNAME).saveDoc(doc, {
                    success: function(data) {
                        console.log(data);
                        webix.message("Factura " + invoice.localData.SERIA + " - " + invoice.localData.NUMARUL +
                            " a fost salvata in baza de date cu succes!");
                    },
                    error: function(status) {
                        webix.message({type:"error", text:status});
                        console.log(status);
                    }
                });
            }

            invoice.generatePDF();

        }).fail(function(err) {
            //error
            webix.message({type: "error", message: err});
            console.log(err);
        });
    },

    generatePDF: function() {
        tmpTemplate = Handlebars.compile(templates[invoice.localData.TEMPLATE - 1]);
        PDF_DOC = JSON.parse(tmpTemplate(invoice.localData));
        pdfMake.createPdf(PDF_DOC).getDataUrl(function(outDoc) {
            $$("frame-body").load(outDoc);
        });
    },

    invoiceLineForm: {
        view: "form",
        id: "invoiceLineForm",
        minWidth: 600,
        elementsConfig: { labelWidth: 180 },
        elements:[
            { view: "textarea", name: "invoice_details", label: "Detalii factura:", placeholder: "descrierea bunurilor si a serviciilor", height: 110 },
            { view: "text", name: "invoice_mu", label: "UM:", placeholder: "unitatea de masura" },
            { view: "text", name: "invoice_qty", label: "Cantitatea:", placeholder: "cantiatea" },
            { view: "text", name: "invoice_up", label: "Pret unitar:", placeholder: "pret unitar" },
            { view: "textarea", name: "line_value", label: "Valoarea:", placeholder: "formula de calcul sau valoarea sumei totale", height: 110 },
            { view:"button", label:"Save" , type:"form", click:function(){
                if (!this.getParentView().validate()){
                    webix.message({ type:"error", text:"Detaliile si suma sunt obligatorii!" });
                }else{
                    var result = $$('invoiceLineForm').getValues();
                    if (result.id == "new"){
                        delete result.id;
                        result.line_value = eval(result.line_value);
                        result.line_tva = (result.line_value * $$('invoiceForm').getValues().TVA)/100.0;
                        $$('invoice_line').add(result);
                        $$('invoice_line').refresh();
                    }else{
                        result.line_value = eval(result.line_value);
                        result.line_tva = (result.line_value * $$('invoiceForm').getValues().TVA)/100.0;
                        $$('invoice_line').updateItem(result.id, result);
                        $$('invoice_line').refresh();
                    }
                    $$("invoiceLineForm").hide();	
                    $$("invoice_line").clearSelection();					
                }
             }
            }
        ],
        rules:{
            "invoice_details":webix.rules.isNotEmpty,
            "line_value":webix.rules.isNotEmpty
        }
    },

    addLine: function() {
        //get the window with the edit form
        webix.ui({
            view:"window",
            id: "invoicewindow",
            width:600,
            position:"top",
            head:"Adauga Linie Factura",
            body: webix.copy(invoice.invoiceLineForm)
        }).show();

        $$('invoiceLineForm').clear();
        $$('invoiceLineForm').setValues({"id":"new"});
    },

    editLine: function(){
        if (typeof $$("invoice_line").getSelectedId(false, true) !== 'undefined' ){
            webix.ui({
                view:"window",
                id: "invoicewindow",
                width:600,
                position:"top",
                head:"Modifica Linie Factura",
                body: webix.copy(invoice.invoiceLineForm)
            }).show();

            $$('invoiceLineForm').clear();
            $$('invoiceLineForm').setValues($$('invoice_line').getSelectedItem());
        }else{
            webix.message({type:"error", text:"Please select one row!"});
        }
       
    },

    delLine: function(){
        if (typeof $$("invoice_line").getSelectedId(false, true) !== 'undefined'){
            $$("invoice_line").remove($$("invoice_line").getSelectedId(false, true));
            $$("invoice_line").clearSelection();
        }else{
            webix.message({type:"error", text:"Please select one row!"});
        }
    },

    ui: {
        id: "page-4",
        cols: [{
                id: "invoiceForm",
                view: "form",
                scroll: 'y',
                minWidth: 500,
                elementsConfig: { labelWidth: 100 },
                elements: [
                    {
                        cols: [
                            { view: "counter", step: 1, value: 1, min: 1, max: 5, name: "copies", label: "Nr. copii:" },
                            { view: "text", name: "serial_number", label: "Seria-Nr.:", placeholder: "get the current serial number", readonly: true },
                        ]
                    },
                    {
                        view: "combo",
                        name: "template",
                        label: "Template:",
                        options: [{ id: 1, value: "RO" }, { id: 2, value: "EN" }],
                        value: 1
                    },
                    {
                        view: "combo",
                        name: "supplier",
                        label: "Furnizor:",
                        options: "CouchDB->../../_design/globallists/_list/toja/supplier/getsupplierbank"
                    },
                    {
                        view: "forminput",
                        //label: "Beneficiar:",
                        labelWidth: 0,
                        height: 220,
                        body:{
                            rows:[
                                { view: "label", label: "Beneficiar:" },
                                {
                                    view: "unitlist",
                                    id: "customer_contract",
                                    name: "customer_contract",
                                    sort: {
                                        by: "#nume#",
                                        dir: "asc"
                                    },
                                    uniteBy: function(obj) {
                                        return obj.nume;
                                    },
                                    type: { //setting item properties, optional
                                        height: 60,
                                        headerHeight: 30,
                                    },
                                    height: 'auto',
                                    template: "#contract# din data de #start_date# (exp.: #end_date#)<br/>#detalii#",
                                    select: true,
                                    url: "CouchDB->../../_design/globallists/_list/toja/contract/getcontract"
                                }
                        ]
                    }
                    },
                    {
                        cols: [
                            { view: "datepicker", stringResult: true, format: webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name: "invoice_date", label: "Emisa la:", placeholder: "data emiterii facturii" },
                            { view: "datepicker", stringResult: true, format: webix.Date.dateToStr("%d.%m.%Y"), date: new Date(), name: "due_date", label: "Scadenta la:", placeholder: "data scadenta" }
                        ]
                    },
                    {
                        cols: [
                            { view: "text", name: "TVA", label: "TVA:", placeholder: "TVA in procente" },
                            { view: "text", name: "exchange_rate", label: "Curs BNR:", placeholder: "€$£->RON" }
                        ]
                    },
                    {
                        view: "forminput",
                        autoheight: true,
                        labelWidth: 0,
                        body: {
                            rows:[
                                { view: "label", label: "Detalii factura:" },
                                {
                                    view: "datatable",
                                    autoheight: true,
                                    autowidth: true,
                                    resizeColumn:true,
                                    resizeRow:true,
                                    fixedRowHeight:false,  
                                    rowLineHeight:25, 
                                    rowHeight:25,
                                    select: true,
                                    footer: true,
                                    tooltip: true,
                                    id: "invoice_line",
                                    columns: [
                                        { id: "invoice_details", header: "Detalii", width: 300, fillspace:true, footer:{text:"TOTAL", colspan:4} },
                                        { id: "invoice_mu", header: "UM", width: 50 },
                                        { id: "invoice_qty", header: "Cant.", width: 50 },
                                        { id: "invoice_up", header: "PU", width: 50 },
                                        { id: "line_value", header: "Suma", adjust:true, width: 55, footer:{content:"summColumn"} },
                                        { id: "line_tva", header: "TVA", adjust:true, width: 55, footer:{content:"summColumn"} }
                                    ],
                                    on:{
                                        "onresize":function(){ 
                                            this.adjustRowHeight("invoice_details", true); 
                                        },
                                        "onAfterAdd":function(id, index){
                                            this.adjustRowHeight("invoice_details", true);
                                        },
                                        "onAfterUnSelect": function(data){
                                            this.adjustRowHeight("invoice_details", true);
                                        }
                                    }
                                },
                                {
                                    cols: [
                                        { view: "button", type: "icon", icon: "plus-square", label: "Add", width: 80, click: "invoice.addLine" },
                                        { view: "button", type: "icon", icon: "pencil-square-o", label: "Edit", width: 80, click: "invoice.editLine" },
                                        {},
                                        { view: "button", type: "icon", icon: "trash-o", label: "DEL", width: 80, click: "invoice.delLine" }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        margin: 10,
                        cols: [{
                                view: "button",
                                type: "danger",
                                value: "CREATE INVOICE",
                                click: function() {
                                    //check that all mandatory fields in the form were filled in
                                    if (!$$('invoiceForm').validate()) {
                                        webix.message({ type: "error", text: "Creatation date, due date, exchange rate and VAT are mandatory!" });
                                        return;
                                    }
                                    if (webix.isUndefined($$("customer_contract").getSelectedItem())) {
                                        webix.message({ type: "error", text: "Please select a customer" });
                                        return;
                                    }
                                    invoice.setlocalData(true);
                                }
                            },
                            {
                                view: "button",
                                type: "form",
                                value: "Preview",
                                click: function() {
                                    //check that all mandatory fields in the form were filled in
                                    if (!$$('invoiceForm').validate()) {
                                        webix.message({ type: "error", text: "Creatation date, due date, exchange rate and VAT are mandatory!" });
                                        return;
                                    }
                                    if (webix.isUndefined($$("customer_contract").getSelectedItem())) {
                                        webix.message({ type: "error", text: "Please select a customer" });
                                        return;
                                    }
                                    invoice.setlocalData(false);
                                }
                            }
                        ]
                    }
                ],
                rules: {
                    TVA: webix.rules.isNotEmpty,
                    invoice_date: webix.rules.isNotEmpty,
                    due_date: webix.rules.isNotEmpty,
                    exchange_rate: webix.rules.isNotEmpty
                }
            },
            { view: "resizer" },
            { view: "iframe", id: "frame-body", src: "" }
        ]
    }

};

/**
 * Define mandatory structure for INVOICE
 * 
    {
        COPIES: 1,
        TEMPLATE: 1,
        SERIA: "",
        NUMARUL: "",
        FURNIZOR: {
            {
                doctype: "SUPPLIER",
                conturi: [ ],
                nume: "",
                NORG: "",
                EUNORG: "",
                CUI: "",
                TVA: "",
                adresa: "",
                banca: "",
                sucursala: "",
                IBAN: "",
                SWIFT: "",
                BIC: "",
                valuta: ""
            }
        },
        BENEFICIAR: {
            {
                doctype: "CUSTOMER",
                nume: "",
                NORG: "",
                CUI: "",
                adresa: "",
                banca: "",
                sucursala: "",
                IBAN: "",
                TVA: ""
            }
        },
        TVA: 0.00,
        INVOICE_DATE: "",
        DUE_DATE: "",
        CURS_BNR: {
            data: "",
            eur_ron: 0.00
        },
        INVOICE_LINE: [],
        INVOICE_SUM: 0.00,
        INVOICE_TVA_SUM: 0.00,
        INVOICE_TOTAL: 0.00
    }
 * 
 */