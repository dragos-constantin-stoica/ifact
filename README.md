
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
acdc push -db ifact -URL http://user:password@localhost:5984
```

The application should be availble at: http://localhost:5984/ifact/_design/app/index.html. Login with the administrator user from pre-requisite.

The landing page is the from where you fill in your profile. You should provide identification information about your company. This information includes: company name, address, identification nubmers and fiscal data, also you can add several bank accounts. Normally you are supposed to fill in this page only once.

On the left side you have a drawer menu that will allow you to define the other entityes: customers, contracts, invoices and payments.

A **customer** is an entity similiar to yours and will the partner you are doing business with. The input data is similar to yours, the only diference is that there are multiple customers and you are the only supplier.

Once you defined a customer then you may create **contracts**. The contract is a legal basis on which you will perform business with your customers. Please keep the copy of the contract in a safe place.

The next step is to deliver the services or goods you signed the contrat for and start invoicing!

## Create an inovce

The next important step, while dealing with your customers, is to emit invoices for your services and good according to the contract. The application is based on **PDFMake** to produce the actual electronic inovice.

There are two templates to choose form: EN and RO. They correspond to English/European and Romanian invoice templates. The templates contain a couple of fields that can be filled in by the user. You must provide a minimum amount of information:

* the bank account that you want the invoice to be payed to
* the customer
* VAT value as a percent
* the date of issue
* the description of the services provided
* a formula to compute the value of the invoice line

Pleas use _Preview_ button to inspect the inovice. You will see a draft PDF in the right panel, please note that the invoice number is the last valid number that is in the database. If you are happy with the result, then press _Create Invoice_ button, this time you will see the new invoice on the right panel with a diferent invoice number - a real, valid, invoice number.

## Reporting

In order to close the cycle you need to keep track of the payed invoices. The **Payments** will allow you to visualize the state of your invoices.