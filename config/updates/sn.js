/**
 * Manage invoice serial number in /INVOICE_CFG document
 * PUT  = update existing document
 * POST = if doc present then update document, if not create it
 */

function(doc, req) {

    var fields = ['SERIA', 'NUMARUL'];

    if (req.method == "POST") {
        var payload = JSON.parse(req.body);
        if (doc === null) {
            //Create new document
            newdoc = {};
            newdoc._id = 'INVOICE_CFG';
            newdoc.doctype = "INVOICE_CFG";
            
            fields.forEach(function(elm, idx) {
                newdoc[elm] = payload[elm];
            });
            if (typeof doc.NUMARUL === 'string') doc.NUMRUL = parseInt(doc.NUMARUL, 10);

            return [newdoc, JSON.stringify({
                "action": "created",
                "sid": req.id,
                "tid": req.uuid,
                "doc": newdoc
            })];
        } else {
            //Update existing document
            fields.forEach(function(elm, idx) {
                doc[elm] = payload[elm];
            });
            if (typeof doc.NUMARUL === 'string') doc.NUMARUL = parseInt(doc.NUMARUL, 10);
            return [doc, JSON.stringify({
                "action": "updated",
                "sid": req.id,
                "tid": req.uuid,
                "doc": doc
            })];
        }
    }

    if (req.method == "PUT") {
        //update document
        if (doc === null) {
            return [null, JSON.stringify({
                "action": "error",
                "req": req
            })];
        } else {
            if (typeof doc.NUMARUL === 'string') doc.NUMARUL = parseInt(doc.NUMARUL, 10);
            doc.NUMARUL++;
            return [doc, JSON.stringify({
                "action": "updated",
                "doc": doc
            })];
        }
    }

    //unknown request - send error with request payload
    return [null, JSON.stringify({
        "action": "error",
        "req": req
    })];
}