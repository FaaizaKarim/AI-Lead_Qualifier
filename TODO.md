# TODO — Lead qualification fixes

- [x] Rewrite `extractQualification()` in `backend/src/services/grokService.js` with resilient JSON parsing
  - [x] Strip markdown fences robustly
  - [x] Extract first `{ ... }` JSON substring
  - [x] Add verbose logs: Raw LLM Response
- [x] Update `backend/src/routes/chat.js` smart triggers
  - [x] Keep existing `msgCount % 4` qualification trigger
  - [x] Add qualification sweep when meeting is offered/booked (independent of modulo)
  - [x] Update qualification sweep to be idempotent (don’t spam repeated extraction)


- [ ] Verify SQLite mapping consistency
  - [ ] Confirm `leads` columns match keys from extractor and `Lead.updateQualification()`
- [ ] Manual verification
  - [ ] Reproduce: book meeting after chat; Qualification tab should show non-zero score and resolved criteria

