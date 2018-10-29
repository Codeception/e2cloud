Feature('GitHub');

Data(function*() {
  for (let i = 0; i < 5; i ++) { // 5 tests
    yield {
      login: 'john' + i,
      toString: function() { return this.login }
    }
  }
}).Scenario('Login GitHub', (I, current) => {
  I.amOnPage('https://github.com');
  I.see('GitHub');
  I.click('Sign in');
  I.fillField('Username or email address', current.login);
  I.fillField('Password', '123456');
  I.see('New to GitHub?');
});
