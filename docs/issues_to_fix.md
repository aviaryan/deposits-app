- [x] excellent backend validation (password min length, username, realistic values)
- [x] password 2 times check
- [ ] basic pagination with filter
- [x] list of users to assign deposit (by username email and ID)
- [ ] fine tune is_verified
- [ ] front-end validation
- [ ] list of banks


bugs

- [ ] confirmation on delete
- [x] lag on homepage when logged in


thoughts

- [ ] save state for users and deposits list for faster load on back, no need to add to that state cuz we don't know if that data belongs to current page.
- [ ] error handling in all requests, xhr.responseJSON can go wrong too so check that and throw error in a different way
