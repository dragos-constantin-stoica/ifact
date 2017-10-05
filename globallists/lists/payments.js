function(head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var invoices = {};
        var results = [];

        while (row = getRow()) {
            //Check for payment document and then process the attachment
            if (row.value.doctype == "PAYMENT") {
                if (typeof invoices[row.key[1]] === 'undefined') {
                    invoices[row.key[1]] = {};
                    invoices[row.key[1]].PAYMENT_TOTAL = row.value.PAYMENT_SUM;
                } else {
                    invoices[row.key[1]].PAYMENT_TOTAL += row.value.PAYMENT_SUM;
                }
                //Push each invoice payed to the results
                results.push({
                    id: row.doc._id,
                    SERIA: row.value.SERIA,
                    NUMARUL: row.value.NUMARUL,
                    INVOICE_DATE: row.doc.INVOICE_DATE,
                    DUE_DATE: row.doc.DUE_DATE,
                    INVOICE_TOTAL: row.doc.INVOICE_TOTAL,
                    PAYMENT_DATE: row.value.PAYMENT_DATE,
                    PAYMENT_DETAILS: row.value.PAYMENT_DETAILS,
                    PAYMENT_SUM: row.value.PAYMENT_SUM,
                    eur_ron: row.value.eur_ron,
                    currency: row.value.currency,
                    doctype: row.value.doctype
                });
            } else {
                //It's an INVOICE type document
                if (typeof invoices[row.key[1]] === 'undefined') {
                    invoices[row.key[1]] = {};
                    invoices[row.key[1]] = row.value;
                    invoices[row.key[1]].PAYMENT_TOTAL = 0.0;
                } else {
                    p_t = invoices[row.key[1]].PAYMENT_TOTAL;
                    invoices[row.key[1]] = row.value;
                    invoices[row.key[1]].PAYMENT_TOTAL = p_t;
                }
            }
        }

        //Push the invoices in the results also
        for (var inv in invoices) {
            results.push(invoices[inv]);
        }

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}