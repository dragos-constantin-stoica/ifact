function(head, req) {
    // specify that we're providing a JSON response
    provides('json', function() {
        // create an array for our result set
        var results = {
            invoicedRON: 0,
            dueRON: 0,
            payedRON: 0,
            invoicedEUR: 0,
            dueEUR: 0,
            payedEUR: 0
        };

        var balance_sheet = {};

        var today = new Date();

        while (row = getRow()) {
            if (row.value.type == "INVOICE") {
                results.invoicedEUR += row.value.eur;
                results.invoicedRON += row.value.ron;
                //Jan = 0 in JS
                if (today > new Date(row.value.due_date.substr(-4),
                        parseInt(row.value.due_date.substr(3, 2), 10) - 1, row.value.due_date.substr(0, 2))) {
                    if (typeof balance_sheet[row.value.id] === 'undefined') {
                        balance_sheet[row.value.id] = {
                            dueEUR: row.value.eur,
                            dueRON: row.value.ron
                        };
                    } else {
                        balance_sheet[row.value.id].dueEUR += row.value.eur;
                        balance_sheet[row.value.id].dueRON += row.value.ron;
                    }
                }
            }

            if (row.value.type == "PAYMENT") {
                results.payedEUR += row.value.eur;
                results.payedRON += row.value.ron;
                if (typeof balance_sheet[row.value.id] === 'undefined') {
                    balance_sheet[row.value.id] = {
                        dueEUR: -row.value.eur,
                        dueRON: -row.value.ron
                    };
                } else {
                    balance_sheet[row.value.id].dueEUR -= row.value.eur;
                    balance_sheet[row.value.id].dueRON -= row.value.ron;
                }
            }

        }

        for (var key in balance_sheet) {
            if (balance_sheet[key].dueEUR > 0) {
                results.dueEUR += balance_sheet[key].dueEUR;
                results.dueRON += balance_sheet[key].dueRON;
            }
        }

        for (var field in results) {
            results[field] = results[field].toFixed(2);


        }

        // make sure to stringify the results :)
        send(JSON.stringify(results));
    });
}