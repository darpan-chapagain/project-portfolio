---
title: "E-commerce Marketplace Integration & Synchronization Platform"
short: "Marketplace sync"
kind: professional
order: 7
domain: "SaaS, E-commerce Integrations"
role: "Tech Support Team Lead & Scrum Master"
summary: "Merchants selling on several channels at once (Shopify, Etsy, eBay, Amazon, Faire, WooCommerce) had to keep listings, stock, and orders in step by hand."
results:
  - "Reduced manual merchant errors by approximately 25%"
  - "App store rating improved from 4.5 to 4.8"
  - "Support tickets down 30% after better backend error handling in the Shopify and Etsy sync"
  - "Listing-to-sale time for WooCommerce sellers on Amazon and eBay down 15%"
  - "Average customer response time cut from 12 hours to 45 minutes"
  - "Customer satisfaction up from 75% to 90% in a year"
stack:
  - "PHP"
  - "Laravel"
  - "React"
  - "MySQL"
  - "Shopify"
  - "Etsy"
  - "eBay"
  - "Amazon"
  - "Faire"
  - "and WooCommerce APIs"
company: "Proshore (Digital Product Labs)"
art: "sync"
group: "platforms"
apps: [{"name":"DPL Etsy Integration","url":"https://apps.shopify.com/etsy-integration-dpl","art":"sync","blurb":"Two-way sync between Shopify and Etsy: listings, stock by SKU and location, and orders with tracking."},{"name":"DPL eBay Integration","url":"https://apps.shopify.com/ebay-integration-dpl","art":"card","blurb":"Connects a Shopify store to one or more eBay accounts, eBay Motors included, with stock and order sync."},{"name":"Faire: Import, Export, Fulfill","url":"https://apps.shopify.com/faire-integration-dpl","art":"coins","blurb":"Lets brands sell wholesale on Faire from Shopify, with products, stock, orders and tracking kept in step."},{"name":"Awin, CJ Product Feed","url":"https://apps.shopify.com/dpl-product-feed-inventory","art":"browser","blurb":"Publishes products to the Awin and CJ affiliate networks and refreshes the feeds every day."},{"name":"License Keys & Codes","url":"https://apps.shopify.com/dpl-selling-codes-keys","art":"key","blurb":"Sells game codes and license keys on Shopify, and delivers each one to the buyer right after payment."}]
---

## Problem
Merchants selling on several channels at once (Shopify, Etsy, eBay, Amazon, Faire, WooCommerce) had to keep listings, stock, and orders in step by hand. One missed update meant overselling an item that had already sold elsewhere, and hours of manual reconciliation.

## Context
Digital Product Labs builds a family of Shopify apps that connect a store to other sales channels: DPL Etsy Integration, DPL eBay Integration, Faire: Import, Export, Fulfill, an Awin and CJ product feed for affiliate networks, and License Keys & Codes for selling digital keys. I worked across these apps for two and a half years, first in customer technical support and PHP development, then as Scrum Master, then leading the support team.

## How It Was Built
Synchronization is webhook driven: marketplace events (a sale, a stock change) trigger background jobs rather than blocking the request that generated them. Each job is built to handle partial failure gracefully, since a downstream marketplace API returning an error or timing out shouldn't leave inventory counts inconsistent across platforms; failed jobs are retried with rate-limit awareness so retries don't trip the marketplace's own throttling.

Inventory is matched by SKU and location, so a sale on one channel reduces stock everywhere else. Orders flow back into Shopify with their tracking details, and merchants choose which fields (price, title, description) sync, so a channel-specific listing isn't overwritten by accident.

## My Part
- Fixed bugs and shipped feature updates in PHP and Laravel across the Shopify, Etsy, and WooCommerce sync apps, and kept their data consistent
- Ran Scrum ceremonies (planning, standups, reviews, retros) and kept the backlog clean
- Led a 6-person customer support team serving merchants worldwide
- Turned support tickets into product work: recurring issues went straight into the backlog as fixes and improvements
- Reworked the HelpScout setup with automated tagging and better FAQ flows

## Key Technical Details
- Webhook driven updates across Shopify, Etsy, eBay, Amazon, Faire, and WooCommerce
- Background job processing decoupled from the triggering request
- Rate limit aware retry logic and partial failure handling
- SKU and location based inventory matching to prevent overselling
- Data consistency enforcement across marketplaces after partial failures

## Results
- Reduced manual merchant errors by approximately 25%
- App store rating improved from 4.5 to 4.8
- Support tickets down 30% after better backend error handling in the Shopify and Etsy sync
- Listing-to-sale time for WooCommerce sellers on Amazon and eBay down 15%
- Average customer response time cut from 12 hours to 45 minutes
- Customer satisfaction up from 75% to 90% in a year
