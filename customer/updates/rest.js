function(doc, req){	
    //req.method will determine the action
    //PUT    = Update existing doc
    //POST   = Create new doc if doc._id is not present or
	//         Update an existing documente if doc._id is present
    //DELETE = Delete existing doc, CouchDB way ;-)
	
	//The main part of the response (JSON)
	/*
		{
			action: 'error' | 'created' | 'updated' | 'deleted',
			doc: new_doc
		}
	*/
    
    if(req.method == "DELETE"){
		//Delete document keeping history
		//The document may be 'undeleted'
    	doc['_deleted']=true;
      	return [doc, JSON.stringify({"action":"deleted"})];
    }

    if(req.method == "PUT"){
      //update document
    	var payload = JSON.parse(req.body);
        var fields = [ 'nume', 'NORG', 'CUI', 'TVA', 'adresa', 'banca', 'sucursala', 'IBAN'];
        fields.forEach(function(elm, idx){
            doc[elm] = payload[elm];
        });
    	return [doc,JSON.stringify({"action":"updated","doc":doc})];
    }

    if(req.method == "POST"){
    	var payload = JSON.parse(req.body);
        if(doc === null){
            //Create new document
            newdoc = {};
            newdoc['_id'] = req['uuid'];
            newdoc['doctype'] = "CUSTOMER";
            var fields = [ 'nume', 'NORG', 'CUI', 'TVA', 'adresa', 'banca', 'sucursala', 'IBAN', 'id'];
            fields.forEach(function(elm, idx){
                newdoc[elm] = payload[elm];
            });
		  
            return [newdoc, JSON.stringify({"action":"created", "sid":req.id, "tid":req['uuid'], "doc":newdoc})];
        }else{
          //Update existing document
            var fields = [ 'nume', 'NORG', 'CUI', 'TVA', 'adresa', 'banca', 'sucursala', 'IBAN', 'id'];
            fields.forEach(function(elm, idx){
                doc[elm] = payload[elm];
            });

            return [doc, JSON.stringify({"action":"updated", "sid":req.id, "tid":req['uuid'], "doc":doc})];
		}
    }

 	//unknown request - send error with request payload
    return [null, JSON.stringify({"action":"error", "req":req})];
}