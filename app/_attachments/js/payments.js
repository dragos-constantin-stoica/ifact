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
                label: 'CREATE',
                type: 'form',
                click: function() {
                    var newpayment = $$('newPaymentForm').getValues();
                    if (typeof newpayment.doctype === 'undefined') newpayment.doctype = 'PAYMENT';
                    newpayment.invoice_id = $$('invoiceList').getSelectedId();
                    if (typeof newpayment.NUMARUL === 'string') newpayment.NUMARUL = parseInt(newpayment.NUMARUL, 10);
                    if (typeof newpayment.PAYMENT_SUM === 'string') newpayment.PAYMENT_SUM = parseFloat(newpayment.PAYMENT_SUM);
                    $$('paymentsTable').add(newpayment);
                    //Save payment to database

                    $$('newPaymentWindow').hide();
                }
            }
        ]
    },

    //TODO: to be implemented
    edit: function(id, e) {
        console.log(id);
    },

    //TODO: to be implemented
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
            head: "Plata noua",
            body: webix.copy(payments.paymentForm)
        }).show();
        console.log(id);
        var control = (id == "payNewButtonId") ? "invoiceList" : "dueList";
        var item_id = $$(control).locate(e);

        $$('newPaymentForm').setValues({
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
            { view: 'resizer' },
            /*
            {
                rows:[
                    {
                        view:'datatable', 
                        id: 'paymentsTable',
                        footer: true, 
                        tooltip: true,
                        columns: [
                            {id: 'id', hidden: true},
                            {id: 'invoice_id', hidden: true},
                            {id: 'doctype', hidden: true},
                            {id: 'SERIA', header: 'Serial', width: 90},
                            {id: 'NUMARUL', header: 'Number', width: 90},
                            {id: 'INVOICE_DATE', header: 'Issued', width: 100},
                            {id: 'DUE_DATE', header: 'Due', width: 100},
                            {id: 'description', header: 'Invoice details', fillspace: 2, tooltip: '#description#' },                            
                            {id: 'INVOICE_TOTAL', header: 'SUM', width: 120, format: webix.i18n.numberFormat, footer:{content:"summColumn"}},
                            {id: 'PAYMENT_SUM', header: 'PAYMENT', width: 120, format: webix.i18n.numberFormat, footer:{content:"summColumn"}},
                            {id: 'PAYMENT_DATE', header: 'Date', width: 90},
                            {id: 'PAYMENT_DETAILS', header: 'Payment details', fillspace: 2, tooltip: '#PAYMENT_DETAILS#'}
                        ],
                        on: {
                          'onAfterLoad':  function(){
                              $$('paymentsTable').sort(payments.dateSort);
                          }
                        },
                        url: "CouchDB->../../_design/globallists/_list/toja/invoice/getinvoicestatement",
                        save: "CouchDB->../../_design/invoice/_update/payment"
                    },
                    {view: 'toolbar', cols:[
                        { view:"button", label:"NEW PAYMENT", click:"payments.paymentWindow();"}
                    ]}
                ]
            } 
            */
        ]
    }

};