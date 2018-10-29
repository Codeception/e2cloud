Feature('GitHub');

Data(function*() {
  // generate 20 tests
  for (let i = 0; i < 20; i ++) {
    yield {
      login: 'john' + i,
      toString: function() { return this.login }
    }
  } // generating and launcging 5 TESTS
}).Scenario('Login GitHub', (I, current) => {
  I.amOnPage('https://github.com');
  I.see('GitHub');
  I.click('Sign in');
  I.fillField('Username or email address', current.login);
  I.fillField('Password', '123456');
  I.see('New to GitHub?');
});
