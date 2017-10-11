/**
 * 
 * Store user session at global level in browser session storage
 * 
 */
var USERNAME = {

    getUSERNAME: function() {
        return webix.storage.session.get('USERNAME');
    },

    setUSERNAME: function(username) {
        webix.storage.session.put('USERNAME', username);
    },

    delUSERNAME: function() {
        webix.storage.session.remove('USERNAME');
    }
};


/**
 * 
 * Create new view that extends List and webix.ActiveContent
 * 
 */
webix.protoUI(  {name: 'activeList'}, 
                webix.ui.list, 
                webix.ActiveContent );

/**
 * 
 * CouchDB configuration
 *  - database name
 * - server URL, so that the application may run from any CouchDB instance
 *   that is exposed to the web
 * 
*/
var DBNAME = "ifact";
var SERVER_URL = window.location.origin + "/";

/**
 * 
 * URL for loading JSON arrays for each view
 * 
 */
var LOAD_URL = {
    1: "/_design/globallists/_list/toja/supplier/getsupplier",
    2: "/_design/globallists/_list/toja/customer/getcustomer",
    3: "",
    4: "/INVOICE_CFG",
    5: "/_design/globallists/_list/payments/invoice/getinvoicestatement?include_docs=true",
    6: ""
};

/**
 * 
 * Date formatting function
 * 
 */
var myDateFormat = webix.Date.dateToStr("%d.%m.%Y");


/**
 * 
 * Preprocess function has as main objective the coniguration
 * and preparation of data and layout components before rendering.
 * 
 * This is called before view show and data loading.
 * 
 */
function preprocess(id) {

    switch (id) {
        case "1": case "2": case "3": case "4": case "5":
            //rebiuld the view
            //webix.ui(myApp.views[parseInt(id,10)-1], $$("mainPage"), $$("page-"+id));
            loadData(id);
            $$('page-' + id).show();
        break;
        case "6":
            //find the number of series and setup legend
            //chart data for y2m
            var promise_pg6_y2m = webix.ajax(SERVER_URL + DBNAME +"/_design/globallists/_list/y2m/charts/y2d");

            promise_pg6_y2m.then(function(realdata) {
                //setup series for Y2M graph
                var series_labels = [], raw_data = realdata.json();

                //element is an object containing the series label as attribute
                for (var key in raw_data[0]) {
                    if ((key.indexOf("ron_")!= -1 || key.indexOf("eur_") != -1) && series_labels.indexOf(key.substr(4,4)) == -1){
                        series_labels.push(key.substr(4,4));
                    }
                }
                
                series_labels.sort();
                var line_colors = ["#342b75", "#63a05a", "#6eace9", "#843b0e", "#aabc59", "#e4c495", "#f06497"];
                //generateRandomColors(series_labels.length);

                dashboard.series_y2m_ron = [];
                dashboard.series_y2m_eur = [];
                dashboard.legend_y2m_ron = {
                    values:[],
                    align:"right",
                    valign:"middle",
                    layout:"y",
                    width: 100,
                    margin: 8
                };
                dashboard.legend_y2m_eur = {
                    values:[],
                    align:"right",
                    valign:"middle",
                    layout:"y",
                    width: 100,
                    margin: 8
                };

                series_labels.forEach(function(elm, index){
                    
                    dashboard.series_y2m_ron.push({
                        value:"#ron_" + elm +"#",
                        line:{color:line_colors[index%line_colors.length], width:3},
                        tooltip:{  template:"#ron_" + elm +"#" }
                    });
                    dashboard.series_y2m_eur.push({
                        value:"#eur_" +elm+ "#",
                        line: {color:line_colors[index%line_colors.length], width:3},
                        tooltip:{  template:"#eur_" + elm +"#" }
                    });
                    dashboard.legend_y2m_ron.values.push( {text: elm, color: line_colors[index%line_colors.length]});
                    dashboard.legend_y2m_eur.values.push( {text: elm, color: line_colors[index%line_colors.length]});                    
                });
                
                //rebiuld the view
                //webix.ui(myApp.views[parseInt(id,10)-1](), $$("mainPage"), $$("page-"+id));
                $$('mainPage').removeView('page-'+id);
                $$('mainPage').addView(myApp.views[parseInt(id,10)-1](), -1);
                loadData(id);
                $$('page-' + id).show();

            }).fail(function(err) {
                //error
                webix.message({ type: "error", text: err });
                console.log(err);
            });
            break;
    
        default:
            //rebiuld the view
            //webix.ui(webix.copy(myApp.views[parseInt(id,10)-1]()), $$("mainPage"), $$("page-"+id));

            loadData(id);
            $$('page-' + id).show();
            break;
    }
}

/**
 * 
 * Main controller function
 * loads programmatically the views and intializes with data
 * from LOAD_URL
 * 
 */
function loadData(id) {
    switch (id) {
        case "1":
            //supplier form
            var promise_pg1 = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            //serii facturi form
            var promise_pg1_sf = webix.ajax(SERVER_URL + DBNAME + "/INVOICE_CFG");

            webix.promise.all([promise_pg1, promise_pg1_sf]).then(function(realdata) {
                //success
                //We expect one single supplier
                $$("page-" + id).setValues((realdata[0].json())[0]);
                $$("conturi").clearAll();
                $$("conturi").parse($$("page-" + id).getValues().conturi);
                $$("conturi").refresh();
                $$("page-" + id).setValues({INVOICE_CFG:realdata[1].json()},true);
            }).fail(function(err) {
                //error
                webix.message({ type: "error", text: err });
                console.log(err);
            });
            break;
        case "2":
            //Customers form
            //data manipulation handled via proxy
            $$("customersForm").bind("customersList");
            break;
        case "3":
            //Contracts form
            //data manipulation handled via proxy
            $$("contractForm").bind("contractList");
            break;
        case "4":
            //Invoice form
            var promise_pg4 = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            promise_pg4.then(function(realdata) {
                //success
                $$("invoiceForm").setValues({ "serial_number": realdata.json().SERIA + " " + realdata.json().NUMARUL }, true);
                invoice.localData.SERIA = realdata.json().SERIA;
                invoice.localData.NUMARUL = realdata.json().NUMARUL;
                $$('invoiceForm').elements.supplier.setValue($$('invoiceForm').elements.supplier.getList().getFirstId());
                $$('invoiceForm').elements.invoice_date.setValue(new Date());
                $$('invoiceForm').elements.due_date.setValue(new Date((new Date()).setDate((new Date()).getDate() + 30)));
                $$('invoiceForm').elements.TVA.setValue(0);
            }).fail(function(err) {
                //error
                webix.message({ type: "error", text: err });
                console.log(err);
            });
            break;
        case "5":
            //Payments
            var promise_pg5 = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            promise_pg5.then(function(realdata) {
                $$('invoiceList').parse(realdata.json().filter(function(obj) {
                    return (obj.doctype == "INVOICE") && (obj.PAYMENT_TOTAL < obj.INVOICE_TOTAL) &&
                        (new Date(obj.DUE_DATE.substr(6) + "-" + obj.DUE_DATE.substr(3, 2) + "-" + obj.DUE_DATE.substr(0, 2)) >= new Date());
                }));
                $$('dueList').parse(realdata.json().filter(function(obj) {
                    return (obj.doctype == "INVOICE") && (obj.PAYMENT_TOTAL < obj.INVOICE_TOTAL) &&
                        (new Date(obj.DUE_DATE.substr(6) + "-" + obj.DUE_DATE.substr(3, 2) + "-" + obj.DUE_DATE.substr(0, 2)) < new Date());
                }));
                $$('payedList').parse(realdata.json().filter(function(obj) { return obj.doctype == "PAYMENT"; }));
            }).fail(function(err) {
                webix.message({ type: "error", text: err });
                console.log(err);
            });
            break;
        case "6":
            //chart data for y2m
            var promise_pg6_y2m = webix.ajax(SERVER_URL + DBNAME +"/_design/globallists/_list/y2m/charts/y2d");
            //data for financialSummary
            var promise_pg6_fsy2d = webix.ajax(SERVER_URL + DBNAME + "/_design/globallists/_list/financialstatement/charts/y2d" +
            "?startkey=[\"" + new Date().getFullYear() + "\",\"01\"]&endkey=[\"" + new Date().getFullYear() + "\",{}]" );
            var promise_pg6_fstotal = webix.ajax(SERVER_URL + DBNAME + "/_design/globallists/_list/financialstatement/charts/y2d");
            webix.promise.all([promise_pg6_y2m, promise_pg6_fsy2d, promise_pg6_fstotal]).then(function(realdata) {
                //setup series for Y2M graph
                $$("y2m_ron").parse(realdata[0].json());
                $$("y2m_eur").parse(realdata[0].json());
                //setup finalcial statement
                var raw_data = realdata[1].json()
                $$("financialStatementY2D").setValues({
                    invoicedRONY2D: raw_data.invoicedRON,
                    dueRONY2D: raw_data.dueRON,
                    payedRONY2D: raw_data.payedRON,
                    invoicedEURY2D: raw_data.invoicedEUR,
                    dueEURY2D: raw_data.dueEUR,
                    payedEURY2D: raw_data.payedEUR
                });
                $$("financialStatement").setValues(realdata[2].json());
            }).fail(function(err) {
                //error
                webix.message({ type: "error", text: err });
                console.log(err);
            });
            break;
        default:
            break;
    }
}


/**
 * Proxy for CouchDB Webix style
 * The response from CouchDB may be used for DHTMLX components also
 * It was tested with DHTMLX Scheduler
 * 
 */
webix.proxy.CouchDB = {
    $proxy: true,

    load: function(view, callback) {
        //GET JSON Array from database/design_document/_list/[list_name]/[view_name]  
        webix.ajax(this.source, callback, view);
    },


    save: function(view, update, dp, callback) {

        //your saving pattern
        if (update.operation == "update") {
            webix.ajax().header({
                "Content-type": "application/json"
            }).post(dp.config.url.source + "\/" + update.data._id,
                JSON.stringify(update.data), [function(text, data, xhr) {
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json();
                    if ('action' in msg) {
                        var item = view.getItem(update.data.id);
                        item._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        view.updateItem(update.data.id, item);
                        view.refresh();
                    }
                }, callback]
            );
        }

        if (update.operation == "insert") {
            webix.ajax().header({
                "Content-type": "application/json"
            }).post(dp.config.url.source,
                JSON.stringify(update.data), [function(text, data, xhr) {
                    //response
                    //console.log(text);
                    //console.log(data.json());
                    //console.log(xhr);
                    var msg = data.json();
                    if ('action' in msg) {
                        var item = view.getItem(update.data.id);
                        item._id = xhr.getResponseHeader('X-Couch-Id');
                        item._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
                        view.updateItem(update.data.id, item);
                        view.refresh();
                    }
                }, callback]
            );
        }
    },

    result: function(state, view, dp, text, data, loader) {
        //your logic of server-side response processing

        console.log(state);
        console.log(view);
        console.log(dp);
        console.log(text);
        console.log(data);
        console.log(loader);

        //dp.processResult(state, data, details);
    }


};