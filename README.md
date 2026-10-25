User Registration and Search — Database Project
Target completion: Tuesday, October 27, 2026
Official deadline: Thursday, October 29, 2026
Team: 2 members (assign tasks together)
Stack: XAMPP (Apache + MySQL), Node.js, Express, HTML, CSS, JavaScript, Git/GitHub
Project Requirements
- [ ]
  1. User registration
- [ ]
  2. Secure user sign-in (prevent SQL injection)
- [ ]
  3. Search by first name and/or last name
- [ ]
  4. Search by user ID / username
- [ ]
  5. Search by salary range (X to Y)
- [ ]
  6. Search by age range (X to Y)
- [ ]
  7. Find users who registered after user john
- [ ]
  8. Find users who never signed in
- [ ]
  9. Find users who registered on the same day as john
- [ ]
  10. Find users who registered today
- [ ] Demonstrate GitHub collaboration: local/remote repo, clone, fetch, pull, add, commit, push
- [ ] Submit all SQL statements in sql.txt
- [ ] Record video demonstrating and explaining functionality, query results, and GitHub operations
Day 1 — Saturday, October 24: Setup and Database
Goal: Both computers can run the application and the database is ready.
- [ ] Install XAMPP; start Apache and MySQL.
- [ ] Install Node.js, Git, and VS Code; verify installations.
- [ ] Create a shared GitHub repository and add the collaborator.
- [ ] Clone the repository on both computers.
- [ ] Review the professor's sample repository and decide how to structure the project.
- [ ] Run the sample frontend and backend locally.
- [ ] Create the web_app MySQL database in phpMyAdmin.
- [ ] Create the Users table with username, password hash, first name, last name, salary, age, registration date, and last sign-in time.
- [ ] Configure a local .env file for the backend; add .env and node_modules/ to .gitignore.
- [ ] Create sql.txt and add database/table creation SQL.
- [ ] Create/update README.md; make the first commits and push to GitHub.
Day 1 done when: App starts, MySQL connection works, and both teammates can pull the shared repository.
Day 2 — Sunday, October 25: Registration and Secure Sign-In
Goal: Users can register, sign in securely, and have sign-in time recorded.
- [ ] Build a registration form with required user fields.
- [ ] Implement the backend registration endpoint.
- [ ] Validate submitted inputs and reject duplicate usernames.
- [ ] Hash passwords securely before storing them (e.g., bcrypt).
- [ ] Build a sign-in form.
- [ ] Implement sign-in using parameterized SQL queries (never concatenate user input into SQL).
- [ ] Compare submitted passwords to stored password hashes.
- [ ] Update signintime after successful sign-in.
- [ ] Show useful success/error messages in the frontend.
- [ ] Test registration, duplicate usernames, wrong passwords, and SQL injection attempts.
- [ ] Add registration and sign-in SQL statements to sql.txt.
- [ ] Commit, push, pull, and synchronize work through GitHub.
Day 2 done when: Registration and login work end-to-end, passwords are hashed, and SQL injection attempts cannot bypass login.
Day 3 — Monday, October 26: Search Queries and Frontend
Goal: All 10 required features work through the website.
- [ ] Search by first name, last name, or both.
- [ ] Search by username / user ID.
- [ ] Search by salary range (X–Y).
- [ ] Search by age range (X–Y).
- [ ] Search users registered after john.
- [ ] Search users who never signed in (signintime IS NULL).
- [ ] Search users registered on the same day as john.
- [ ] Search users registered today.
- [ ] Create frontend controls for each query and display results in readable tables.
- [ ] Improve UI styling, navigation, loading/error messages, and empty-result messages.
- [ ] Add enough sample users to test each case, including john and users with different dates, salaries, ages, and sign-in histories.
- [ ] Verify the returned results of every query.
- [ ] Complete sql.txt with all required SQL statements.
- [ ] Pull/merge changes and test the combined application.
Day 3 done when: Each required query returns correct results from the website and sql.txt is complete.
Day 4 — Tuesday, October 27: Testing, GitHub Demo, Video, Submission
Goal: Project is complete and ready for submission.
- [ ] Start the application from scratch using the README setup instructions.
- [ ] Retest registration, login, and all eight search functions.
- [ ] Confirm incorrect credentials and SQL injection attempts fail.
- [ ] Test missing john, empty results, reversed salary/age ranges, and invalid input.
- [ ] Confirm sql.txt contains the statements used by the application.
- [ ] Demonstrate git clone, git fetch, git pull, git add, git commit, and git push.
- [ ] Explain local vs. remote Git repositories in the demo.
- [ ] Update the README with installation, configuration, running, and testing instructions.
- [ ] Record a walkthrough showing registration, sign-in, eight queries, SQL results, and GitHub collaboration.
- [ ] Watch the recording and confirm explanations/results are clear.
- [ ] Verify no .env, passwords/secrets, or node_modules/ are committed.
- [ ] Finalize submission files and submit when the portal is available.
Day 4 done when: The app works, the video is recorded, SQL file is complete, and the repository is submission-ready.



   
   
   


