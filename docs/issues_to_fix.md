- [x] excellent backend validation (password min length, username, realistic values)
- [x] password 2 times check
- [x] basic pagination with filter
- [x] list of users to assign deposit (by username email and ID)
- [x] click on new deposit on a user page has user selected pre-selected for admin
- [x] username instead of id for deposits, username - user endpoint
- [x] implement change password
- [x] fine tune is_verified (or send welcome email on join)
- [x] list of banks (looks important)
- [x] username a-z0-9-_
- [x] max number input in savings
- [ ] all feature in deposit list maybe (not said so)
- [ ] front-end validation
- [ ] user set password on invite (admin is god, manager is god)
- [x] integrate tests, be auto is_verified when testing (no mail)

bugs

- [x] confirmation on delete
- [x] lag on homepage when logged in
- [x] end date null from UI
- [x] sign up button on sign up page
- [x] is_admin / manager buttons on manager's user page
- [x] order in lists deposits and users
- [x] order in final report print

thoughts

- [x] save state for users and deposits list for faster load on back, no need to add to that state cuz we don't know if that data belongs to current page, delete user might work on users state though.
- [x] error handling in all requests, xhr.responseJSON can go wrong too so check that and throw error in a different way

last times

- [ ] check manager and normal user accounts as well


can show

- deposits list state saving on user deposit list


known

- the whole verified fiasco
- account number bank pairs - no way of verifying now so
