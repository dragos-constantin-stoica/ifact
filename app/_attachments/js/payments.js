var payments = {

    paymentForm: {
        id: 'newPaymentForm',
        view: 'form',
        width: 400,
        elements: [
            { view: 'text', name: 'SERIA', label: 'SN:', readonly: true },
            { view: 'text', name: 'NUMARUL', label: 'NR:', readonly: true },
            { view: 'datepicker', name: 'PAYMENT_DATE', label: 'Date:', stringResult: true, format: webix.Date.dateToStr("%d.%m.%Y"), date: new Date() },
            { view: 'textarea', name: 'PAYMENT_DETAILS', label: 'Payment description:', height: 110, labelPosition: "top" },
            { view: 'text', name: 'PAYMENT_SUM', label: 'Ammount:', format: webix.i18n.numberFormat },
            {
                view: 'button',
                label: 'NEW PAYMENT',
                type: 'form',
                click: function() {
                    var newpayment = $$('newPaymentForm').getValues();
                    if (typeof newpayment.doctype === 'undefined') newpayment.doctype = 'PAYMENT';
                    newpayment.invoice_id = $$('invoiceList').getSelectedId();
                    if (typeof newpayment.NUMARUL === 'string') newpayment.NUMARUL = parseInt(newpayment.NUMARUL, 10);
                    if (typeof newpayment.PAYMENT_SUM === 'string') newpayment.PAYMENT_SUM = parseFloat(newpayment.PAYMENT_SUM);
                    console.log(newpayment);
                    $.couch.db(DBNAME).saveDoc(newpayment, {
                        success: function(data) {
                            console.log(data);
                            webix.message("Plata pentru factura" + newpayment.SERIA + " - " + newpayment.NUMARUL +
                                " a fost salvata cu succes în baza de date!");
                        },
                        error: function(status) {
                            webix.message({ type: "error", text: status });
                            console.log(status);
                        }
                    });
                    $$('newPaymentWindow').hide();
                }
            }
        ]
    },

    editForm: {
        cols: [{
                id: "editForm",
                view: "form",
                width: 400,
                scroll: 'y',
                minWidth: 400,
                elementsConfig: { labelWidth: 180 },
                elements: [
                    { view: "counter", step: 1, value: 1, min: 1, max: 5, name: "copies", label: "Numarul de copii:" },
                    {
                        view: "combo",
                        name: "template",
                        label: "Template:",
                        value: 1,
                        options: [
                            { id: 1, value: "RO" },
                            { id: 2, value: "EN" }
                        ]
                    },
                    { view: "text", name: "serial_number", label: "Seria-Nr.:", placeholder: "get the current serial number", readonly: true },
                    { view: "text", name: "supplier", label: "Furnizor:" },
                    { view: "text", name: "customer_contract", label: "Beneficiar:" },
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
                    { view: "textarea", name: "invoice_details", label: "Detalii factura:", placeholder: "descrierea bunurilor si a serviciilor", height: 110 },
                    { view: "text", name: "invoice_mu", label: "UM:", placeholder: "unitatea de masura" },
                    { view: "text", name: "invoice_qty", label: "Cantitatea:", placeholder: "cantiatea" },
                    { view: "text", name: "invoice_up", label: "Pret unitar:", placeholder: "pret unitar" },
                    { view: "textarea", name: "invoice_formula", label: "Formula de calcul:", placeholder: "formula de calcul a sumei toatale", height: 110 },
                    {
                        margin: 10,
                        cols: [{
                                view: "button",
                                type: "danger",
                                value: "MODIFY INVOICE",
                                click: function() {
                                    //check that all mandatory fields in the form were filled in
                                    if (!$$('editForm').validate()) {
                                        webix.message({ type: "error", text: "Creatation date, due date, exchange rate and VAT are mandatory!" });
                                        return;
                                    }
                                    //TODO: display PDF and save the data
                                }
                            },
                            {
                                view: "button",
                                type: "form",
                                value: "Preview",
                                click: function() {
                                    //check that all mandatory fields in the form were filled in
                                    if (!$$('editForm').validate()) {
                                        webix.message({ type: "error", text: "Creatation date, due date, exchange rate and VAT are mandatory!" });
                                        return;
                                    }
                                    //TODO: display PDF
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
            { view: "iframe", id: "frame-edit", src: "" }
        ]
    },

    //TODO: to be implemented
    edit: function(id, e) {
        console.log(id);
        webix.ui({
            view: "window",
            id: "editWindow",
            width: 800,
            height: 600,
            resize: true,
            position: "top",
            head: "Modifică factura",
            body: webix.copy(payments.editForm)
        }).show();
        var control = (id == "editNewButtonId") ? "invoiceList" : "dueList";
        var item_id = $$(control).locate(e);
        //Get the invoice from the database and populate with values the editForm
        var promise_edit = webix.ajax(SERVER_URL + DBNAME + "/" + item_id);
        promise_edit.then(function(data) {
            var invoice_data = data.json();
            $$('editForm').clear();
            $$('editForm').setValues(invoice_data, true);
        }).fail(function(err) {
            webix.message({ type: "error", text: err });
            console.log(err);
        });
    },

    view: function(id, e) {
        //console.log(id);
        if (!webix.isUndefined($$('viewInvoice'))) $$('viewInvoice').destructor();

        webix.ui({
            view: "window",
            id: "viewInvoice",
            width: 800,
            height: 600,
            resize: true,
            position: "top",
            head: {
                view: "toolbar",
                cols: [
                    { view: "label", label: "Vizualizare factură" },
                    { view: "button", type: "icon", icon: "times-circle-o", width: 32, align: 'right', click: "$$('viewInvoice').close();" }
                ]
            },
            body: {
                view: "iframe",
                id: "frame-view",
                src: ""
            }
        }).show();
        //find the invoice
        var control = (id == "viewNewButtonId") ? "invoiceList" : ((id == "viewDueButtonId") ? "dueList" : "payedList");
        var item_id = $$(control).locate(e);
        console.log(item_id);
        var promise_view = webix.ajax(SERVER_URL + DBNAME + "/" + item_id);
        promise_view.then(function(data) {
            var invoice_data = data.json();
            var tmpTemplate = Handlebars.compile(templates[invoice_data.TEMPLATE - 1]);
            PDF_DOC = JSON.parse(tmpTemplate(invoice_data));
            pdfMake.createPdf(PDF_DOC).getDataUrl(function(outDoc) {
                $$("frame-view").load(outDoc);
            });
        }).fail(function(err) {
            webix.message({ type: "error", text: err });
            console.log(err);
        });
    },

    pay: function(id, e) {
        webix.ui({
            view: "window",
            id: "newPaymentWindow",
            width: 400,
            position: "top",
            head: "Plată nouă",
            body: webix.copy(payments.paymentForm)
        }).show();
        //console.log(id);
        var control = (id == "payNewButtonId") ? "invoiceList" : "dueList";
        var item_id = $$(control).locate(e);
        $$('newPaymentForm').clear();
        $$('newPaymentForm').setValues({
            invoice_id: item_id,
            SERIA: $$(control).getItem(item_id).SERIA,
            NUMARUL: $$(control).getItem(item_id).NUMARUL,
            doctype: 'PAYMENT'
        }, true);
    },

    ui: {
        id: "page-5",
        cols: [{
                header: "New",
                body: {
                    view: "activeList",
                    activeContent: {
                        viewButton: {
                            id: "viewNewButtonId",
                            view: "button",
                            type: "icon",
                            icon: "eye",
                            width: 32,
                            click: "payments.view"
                        },
                        editButton: {
                            id: "editNewButtonId",
                            view: "button",
                            type: "icon",
                            icon: "pencil-square-o",
                            width: 32,
                            click: "payments.edit"
                        },
                        payButton: {
                            id: "payNewButtonId",
                            view: "button",
                            type: "icon",
                            icon: "money",
                            width: 32,
                            click: "payments.pay"
                        }
                    },

                    id: 'invoiceList',
                    template: function(obj, common) {
                        return "<div style='display: flex;justify-content: space-between;'><div>Fact.: " + obj.SERIA + " " + obj.NUMARUL +
                            " din: " + obj.INVOICE_DATE + ", [scadenta: <em>" + obj.DUE_DATE + "</em>]. SUMA: <b>" +
                            obj.INVOICE_TOTAL.toFixed(2) + "</b> " + obj.currency + "</br>" + obj.description + "</div>" +
                            "<div style='height: 50px; padding-left: 2px;padding-top:1px;'>" +
                            common.viewButton(obj, common) + common.editButton(obj, common) + common.payButton(obj, common) + "</div></div>";
                    },
                    sort: { by: "#NUMARUL#", dir: "desc", as: "int" },
                    type: { height: 130 },
                    on: {
                        'onAfterLoad': function() {
                            $$('invoiceList').sort('#NUMARUL#', 'desc', "int");
                        }
                    },
                    //autoheight:true,
                    autowidth: true
                }
            },
            { view: 'resizer' },
            {
                header: "Due",
                body: {
                    view: "activeList",
                    activeContent: {
                        viewButton: {
                            id: "viewDueButtonId",
                            view: "button",
                            type: "icon",
                            icon: "eye",
                            width: 32,
                            click: "payments.view"
                        },
                        editButton: {
                            id: "editDueButtonId",
                            view: "button",
                            type: "icon",
                            icon: "pencil-square-o",
                            width: 32,
                            click: "payments.edit"
                        },
                        payButton: {
                            id: "payDueButtonId",
                            view: "button",
                            type: "icon",
                            icon: "money",
                            width: 32,
                            click: "payments.pay"
                        }
                    },

                    id: 'dueList',
                    template: function(obj, common) {
                        return "<div style='display: flex;justify-content: space-between;'><div>Fact.: " + obj.SERIA + " " + obj.NUMARUL +
                            " din: " + obj.INVOICE_DATE + ", [scadenta: <em>" + obj.DUE_DATE + "</em>]. SUMA: <b>" +
                            obj.INVOICE_TOTAL.toFixed(2) + "</b> " + obj.currency + "</br>" + obj.description + "</div>" +
                            "<div style='height: 50px; padding-left: 2px;padding-top:1px;'>" +
                            common.viewButton(obj, common) + common.editButton(obj, common) + common.payButton(obj, common) + "</div></div>";
                    },
                    sort: { by: "#NUMARUL#", dir: "desc", as: "int" },
                    type: { height: 130 },
                    on: {
                        'onAfterLoad': function() {
                            $$('dueList').sort('#NUMARUL#', 'desc', "int");
                        }
                    },
                    //autoheight:true,
                    autowidth: true
                }
            },
            { view: 'resizer' },
            {
                header: "Payed",
                body: {
                    view: "activeList",
                    activeContent: {
                        viewButton: {
                            id: "viewPayedButtonId",
                            view: "button",
                            type: "icon",
                            icon: "eye",
                            width: 32,
                            click: "payments.view"
                        }
                    },
                    id: 'payedList',
                    template: function(obj, common) {
                        return "<div style='display: flex;justify-content: space-between;'><div>Fact.: " + obj.SERIA + " " + obj.NUMARUL +
                            " din: " + obj.INVOICE_DATE + ", [scadenta: <em>" + obj.DUE_DATE + "</em>]. SUMA: <b>" +
                            obj.INVOICE_TOTAL.toFixed(2) + "</b> " + obj.currency + "</br>" +
                            "Payed: <b>" + obj.PAYMENT_SUM.toFixed(2) + "</b> " + obj.currency + " on " + obj.PAYMENT_DATE + "<br/>" +
                            "Detalii plata: " + obj.PAYMENT_DETAILS + "</div>" +
                            "<div style='height: 50px; padding-left: 2px;padding-top:1px;'>" +
                            common.viewButton(obj, common) + "</div></div>";
                    },
                    sort: { by: "#NUMARUL#", dir: "desc", as: "int" },
                    type: { height: 130 },
                    on: {
                        'onAfterLoad': function() {
                            $$('payedList').sort('#NUMARUL#', 'desc', "int");
                        }
                    },
                    autowidth: true
                }
            },
            { view: 'resizer' }
        ]
    }

};