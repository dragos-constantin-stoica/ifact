function(doc, req){	
    //req.method will determine the action
    //POST   = Create new doc if doc._id is not present or
	//         Update an existing documente if doc._id is present
	//new qqq
	//The main part of the response (JSON)
	/*
		{
			action: 'error' | 'created' | 'updated' | 'deleted',
			doc: new_doc
		}
	*/
    
    if(req.method == "POST"){
    	var payload = JSON.parse(req.body);
        if(doc === null){
            //Create new document
            newdoc = {};
            newdoc['_id'] = req['uuid'];
            newdoc['doctype'] = "PAYMENT";
            var fields = [ 'invoice_id', 'SERIA', 'NUMARUL', 'PAYMENT_DATE', 'PAYMENT_DETAILS', 'PAYMENT_SUM', 'id' ];
            fields.forEach(function(elm, idx){
                newdoc[elm] = payload[elm];
            });
		  
            return [newdoc, JSON.stringify({"action":"created", "sid":req.id, "tid":req['uuid'], "doc":newdoc})];
        }else{
          //Update existing document
            var fields = [ 'invoice_id', 'SERIA', 'NUMARUL', 'PAYMENT_DATE', 'PAYMENT_DETAILS', 'PAYMENT_SUM', 'id' ];
            fields.forEach(function(elm, idx){
                doc[elm] = payload[elm];
            });

            return [doc, JSON.stringify({"action":"updated", "sid":req.id, "tid":req['uuid'], "doc":doc})];
		}
    }

 	//unknown request - send error with request payload
    return [null, JSON.stringify({"action":"error", "req":req})];
}