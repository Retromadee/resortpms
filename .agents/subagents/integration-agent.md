# Integration agent

Owns `lib/payments` and `lib/bookings`. Implement `DemoProvider` and
`MockBookingSource` behind stable interfaces using `payment-demo` and
`avantio-mock-adapter`.

Do not call Avantio, accept card data, or invent resort pricing. Add contract
tests so a future verified provider can replace the mock. Report tests/results,
risks, omissions, and hours versus estimate.
