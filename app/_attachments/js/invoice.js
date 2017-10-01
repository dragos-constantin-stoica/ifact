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

            //TODO: Add iterator for multiple invoice lines. Change the form control in a grid
            //TVA applies for each line of the invoice
            var invoice_line_item = {};

            invoice_line_item.details = form_data.invoice_details;
            invoice_line_item.um = form_data.invoice_mu;
            invoice_line_item.qty = form_data.invoice_qty;
            invoice_line_item.up = form_data.invoice_up;
            invoice_line_item.line_value = eval(form_data.invoice_formula);
            invoice_line_item.line_tva = (invoice_line_item.line_value * invoice.localData.TVA) / 100.00;
            //Add this line to line array
            invoice.localData.INVOICE_LINE.push(invoice_line_item);

            invoice.localData.INVOICE_SUM += invoice_line_item.line_value;
            invoice.localData.INVOICE_TVA_SUM += invoice_line_item.line_tva;
            invoice.localData.INVOICE_TOTAL += (invoice.localData.INVOICE_SUM + invoice.localData.INVOICE_TVA_SUM);

            if (createNewInvoice) {
                var doc = webix.copy(invoice.localData);
                doc.doctype = "INVOICE";
                doc._id = doc.SERIA + "###" + ("00000" + doc.NUMARUL).substr(-5);
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

        }).fail(function(err) {
            //error
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

    ui: {
        id: "page-4",
        cols: [{
                id: "invoiceForm",
                view: "form",
                scroll: 'y',
                minWidth: 500,
                elementsConfig: { labelWidth: 180 },
                elements: [
                    { view: "counter", step: 1, value: 1, min: 1, max: 5, name: "copies", label: "Numarul de copii:" },
                    {
                        view: "combo",
                        name: "template",
                        label: "Template:",
                        options: [
                            { id: 1, value: "RO" },
                            { id: 2, value: "EN" }
                        ],
                        value: 1
                    },
                    { view: "text", name: "serial_number", label: "Seria-Nr.:", placeholder: "get the current serial number", readonly: true },
                    {
                        view: "combo",
                        name: "supplier",
                        label: "Furnizor:",
                        options: "CouchDB->../../_design/globallists/_list/toja/supplier/getsupplierbank"
                    },
                    {
                        view: "forminput",
                        label: "Beneficiar:",
                        height: 180,
                        body: {
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
                    },
                    {
                        view: "datepicker",
                        stringResult: true,
                        format: webix.Date.dateToStr("%d.%m.%Y"),
                        date: new Date(),
                        name: "invoice_date",
                        label: "Data emiterii:",
                        placeholder: "data emiterii facturii"
                    },
                    {
                        view: "datepicker",
                        stringResult: true,
                        format: webix.Date.dateToStr("%d.%m.%Y"),
                        date: new Date(),
                        name: "due_date",
                        label: "Data scadentei:",
                        placeholder: "data scadenta"
                    },
                    { view: "text", name: "TVA", label: "TVA:", placeholder: "TVA in procente" },
                    { view: "text", name: "exchange_rate", label: "Curs BNR:", placeholder: "Cursul BNR pentru €$£->RON la data emiterii facturii" },
                    {
                        view: "textarea",
                        name: "invoice_details",
                        label: "Detalii factura:",
                        placeholder: "descrierea bunurilor si a serviciilor",
                        height: 110
                    },
                    { view: "text", name: "invoice_mu", label: "UM:", placeholder: "unitatea de masura" },
                    { view: "text", name: "invoice_qty", label: "Cantitatea:", placeholder: "cantiatea" },
                    { view: "text", name: "invoice_up", label: "Pret unitar:", placeholder: "pret unitar" },
                    { view: "textarea", name: "invoice_formula", label: "Formula de calcul:", placeholder: "formula de calcul a sumei toatale", height: 110 },
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
            {
                view: "iframe",
                id: "frame-body",
                src: ""
            }
        ]
    }

};