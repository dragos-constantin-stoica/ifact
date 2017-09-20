var payments = {

    dateSort: function (a,b){
        if (typeof a.INVOICE_DATE !== 'undefined') return -1;
        if (typeof b.INVOICE_DATE !== 'undefined') return 1;
        if (typeof a.INVOICE_DATE === 'unefined' && typeof b.INVOICE_DATE === 'undefined' &&
            typeof a.PAYMENT_DATE !== 'undefined' && typeof b.PAYMENT_DATE !== 'undefined'){
                    var aa = a.PAYMENT_DATE.toString();
                    var bb = b.PAYMENT_DATE.toString();    
                    return aa>bb?1:(aa<bb?-1:0);        
         };
         return 0;
    },
        
    paymentForm: {
        id: 'newPaymentForm',
        view: 'form',
        width: 400,
        elements: [
            {view: 'text', name: 'SERIA', label: 'SN:', readonly: true},
            {view: 'text', name: 'NUMARUL', label: 'NR:', readonly: true},
            {view: 'datepicker', name: 'PAYMENT_DATE', label: 'Date:', stringResult:true, format:webix.Date.dateToStr("%d.%m.%Y"), date: new Date()},
            {view: 'textarea', name: 'PAYMENT_DETAILS', label: 'Payment description:', height:110, labelPosition:"top" },
            {view: 'text', name: 'PAYMENT_SUM', label: 'Ammount:', format: webix.i18n.numberFormat},
            {view: 'button', label: 'CREATE', type: 'form', click: function(){
                var newpayment = $$('newPaymentForm').getValues();
                if (typeof newpayment.doctype === 'undefined') newpayment.doctype = 'PAYMENT';
                newpayment.invoice_id = $$('invoiceList').getSelectedId();
                if (typeof newpayment.NUMARUL === 'string') newpayment.NUMARUL = parseInt(newpayment.NUMARUL, 10);
                if (typeof newpayment.PAYMENT_SUM === 'string') newpayment.PAYMENT_SUM = parseFloat(newpayment.PAYMENT_SUM);
                $$('paymentsTable').add(newpayment);
                //Save payment to database
                
                $$('newPaymentWindow').hide();
            }}
        ]
    },
    
    paymentWindow: function(){
       webix.ui(
            {
                view: "window",
                id: "newPaymentWindow",
                width:400,
                position: "top",
                head: "Plata noua",
                body: webix.copy(payments.paymentForm)
            }
        ).show(); 
        
        
        $$('newPaymentForm').setValues({
            SERIA: $$('invoiceList').getSelectedItem().SERIA,
            NUMARUL: $$('invoiceList').getSelectedItem().NUMARUL,
            doctype: 'PAYMENT'
        }, true);
    },
    
    ui: {
        id: "page-5",
        rows: [
            {
                view: "list",
                id: 'invoiceList',
                template: function (obj) {
                    return "Fact.: " + obj.SERIA + " " + obj.NUMARUL + 
                           " din: " + obj.INVOICE_DATE + ", [scadenta: <em>" + obj.DUE_DATE + "</em>]. SUMA: <b>" +
                           obj.INVOICE_TOTAL.toFixed(2) + "</b> RON</br>" + obj.description;
                },
                select: true,
                sort: {
                    by: "#INVOICE_DATE#",
                    dir: "desc",
                    as: "string"
                },
                type:{//setting item properties, optional
                    height:60
                },
                on:{
                  'onItemClick':function(id){
                        $$('paymentsTable').filter(function(obj){
                            return (obj.id == id && obj.doctype == 'INVOICE') || 
                                   (obj.invoice_id == id && obj.doctype == 'PAYMENT');
                        });
                        $$('paymentsTable').sort(payments.dateSort);
                  },
                  'onAfterLoad':function(){
                      $$('invoiceList').filter("#doctype#","INVOICE");
                      $$('invoiceList').select($$('invoiceList').getFirstId());
                       $$('paymentsTable').filter(function(obj){
                          return (obj.id == $$('invoiceList').getFirstId() && obj.doctype == 'INVOICE' ) ||
                                  (obj.invoice_id == $$('invoiceList').getFirstId() && obj.doctype == 'PAYMENT');
                      });
                      $$('paymentsTable').sort(payments.dateSort);
                  }
                },
                //autoheight:true,
                autowidth: true,
                url: "CouchDB->../../_design/globallists/_list/toja/invoice/getinvoicestatement"
            },
            {view: 'resizer'},
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
     ]
    }
    
};
