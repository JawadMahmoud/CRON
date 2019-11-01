# CRON Parser

A simple application CLI application to parse CRON Expressions, built on nodejs.

Author - [Jawad Mahmoud](https://github.com/JawadMahmoud)

## Get Up & Running

- Clone the repository or download and extract the zip file
- Navigate to the root directory of the project and install the dependencies
- Note: You need to have `NodeJS` and either `npm` or `yarn` installed on your machine
- Run the following command to install dependencies

```shell
yarn
```

- That's all the setup needed, you can now run and test the parser
- For running tests, use the following command (uses the `jest` testing framework)

```shell
yarn test
```

- Sample execution of the parser

```shell
node src/index.js -args */15 0 1,15 * 1-5 /usr/bin/find
```

## Project Structure

The main helper functions for the program are placed in the file `src/cron.js` and the program can be executed by running the `src/index.js` file from the terminal with the arguments.

The tests can be found in the `tests` folder.

## Accepted Formats and Arguments

When running the program it is important that the CRON expression is provided after the `-args` tag. The program accepts the standard CRON format for 5 time fields in order, followed by the command:

```shell
-args 'minute' 'hour' 'day of month' 'month' 'day of week' /usr/bin/find
```

The program does not accept any string values such as special strings `@yearly` or `MON-WED`. All other numeric and special characters are accepted, the program also assumes that the input values are valid (values for hour don't exceed 23 or any negative values), validation can be added later.

Some example valid expressions:

`*/15 0 1,15 * 1-5 /usr/bin/find`

`30-45/15 * 1,15,25 */3 1 /usr/bin/find`

`* */2 10-15,25 2 */1`

Program's assumed valid values for each part of the arguments:

- Minute : 0 - 59
- Hour : 0 - 23
- Day of Month : 1 - 31
- Month : 1 - 12
- Day of Week : 0 - 6

## External Libraries

[JEST](https://jestjs.io/) - Testing framework
