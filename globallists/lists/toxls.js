function (head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = [];

        while (row = getRow()) {
            results.push([
                row.value.SERIA + " " + row.value.NUMARUL,
                row.value.INVOICE_DATE,
                row.value.DUE_DATE,
                row.value.BENEFICIAR.nume,
                row.value.INVOICE_TOTAL
            ]);
        }

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}