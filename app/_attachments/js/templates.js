/**
 * PDF templates that will be rendered with Handlebar
 * JSON objects that contain blocks
 */
var templates = [

    //ROMANIAN template
    `{
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        "content": [
            {{#carboncopy COPIES}}
            {
                "columns": [{
                        "width": "50%",
                        "text": "Exemplarul nr. {{@index}}"
                    },
                    {
                        "width": "50%",
                        "text": [
                            "SERIA: ",
                            { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                            " NR.: ",
                            { "text": "{{NUMARUL}}", "fontSize": 13, "bold": true }
                        ],
                        "alignment": "right"
                    }
                ]
            },
            "\\n\\n",
            { "text": "FACTURA FISCALA", "style": "header" },
            "\\n\\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "FURNIZOR:\\n",
                            {{#with FURNIZOR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NORG}}\\n",
                            "C.U.I: {{CUI}}\\n",
                            "Sediul: {{normalized_address adresa}}\\n",
                            "Banca: {{banca}} - Sucursala: {{sucursala}}\\n",
                            "Cod IBAN: {{IBAN}}"
                            {{/with}}
                        ]
                    },
                    {
                        "width": "6%",
                        "text": ""
                    },
                    {
                        "width": "47%",
                        "text": [
                            "BENEFICIAR:\\n",
                            {{#with BENEFICIAR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NORG}}\\n",
                            "C.U.I: {{CUI}}\\n",
                            "Sediul: {{normalized_address adresa}}\\n",
                            "Banca: {{banca}} - Sucursala: {{sucursala}}\\n",
                            "Cont IBAN: {{IBAN}}"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "33%",
                        "text": ""
                    },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Numar factura: {{NUMARUL}}", "style": "tableCell" }],
                                [{ "text": "Data emiterii: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "Data scadentei: {{DUE_DATE}}", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    {
                        "width": "33%",
                        "text": ""
                    }

                ]

            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "50%",
                        "text": "Cota TVA = {{TVA}}%"
                    },
                    {
                        "width": "50%",
                        "text": "Curs BNR din {{CURS_BNR.data}}: 1EUR = {{CURS_BNR.eur_ron}}RON",
                        "alignment": "right"
                    }
                ]
            },
            "\\n",
            {
                "table": {
                    "widths": [15, "*", 20, 25, 50, 50, 50],
                    "body": [
                        [ 
                            {"text":"Nr. crt.", "style":"tableHeader"}, 
                            {"text":"Denumirea produselor sau a serviciilor", "style":"tableHeader"}, 
                            {"text":"UM", "style":"tableHeader"}, 
                            {"text":"Cant.", "style":"tableHeader"},
                            {"text":"Pret unitar (fara TVA)", "style":"tableHeader"},
                            {"text":"Valoarea", "style":"tableHeader"},
                            {"text":"Valoarea TVA", "style":"tableHeader"}
                        ],
                        [ 
                            {"text":"0", "style":"tableHeader"}, 
                            {"text":"1", "style":"tableHeader"},
                            {"text":"2", "style":"tableHeader"},
                            {"text":"3", "style":"tableHeader"},
                            {"text":"4", "style":"tableHeader"},
                            {"text":"5", "style":"tableHeader"},
                            {"text":"6", "style":"tableHeader"}
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            {"text": {{addOne @index}}, "alignment":"center"}, 
                            {"text":"{{this.details}}"},
                            {"text":"{{this.um}}", "alignment":"center"},
                            {"text":"{{this.qty}}", "alignment":"center"},
                            {"text":"{{this.up}}", "alignment":"right"},
                            {"text":"{{toDecimals this.line_value}}", "alignment":"right"},
                            {"text":"{{toDecimals this.line_tva}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            {"text": "{{toDecimals INVOICE_TVA_SUM}}", "bold":true, "alignment":"right"}
                        ],
                        [
                            "","","","",
                            {"text": "TOTAL DE PLATA", "bold":true, "fontSize":13, "alignment":"center"},
                            {"colSpan":2, "text":"\\n{{toDecimals INVOICE_TOTAL}} RON" , "bold":true, "fontSize":13, "alignment":"center"}
                        ]
                    ]
                }
            },
            "\\n\\n",
            {
                "table": {
                    "widths": ["*"],
                    "body": [
                        [{
                            "text": [
                                "Termen de plata: ",
                                { "text": "{{DUE_DATE}}\\n", "bold": true },
                                "Nota: Pentru ordinul de plata, va rog sa treceti la descrierea platii: ",
                                { "text": "{{SERIA}}-{{NUMARUL}}", "bold": true }
                            ],
                            "margin": [5, 5, 33, 5],
                            "fontSize": 13
                        }]
                    ]
                }
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "50%",
                        "text": "Semnatura si stampila furnizorului"
                    },
                    {
                        "width": "50%",
                        "text": "Semnatura de primire beneficiar",
                        "alignment": "right"
                    }
                ]
            }
            {{/carboncopy}}
        ],
        "styles": {
            "header": {
                "bold": true,
                "fontSize": 18,
                "alignment": "center"
            },
            "tableHeader": {
                "color": "black",
                "alignment": "center"
            },
            "tableCell": {
                "margin": [3, 5, 3, 5]
            }
        },
        "defaultStyle": {
            "fontSize": 10
        }
    }`,

    //ENGLISH template
    `{
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        "content": [
            {{#carboncopy COPIES}}
            {
                "columns": [{
                        "width": "50%",
                        "text": "Copy N°.{{@index}}"
                    },
                    {
                        "width": "50%",
                        "text": [
                            "SERIES: ",
                            { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                            " N°. ",
                            { "text": "{{NUMARUL}}", "fontSize": 13, "bold": true }
                        ],
                        "alignment": "right"
                    }
                ]
            },
            "\\n\\n",
            { "text": "INVOICE", "style": "header" },
            "\\n\\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "CONTRACTOR:\\n",
                            {{#with FURNIZOR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "VAT N°: {{TVA}}\\n",
                            "Address: {{normalized_address adresa}}\\n",
                            "Bank: {{banca}} - Office: {{sucursala}}\\n",
                            "IBAN: {{IBAN}}\\n",
                            "SWIFT: {{SWIFT}}\\n",
                            "BIC: {{BIC}}"
                            {{/with}}
                        ]
                    },
                    {
                        "width": "6%",
                        "text": ""
                    },
                    {
                        "width": "47%",
                        "text": [
                            "BILL TO:\\n",
                            {{#with BENEFICIAR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "VAT N°: {{TVA}}\\n",
                            "Address: {{normalized_address adresa}}\\n"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "33%",
                        "text": ""
                    },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Invoice: {{SERIA}}/{{NUMARUL}}", "style": "tableCell" }],
                                [{ "text": "Invoice date: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "VAT: {{TVA}}%", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    {
                        "width": "33%",
                        "text": ""
                    }

                ]

            },
            "\\n\\n",
            {
                "table": {
                    "widths": [15, "*", 25, 25, 50, 60],
                    "body": [
                        [
                            { "text": "N°", "style": "tableHeader" },
                            { "text": "Description of services", "style": "tableHeader" },
                            { "text": "MU", "style": "tableHeader" },
                            { "text": "Qty", "style": "tableHeader" },
                            { "text": "Unit Price", "style": "tableHeader" },
                            { "text": "Value", "style": "tableHeader" }
                        ],
                        [
                            { "text": "0", "style": "tableHeader" },
                            { "text": "1", "style": "tableHeader" },
                            { "text": "2", "style": "tableHeader" },
                            { "text": "3", "style": "tableHeader" },
                            { "text": "4", "style": "tableHeader" },
                            { "text": "5", "style": "tableHeader" }
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            { "text": {{addOne @index}}, "alignment": "center" },
                            { "text": "{{this.details}}" },
                            { "text": "{{this.um}}", "alignment": "center" },
                            { "text": "{{this.qty}}", "alignment": "right" },
                            { "text": "{{this.up}}", "alignment": "right" },
                            { "text": "{{toDecimals this.line_value}}", "alignment": "right" }
                        ],
                        {{/each}}
                        [
                            { "colSpan": 2, "text": " " },
                            "",
                            { "colSpan": 3, "text": "INVOICE\\nTOTAL", "bold": true, "fontSize": 13, "alignment": "center" },
                            "", "",
                            { "text": "{{toDecimals INVOICE_TOTAL}} EUR", "bold": true, "fontSize": 13, "alignment": "center" }
                        ]
                    ]
                }
            },
            "\\n\\n",
            {
                "columns": [{
                    "width": "50%",
                    "text": "Contractor's signature"
                }]
            }
            {{/carboncopy}}
        ],
        "styles": {
            "header": {
                "bold": true,
                "fontSize": 18,
                "alignment": "center"
            },
            "tableHeader": {
                "color": "black",
                "alignment": "center"
            },
            "tableCell": {
                "margin": [3, 5, 3, 5]
            }
        },
        "defaultStyle": {
            "fontSize": 10
        }
    }`

];


Handlebars.registerHelper("normalized_address", function(address) {
    return new Handlebars.SafeString(address.replace(/(?:\r\n|\r|\n)/g, "\\n"));
});

Handlebars.registerHelper("toDecimals", function(amount) {
    return amount.toFixed(2);
});

Handlebars.registerHelper("addOne", function(integer) {
    return integer + 1;
});

Handlebars.registerHelper("carboncopy", function(n, block) {
    var accum = '';
    for (var i = 0; i < n; ++i) {
        block.data.index = i + 1;
        block.data.first = i === 1;
        block.data.last = i === (n - 1);
        accum += block.fn(this);
        //Add page break
        if ((i < (n - 1)) && (n > 1)) {
            accum += ',{ "text":" ", "pageBreak": "after"},';
        }
    }
    return accum;
});