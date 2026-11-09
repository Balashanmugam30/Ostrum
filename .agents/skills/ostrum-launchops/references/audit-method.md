# Evidence-led audit method

## The first question is “what is this product?”

Do not apply an app-security or SaaS checklist to a static marketing site. Inventory routes and data flows, then map each control to a real feature. Use `NOT APPLICABLE` explicitly so that omitted irrelevant checks are not mistaken for oversights.

## Evidence ladder

| Level | What it proves | What it does not prove |
|---|---|---|
| Source | A configuration or code path exists at an exact commit | It runs correctly or is deployed |
| Local | A named command/test passed against a local build | DNS, edge rules, public TLS, email delivery or field performance |
| Staging | A named test passed against a named staging deployment | Production secrets, DNS, traffic or production account settings |
| Live | A named check passed against the exact production URL at a timestamp | Future behaviour, all users, compliance or security guarantee |
| Owner | A human verified an external account, contract or business fact | Code correctness unless separately tested |

A test output copied into a report is evidence only after the corresponding command, target and source ref are available. Record the command, exit code, output/artefact path and timestamp.

## Severity rubric

- P0: proven severe confidentiality, integrity or availability impact, active exposed credential, critical reachable dependency flaw, or serious customer-data loss.
- P1: reachable abuse or privacy risk on a public endpoint; critical enquiry flow broken; significant accessibility barrier; incorrect production host/indexability.
- P2: material user experience, moderate security hardening or operational gap.
- P3: non-blocking enhancement.

Use likelihood × impact and note compensating controls. A missing best-practice header is not automatically a confirmed vulnerability if another verified control already protects the boundary.

## Finding record

```yaml
id: SEC-001
priority: P1
status: FAIL | NOT VERIFIED | OWNER ACTION | NOT APPLICABLE
source_ref: <full commit SHA>
file: app/api/example/route.ts
lines: 40-72
principal: anonymous internet visitor
resource: enquiry API
boundary: client request -> server parser/provider
observed_result: <actual result or exact unresolved fact>
fix: <smallest effective change>
verification: <command, test, staging URL or owner action>
```

## Review technique

1. Read the complete relevant function/config before diagnosing a line.
2. Trace inputs through validation, storage/provider, output encoding and logs.
3. Identify source-controlled vs host-controlled behaviour.
4. Reproduce only the minimum safe effect required to prove a defect.
5. Have a separate reviewer/agent attempt to disprove security findings when the platform supports it.
6. For an external control that cannot be observed, state the exact dashboard, setting, request or owner confirmation needed.
7. Keep all claims bounded to the reviewed commit and test target.

## Safe tool use

Use passive/source inspection by default. Run active scanners only on a staging target that the user owns and explicitly authorises. Never probe third-party websites, shared production systems, customer data, real identities, or other tenants. Avoid destructive tests and load tests against public production.

## OSTRUM application example

At the inspected public `main` commit `54d510f`, routes and dependencies indicated a portfolio + contact form, not SaaS. Therefore:

- In scope: public HTTP surface, `/api/enquiry`, Resend configuration, rate limiting, proxy identity, validation, dependency advisories, security headers, browser storage, public metadata, robots/sitemap, WebGL/images, accessibility, legal wording and asset licences.
- Out of scope absent new evidence: password hashing, MFA, login lockout, IDOR between user accounts, SQL injection on app-owned database queries, database indexes, N+1 query batching, cursor pagination, subscription cancellation, payment/refund/shipping workflows.

Always re-check the current branch: Antigravity may have added a feature after this reference was prepared.
