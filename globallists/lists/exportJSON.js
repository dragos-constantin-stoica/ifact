function (head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = {};

        while (row = getRow()) {
            if (typeof results[row.value.doctype] === 'undefined'){
                results[row.value.doctype] = [];
            }
            results[row.value.doctype].push(row.value);
        }

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}