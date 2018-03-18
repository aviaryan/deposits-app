- [x] excellent backend validation (password min length, username, realistic values)
- [x] password 2 times check
- [x] basic pagination with filter
- [x] list of users to assign deposit (by username email and ID)
- [x] click on new deposit on a user page has user selected pre-selected for admin
- [x] username instead of id for deposits, username - user endpoint
- [x] implement change password
- [ ] fine tune is_verified (or send welcome email on join)
- [ ] list of banks (looks important)
- [ ] all feature in deposit list maybe (not said so)
- [ ] front-end validation
- [x] integrate tests, be auto is_verified when testing (no mail)

bugs

- [x] confirmation on delete
- [x] lag on homepage when logged in
- [x] end date null from UI
- [ ] sign up button on sign up page
- [x] order in lists deposits and users

thoughts

- [x] save state for users and deposits list for faster load on back, no need to add to that state cuz we don't know if that data belongs to current page, delete user might work on users state though.
- [ ] error handling in all requests, xhr.responseJSON can go wrong too so check that and throw error in a different way

last times

- [ ] check manager and normal user accounts as well
