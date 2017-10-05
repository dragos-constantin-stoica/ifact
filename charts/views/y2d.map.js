function(doc){
    if (typeof doc.doctype !== 'undefined'){
        if (doc.doctype == "INVOICE"){
            var eur_i = (doc.FURNIZOR.valuta == "EUR")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL/doc.CURS_BNR.eur_ron), 
            ron_i = (doc.FURNIZOR.valuta == "RON")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL*doc.CURS_BNR.eur_ron);

            emit ([doc.INVOICE_DATE.substr(-4), doc.INVOICE_DATE.substr(3,2)], {
                year: doc.INVOICE_DATE.substr(3,2) + "-" + doc.INVOICE_DATE.substr(-2),
                type: doc.doctype,
                eur: eur_i,
                ron: ron,
            });
        }

        if (doc.doctype == "PAYMENT"){
            var eur_p = (doc.currency == "EUR")?doc.PAYMENT_SUM:(doc.PAYMENT_SUM/doc.eur_ron), 
            ron_p = (doc.currency == "RON")?doc.PAYMENT_SUM:(doc.PAYMENT_SUM*doc.eur_ron);

            emit([doc.PAYMENT_DATE.substr(-4), doc.PAYMENT_DATE.substr(3,2)],{
                year: doc.PAYMENT_DATE.substr(3,2) + "-" + doc.PAYMENT_DATE.substr(-2),
                type: doc.doctype,
                eur: eur_p,
                ron: ron_p
            });
        }
    }
}