# SafeMarket 0.0.25

[http://safemarket.github.io](http://safemarket.github.io)

## Quickstart

1. [Download the add-on](https://github.com/SafeMarket/SafeMarket/raw/0.0.25/safemarket.xpi?raw=true)
2. In Firefox or TorBrowser, head to the Add-Ons menu (its located under the burger menu right of the URL bar).
Click the gear icon, then "Install Add-on From File" and select the safemarket.xpi file you previously downloaded.
3. Head to any page and right click anywhere on the page. Then select "Open SafeMarket".

## Verifying the Download

1. [Download the PGP signature](https://github.com/SafeMarket/SafeMarket/raw/0.0.25/safemarket.xpi.asc?raw=true)
2. Download the PGP public key with `gpg --recv-keys $KEY_ID`. For security reasons, the key id is listed here: https://www.reddit.com/r/SafeMarket/wiki/index.
2. Run `gpg --verify safemarket.xpi.asc safemarket.xpi` and make sure the key id is `7B1B5C52`
