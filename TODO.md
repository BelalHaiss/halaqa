Code Readability

- always use single source of truth like zod schema with utility types or typescript type and then use utility type with same type

- shared types + Role + zod schema
  check what db is best ?
- backend with prisma and make prisma generate types out in shared if posibble
- start implement

later
-ui make learner page component same as other

groups[groupid] page
learners list

- search component should be same as group page

groups/[groupitem]
-dark mode is not active for all card components like learner and session info and session history

- we should have old sessions only instead of الجلسات القادمة
  -group or session should has status active or not active

important make reusable component and make other page use it and make reusable and pass props to it

- search like the one in groups page
- learner item component like the on in

General
-we should have alert dialog for any action like delete
-format time with luxon to be 12hrs not 24 format
