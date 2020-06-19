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
 * - database name
 * - PouchDB database
 * 
*/
var DBNAME = "ifact";
var PDB = new PouchDB(DBNAME);
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

const LOAD_DATA = {
    "INVOICE": "INVOICE_CFG",
    "SUPPLIER": "SUPPLIER_DOC"
};

/**
 * 
 * Date formatting function
 * 
 */
var myDateFormat = webix.Date.dateToStr("%d.%m.%Y");


/**
 * 
 * Setup PouchDB
 */
async function setupPDB(params) {
    if (typeof PDB === 'undefined') PDB = new PouchDB(DBNAME);
    //Create basic documents
    try {
        var result = await  PDB.putIfNotExists("INVOICE_CFG", {
            "NUMARUL": 12,
            "SERIA": "DEMO",
            "doctype": "INVOICE_CFG"
        });
    } catch (error) {
        console.error(error);
    }

    //Create SUPPLIER
    try {
        var result = await PDB.putIfNotExists("SUPPLIER_DOC",
            {
                "doctype": "SUPPLIER",
                "conturi": [
                    {
                        "banca": "ING Bank Bucuresti",
                        "sucursala": "Centrala",
                        "IBAN": "RO99INGB0000999911112222",
                        "SWIFT": "INGBROBU",
                        "BIC": "INGB",
                        "valuta": "EUR"
                    },
                    {
                        "banca": "ING Bank Bucuresti",
                        "sucursala": "Centrala",
                        "IBAN": "RO99INGB0000999912341234",
                        "SWIFT": "INGBROBU",
                        "BIC": "INGB",
                        "valuta": "RON"
                    }
                ],
                "nume": "ACME PFA",
                "NORG": "F00/1111/2000",
                "EUNORG": "ROONRC.F00/1111/2000",
                "CUI": "12341234",
                "TVA": "RO11223344",
                "adresa": "Bd. Unirii, Nr. 1, Apt. 1,\nSectorul 1, 012345, Bucuresti , Romania"
            }
        );    
    } catch (error) {
        console.error(error);
    }
    
    //Create views
    var curstomer_ddoc = {
        _id: '_design/customer',
        views: {
          all: {
            map: function mapFun(doc) {
              if (doc.doctype && doc.doctype == "CUSTOMER") {
                emit(doc.doctype);
              }
            }.toString()
          }
        }        
    };

    var contract_ddoc = {
        _id: '_design/contract',
        views: {
          all: {
            map: function mapFun(doc) {
              if (doc.doctype && doc.doctype == "CONTRACT") {
                emit(doc.doctype);
              }
            }.toString()
          }
        }        
    };


    try {
        var response = await PDB.putIfNotExists("_design/customer", curstomer_ddoc);
        console.log(response);
        response = await PDB.putIfNotExists("_design/contract", contract_ddoc);
        console.log(response);
    } catch (error) {
        console.error(error);
    }

    
}


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
                $$('mainPage').addView(dashboard.ui(), -1);
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
async function loadData(id) {
    switch (id) {
        case "1":
            
            //Get INVOICE_CFG
            try {
                var doc = await PDB.get(LOAD_DATA["INVOICE"]);
                $$("seriifacturiForm").setValues(doc,true);
            } catch (error) {
                console.log(error);
            }
        
            //Get SUPPLIER document
            try {
                var result = await PDB.get(LOAD_DATA["SUPPLIER"]);
                $$("supplierForm").setValues(result);
                $$("conturi").clearAll();
                $$("conturi").parse($$("supplierForm").getValues().conturi);
                $$("conturi").refresh();
            } catch (error) {
                console.log(error);
            }            

            break;
        case "2":
            //Customers and contract form
            //data manipulation handled via proxy
            $$("customersContractsList").filter("#supplier_id#", -1);
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
                //clear all lists
                $$('invoiceList').clearAll();
                $$('dueList').clearAll();
                $$('payedList').clearAll();
                $$('invoiceList').parse(realdata.json().filter(function(obj) {
                    return (obj.doctype == "INVOICE") && (obj.PAYMENT_TOTAL < obj.INVOICE_TOTAL) &&
                        (new Date(obj.DUE_DATE.substr(6) + "-" + obj.DUE_DATE.substr(3, 2) + "-" + obj.DUE_DATE.substr(0, 2)) >= new Date());
                }));
                $$('dueList').parse(realdata.json().filter(function(obj) {
                    return (obj.doctype == "INVOICE") && (obj.PAYMENT_TOTAL < obj.INVOICE_TOTAL) &&
                        (new Date(obj.DUE_DATE.substr(6) + "-" + obj.DUE_DATE.substr(3, 2) + "-" + obj.DUE_DATE.substr(0, 2)) < new Date());
                }));
                //Group multiple payments per invoice
                var payed_raw = realdata.json().filter(function(obj) { return obj.doctype == "PAYMENT"; });
                payed_proc = payed_raw.reduce(function(prevValue, crtValue){
                    if (prevValue.length == 0) {
                        crtValue.PAYMENT_SUM = crtValue.PAYMENT_SUM.toFixed(2);
                        prevValue.push(crtValue);
                    }else{
                        var FOUND = false;
                        for (var index = 0; index < prevValue.length; index++) {
                            var element = prevValue[index];
                            if (element.id == crtValue.id){
                                element.PAYMENT_SUM = element.PAYMENT_SUM + " | " + crtValue.PAYMENT_SUM.toFixed(2);
                                element.PAYMENT_DATE = element.PAYMENT_DATE + " | " + crtValue.PAYMENT_DATE;
                                FOUND = true;
                                break;
                            }
                        }
                        if (!FOUND){
                            crtValue.PAYMENT_SUM = crtValue.PAYMENT_SUM.toFixed(2);
                            prevValue.push(crtValue);
                        }
                    }
                    return prevValue;
                }, []);
                $$('payedList').parse(payed_proc);
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
                    console.log(data.json());
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
                    console.log(data.json());
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
    }
    /*
    ,

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
    */
};


/**
 * Proxy for PouchDB Webix style
 * The response from PouchDB is in JSON format
 * 
 */
webix.proxy.PouchDB = {
    $proxy: true,

    load: async function(view, callback) {
        //GET JSON Array from ifact/design_document/_view/[view_name]  
        console.log("calling load >>>");
        console.log(this.source);
        console.log(callback);
        console.log(view);

        try {
            var result = await PDB.query(this.source, 
                {include_docs: true});

            console.log(result);
        } catch (error) {
            console.error(error);
        }


    },


    save: function(view, update, dp, callback) {
        console.log("calling save >>>");
        console.log(view);
        console.log(update);
        console.log(dp);
        console.log(callback);
    },


    saveAll: function(view, update, dp){
        console.log("calling saveAll >>>");
        console.log(view);
        console.log(update);
        console.log(dp);
    },

    result: function(state, view, dp, text, data, loader) {
        //your logic of server-side response processing
        console.log("calling result >>>");
        console.log(state);
        console.log(view);
        console.log(dp);
        console.log(text);
        console.log(data);
        console.log(loader);

        //dp.processResult(state, data, details);
    }


}