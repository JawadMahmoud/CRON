const { mainParser, printParsed } = require("./cron");

let finalCrons = mainParser(process.argv);
printParsed(finalCrons);
