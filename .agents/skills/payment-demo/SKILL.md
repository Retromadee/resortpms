---
name: payment-demo
description: Mock payment flow for the demo only. Use for any checkout, charge-to-stay or receipt screen.
---
# payment-demo
- Payments are NOT verified yet. Build a clearly labelled DEMO payment flow only; no card form or card number is needed.
- Never collect, store or log card data. Store only amount, currency, reservation id, status 'demo_paid', timestamp.
- Choices: "Pay now (demo)", "Add to my stay", "Pay at venue". These are illustrative workflow choices; no charge is initiated.
- Show banner "Demo mode - no money moves" on every payment screen and receipt.
- All logic behind one interface PaymentProvider { createCharge, getStatus } with DemoProvider now; a real provider is swapped in later after management verifies one.
