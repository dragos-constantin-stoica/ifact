
<table border="0">
  <tr>
    <td>
    <img src="https://github.com/iqcouch/ifact/blob/master/Logo.png" alt="Logo"></img>
    </td>
    <td>
    <small>"Invoicing made simple"</small>  <br/><p align="right"><em>for simple people!</em></p>
    </td>
  </tr>
</table>


# iFact

**iFact** is an invoicing web application that I wrote in a spare moment between projects as a personal tool to help me create my invoices having a minimal invoices management.
The name comes as an acronym **i** - letter that was imposed by Apple&trade;&reg; and **Fact**ură - which means _invoice_ in Romanian ... and also sounds interesting if you pronounce it in a certain way, and this was on purpose.

This is a **S**ingle **P**age **A**pplication written with [Webix](https://webix.com/) framework, running as a couchapp directly
from [Apache CouchDB](http://couchdb.apache.org/) server. The application
may be synced forth and back from CouchDB to local folder with [AC:zap:DC](https://github.com/iqcouch/acdc) utility.
The invoices are generated as PDF files via [PDFmake](http://pdfmake.org/) framework.

## Install and Setup

Pre-requisites:

* CouchDB version 1.6.1 or later installed. Create `ifact` database and add one user as administrator.
* `git` tool
* **AC**:zap:**DC** tool

Clone this repository to local machine.

```bash
git clone https://github.com/iqcouch/ifact.git
```

Copy the `acdc` executable to parent folder of `ifact` and push the application to your CouchDB instance:

```bash
acdc push -db ifact
```

The application should be availble at: http://localhost:5984/ifact/_design/app/index.html. Login with the administrator user from pre-requisite.

## Create an inovce

## Reporting

