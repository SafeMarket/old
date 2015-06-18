SafeTrade is a bitcoin powered Firefox/TorBrowser add-on that allows users to engage in secure, trustless transactions.

* [Who](#who)
* [Why](#why)
* [Buyer Guide](#buyer-guide)
* [Vendor Guide](#vendor-guide)
* [Terminology](#terminoloty)

## Who is SafeTrade for?

SafeTrade is for Bitcoin vendors and buyers who are interested in direct commerce without third parties. SafeTrade automatically handles the tricky parts of direct commerce like currency conversions, encryption, payment validation, and refunds/withdrawls. 

## Why

Bitcoin users have often been the victim of hacking and scams. The anonymous and irreversible nature of bitcoin transactions make them a prime environment for scammers, hackers, and other nefarious elements. TradeSafe was built to facilitate trustless bitcoin commerce directly between vendors and buyers, where neither party needs to trust any third party.

##Buyer Guide

To get started with SafeTrade simply install the firefox/mozilla add-on. Right-click anywhere on the page and select "SafeTrade". Complete your settings and save.

When you see a `manifest` that you'd like to explore, highlight the manifest then right click. In the menu that pops up you should see a `Load Manifest` option. Finish your purchase then send the receipt to the vendor. Your receipt and message are automatically encrypted using PGP, so there's no need to encrypt it again.

##Vendors Guide 

To get started with SafeTrade simply install the firefox/mozilla add-on. Right-click anywhere on the page and select "SafeTrade". Complete your settings and save. Then head to the Products page and add your products and save.

When you finish, go to the Manifest page. Copy your manifest and paste it wherever buyers might find you.

##Terminology

There are two concepts unique to SafeTrade: manifests and receipts.

### Manifest

A manifest is a textual representation of a vendor. It conveys to the SafeTrade software information like the vendor's name, products, PGP key, and MPK. Manifests are *not* encrypted, they are encoded. That means anyone can decode a manifest and see what it contains.

### Receipt

A reciept is a textual representaiton of an order. It conveys to the SafeTrade software information like the products being ordered and the prices of those products. It can also be used against the bitcoin blockchain to verify the status of a particular order.


##Security and Privacy

SafeTrade is built to ensure the privacy of anyone who uses the system. If SafeTrade is used within TorBrowser, your IP address can not be linked to any of your transactions.

Manifests are signed by the vendor's address and receipts are signed by the buyers address. Receipts are pgp encrypted and can only be decrypted by the vendor and the buyer.

###Fingerprinting

TLDR: When used with TorBrowser, SafeTrade can **not** be used to fingerprint you.

You might have heard that browser add-ons can be used to fingerprint users. While this is true in some cases, it is not true for SafeTrade. Some add-ons such as ad-blockers inject various scripts and stylesheets onto the websites you visit. Assuming javascript is enabled, these websites can check for the existence of those scripts/stylesheets and use them to confirm that you are using a certain add-on. SafeTrade does not inject scripts/stylesheets onto the page, and therefore cannot be used to fingerprint you.


