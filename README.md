## e2cloud

Run your tests as Google Cloud functions.
Uses [ReportPortal](http://reportportal.io) to store results.

## Idea

[WIP]

## Commands

### Init

Prepare tests for running in cloud.

```
e2cloud init <framework>
```

Specify the testing framework you use. Example:

```
e2cloud init codeceptjs
```

### Deploy

Deploys function and all tests to cloud

```
e2cloud deploy
```

### Run

Executes each test as a cloud function.

Starts ReportPortal session and executes Cloud Functions as post requests.

```
e2cloud run
```

Just list all possible tests without running them in cloud:

```
e2cloud run --dry-run
```

Specify name of build:

```
e2cloud run --title "CI Build id $BUILD"
```

## Extending

To add your own framework see `frameworks` directory.

You should create directory for own framework and create files:

* `index.gcloud.js` file which contains functions:
    * `runTest` -  runs a test **in the cloud**
    * `getTests` - runs **locally**. Returns names of tests scheduled to run
    * `getReportPortalConfig` - runs **locally**. Returns ReportPortal credentials
* `package.json` contains all packages required to run test in cloud
* `init.js` - CLI installer.
    * Prepares `index.js` from `index.gcloud.js`
    * Checks for all required packages
    * Copies `package.json`

Then a framework should be added to `command/init.js` into array of supported frameworks.

## License

[WIP]