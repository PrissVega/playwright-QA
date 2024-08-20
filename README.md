**Requirements**
1. Install npm
2. Install playwright

**Consider:**
There are two test folders: E2E and Test
>> The E2E folder contains the front end **functional tests**. To execute only this segment place:
**npx playwright test E2E_Postventa_process.spec.js --ui**
(Include --ui if you want to see graphically how the test is executed, otherwise just the rest of the command without --ui generates a summary of the tests in the file without the graphical part).
>>The Test folder is for the **tests performed in APIS**, where the response code (200, 400, 500), the response time, the fields and their data types are placed, with the comparison of these headers and their data types between the DB and the API:
**npx playwright test** (all)
**npx playwright test APIS_gestion.spec.js** (specify which to test)

**Important commands for playwright**
***** Run test *****
Run all test in the project 
1. Run test in headed mode: npx playwright test --headed
2. Run test with UI mode (dev): npx playwight test --ui
3. Run in command Line (headless mode):npx playwirght test
4. Show report: npx playwright show-report
5. Run test with specific title: npx playwright test -g "title test"

***** Debug *****
1. All test: npx playwright test --debug
2. Specific test: npx playwright test example.spec.js --debug

***** Record *****
Codegen: npx playwright codegen
Only: Click/Fill and Assertions(Visibility, text, value)
