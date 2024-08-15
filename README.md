Important commands for playwright

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
