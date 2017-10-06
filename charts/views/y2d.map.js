function(doc){
    if (typeof doc.doctype !== 'undefined'){
        if (doc.doctype == "INVOICE"){

            emit ([doc.INVOICE_DATE.substr(-4), doc.INVOICE_DATE.substr(3,2)], {
                year_month: doc.INVOICE_DATE.substr(3,2) + "-" + doc.INVOICE_DATE.substr(-2),
                type: doc.doctype,
                eur: (doc.FURNIZOR.valuta == "EUR")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL/doc.CURS_BNR.eur_ron),
                ron: (doc.FURNIZOR.valuta == "RON")?doc.INVOICE_TOTAL:(doc.INVOICE_TOTAL*doc.CURS_BNR.eur_ron)
            });
        }

        if (doc.doctype == "PAYMENT"){

            emit([doc.PAYMENT_DATE.substr(-4), doc.PAYMENT_DATE.substr(3,2)],{
                year_month: doc.PAYMENT_DATE.substr(3,2) + "-" + doc.PAYMENT_DATE.substr(-2),
                type: doc.doctype,
                eur: (doc.currency == "EUR")?doc.PAYMENT_SUM:(doc.PAYMENT_SUM/doc.eur_ron),
                ron: (doc.currency == "RON")?doc.PAYMENT_SUM:(doc.PAYMENT_SUM*doc.eur_ron)
            });
        }
    }
}