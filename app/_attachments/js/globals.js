/**
Store user session at global level in browser session storage
*/
var USERNAME = {
    
    getUSERNAME: function(){
        return webix.storage.session.get('USERNAME');
    },
    
    setUSERNAME: function(username){
        webix.storage.session.put('USERNAME', username);
    },
    
    delUSERNAME: function(){
        webix.storage.session.remove('USERNAME');
    }
};

/**
CouchDB configuration
- database name
- server URL, so that the application may run from any CouchDB instance
  that is exposed to the web
*/
var DBNAME = "ifact";
var SERVER_URL = CouchDB.protocol + CouchDB.host + "/";

/**
URL for loading JSON arrays for each view
*/
var LOAD_URL = {
    1: "/_design/supplier/_list/toja/getsupplier",
    2: "/_design/customer/_list/toja/getcustomer",
    3: "",
    4: "/_local/INVOICE_CFG",
    5: "",
    6: "/_local/INVOICE_CFG"
}

/**
PDF Document Definition
*/
var PDF_DOC = {};

/**
Date formatting function
*/
var myDateFormat = webix.Date.dateToStr("%d.%m.%Y");

/**
Main controller function
loads programmatically the views and intializes with data
from LOAD_URL
*/
function loadData(id){
    switch (id) {
        case "1":
            //Settings form
            var promise = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            promise.then(function(realdata){
                //success
                $$("page-" + id).setValues((realdata.json())[0]);
            }).fail(function(err){
                //error
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
            var promise = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            promise.then(function(realdata){
                //success
                $$("invoiceForm").setValues({"serial_number":realdata.json().SERIA + " " + realdata.json().NUMARUL}, true);
                invoice.localData.SERIA = realdata.json().SERIA;
                invoice.localData.NUMARUL = realdata.json().NUMARUL;
            }).fail(function(err){
                //error
            });
            break;
        case "5":
            //Payments
            break;
        case "6":
            //Configuration form
            var promise = webix.ajax(SERVER_URL + DBNAME + LOAD_URL[id]);
            promise.then(function(realdata){
                //success
                $$("page-" + id).setValues(realdata.json());
            }).fail(function(err){
                //error
            });
            break;
        default:
            break;
    }
}


/**
Proxy for CouchDB Webix style
The response from CouchDB may be used for DHTMLX components also
It was tested with DHTMLX Scheduler
*/
webix.proxy.CouchDB = {
    $proxy:true,

    load:function(view, callback){
        //GET JSON Array from database/design_document/_list/[list_name]/[view_name]  
        webix.ajax(this.source, callback, view);
    },
    save:function(view, update, dp, callback){

        //your saving pattern
        if(update.operation == "update"){
			webix.ajax().header({
			    "Content-type":"application/json"
			}).post(dp.config.url.source+ "\/" + update.data["_id"], 
				JSON.stringify(update.data), 
				[function(text, data, xhr){
			    //response
			    //console.log(text);
				//console.log(data.json());
				//console.log(xhr);
				var msg = data.json()
				if('action' in msg){
					var item = view.getItem(update.data["id"]);
					item._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
					view.updateItem(update.data["id"],item);
					view.refresh();							
				}
				},callback]
			);
		}

		if(update.operation == "insert"){
			webix.ajax().header({
			    "Content-type":"application/json"
			}).post(dp.config.url.source, 
				JSON.stringify(update.data), 
				[function(text, data, xhr){
			    //response
			    //console.log(text);
				//console.log(data.json());
				//console.log(xhr);
				var msg = data.json()
				if('action' in msg){
					var item = view.getItem(update.data["id"]);
					item._id = xhr.getResponseHeader('X-Couch-Id');
					item._rev = xhr.getResponseHeader('X-Couch-Update-NewRev'); //setting _rev property and value for it
					view.updateItem(update.data["id"],item);
					view.refresh();
				}
				}, callback]
			);
		}
	}
};
