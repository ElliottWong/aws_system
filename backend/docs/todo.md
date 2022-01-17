# a general todo list

***this is actually hell***

- [ ] ~~use yup to validate data on backend (kill 2 birds with one stone)~~ or validator

- [x] redo and get rid of `employee_avatars` -> use `constraints: false` on r/s between `employees` and `files`

- [x] rewrite errors to be `super()` and `this.message = 'message here'`

- [x] refresh token

- [x] central error handling

- [x] get rid of common paths, ie `/api/v1`

- [x] rename/remove some obscure r/s aliases

- [x] for perf and storage reasons, check all varchar and text datatype cols

- [ ] password strength validation on the backend

- [x] still need a better naming convention for files within folders

- [ ] fix company controller/model (i actually dont know what needs fixing here)

- [x] accounts uuid

- [x] fix middlewares to use account uuid and maybe refactor how they work - fetching data from db, parsing path params...

- [x] ~~decide whether to send empty arrays or remove them~~ **include empty arrays** (edit: i forgot i made it that way in utils/response, removed it)

- [x] redesign 7.1

- [x] move cloudinary, email from utils folder to services folder

- [ ] endpoints with pagination (mostly archives) need better validation (like parse id middleware)

- [ ] ~~ids in path params should be integers and name ending in `Id`; anything else should avoid ending in `Id` (`moduleId` -> `moduleCode`?)~~

- [ ] need an error to represent: delete document error where someone tries to delete another's rejected doc

- [ ] maybe invite system can be redone such that it makes use of employee without account?

- [x] remove the org secondary admin

- [ ] implement transactions clauses 1 thru 6

- [x] schemas/_common commonForm cols approved_on expired_on should be x_at

- [ ] better error handling for the email service

- [ ] maybe there needs to be api separation for users and platform admins (ie `/api/v1/a/...` or `api/v1/u/...`)

- [ ] invite controller/model

- [ ] can platform admins access company data (current assumption: yes)

- db table naming ~~hell~~ convention? (people who write sql: use singular; people who use ORM: use whatever you like)
    - [x] remove "company" prefix
    - join tables which i cannot think of a name for use "Model2Model" (i also saw "ModelXModel" but the X is a bit weird looking between PascalCase)
    - i now understand why people prefer singular names as opposed to plural names because some words lack plural forms which there are many

- [ ] clauses 1 - 6 rejection/approval does not check user that is rejecting/approving against the db record (the approved_by column)

- model/files.js insertFileRecord method typically comes before another insert (the document in which the file is attached to), but if the other insert fails, insertFileRecord should also rollback

- [x] migrate to from the old marak/faker.js to the new faker-js/faker (https://github.com/faker-js/faker)

- [ ] decide on file upload within system... some do cloudinary and db separately, some do together

- [ ] a new function that takes checks for approve and edit rights of the approver and creator respectively (less mess to check in the controllers)

- [ ] double check routes with file upload that should an error arise file is deleted from cloudinary
