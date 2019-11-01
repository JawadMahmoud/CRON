/**
 * Splits the arguments from the input array and assigns to the corresponding label
 * @param {[]} args
 */
const splitArguments = args => {
  let cronExpressions = {};
  let cronParts = [
    "minute",
    "hour",
    "day of month",
    "month",
    "day of week",
    "command"
  ];
  let argIndex = args.indexOf("-args") + 1;
  let argParts = args.slice(argIndex);

  argParts.forEach((arg, index) => {
    cronExpressions[cronParts[index]] = arg;
  });
  return cronExpressions;
};

/**
 * Generates a sequence array using predefined min,max values or provided ones
 * and uses the identified expression format to do so
 * @param {string} exprFormat ["every", "range", "rangeth", "everyth", "single"]
 * @param {string} exprPart ["minute", "hour", "day of month", "month", "day of week"]
 * @param {string} expression
 */
const sequencer = (exprFormat, exprPart, expression) => {
  const allowedValues = {
    minute: {
      min: 0,
      max: 59
    },
    hour: {
      min: 0,
      max: 23
    },
    "day of month": {
      min: 1,
      max: 31
    },
    month: {
      min: 1,
      max: 12
    },
    "day of week": {
      min: 0,
      max: 6
    }
  };

  switch (exprFormat) {
    case "every":
      return everySequence(
        allowedValues[exprPart].min,
        allowedValues[exprPart].max
      );
    case "range":
      return rangeSequence(
        expression,
        allowedValues[exprPart].min,
        allowedValues[exprPart].max
      );
    case "single":
      return singleSequence(expression);
    case "everyth":
      return everythSequence(
        expression,
        allowedValues[exprPart].min,
        allowedValues[exprPart].max
      );

    case "rangeth":
      return rangethSequence(
        expression,
        allowedValues[exprPart].min,
        allowedValues[exprPart].max
      );
  }
};

const singleSequence = expression => {
  let sequence = [];
  sequence.push(parseInt(expression));
  return sequence;
};

const everySequence = (minVal, maxVal) => {
  let sequence = [];
  let current = minVal;
  let end = maxVal;
  for (current; current <= end; current++) {
    sequence.push(current);
  }
  return sequence;
};

const everythSequence = (expression, minVal, maxVal) => {
  let numRegEx = /\d+/gm;
  let step = parseInt(expression.match(numRegEx)[0]);
  let current = minVal;
  let end = maxVal;

  let sequence = [];
  for (current; current <= end; current += step) {
    sequence.push(current);
  }

  return sequence;
};

const rangethSequence = expression => {
  let [rangeMin, rangeMax] = rangeParser(expression);
  let numRegEx = /\d+/gm;
  let step = parseInt(expression.match(numRegEx)[2]);
  let current = parseInt(rangeMin);
  let end = parseInt(rangeMax);

  let sequence = [];
  for (current; current <= end; current += step) {
    sequence.push(current);
  }

  return sequence;
};

const rangeSequence = (expression, minVal, maxVal) => {
  let [rangeMin, rangeMax] = rangeParser(expression);
  let sequence = everySequence(parseInt(rangeMin), parseInt(rangeMax));
  return sequence;
};

const rangeParser = expression => {
  let numRegEx = /\d+/gm;
  let limits = expression.match(numRegEx);
  return [limits[0], limits[1]];
};

/**
 * Checks if expression format matches accepted ones and then generates a valid sequence
 * @param {string} expression
 * @param {string} part ["minute", "hour", "day of month", "month", "day of week"]
 */
const extractSequence = (expression, part) => {
  const format = matchFormat(expression);
  const sequence = sequencer(format, part, expression);
  return sequence;
};

/**
 * Checks if any of the predefined formats match the expression provided, throws excpetion otherwise
 * @param {string} expression
 */
const matchFormat = expression => {
  const FORMATS = {
    every: /^\*$/gm,
    everyth: /^\*\/\d+$/gm,
    single: /^\d+$/gm,
    range: /^\d+\-\d+$/gm,
    rangeth: /^\d+\-\d+\/\d+$/gm
  };

  let matchedFormat;

  Object.keys(FORMATS).forEach((key, index) => {
    if (FORMATS[key].test(expression)) {
      //   console.log(key);
      matchedFormat = key;
    }
  });
  if (matchedFormat === undefined) {
    throw "Invalid CRON format, kindly use only the accepted formats detailed in the docs";
  }

  return matchedFormat;
};

const separateExpressions = allExpressions => {
  return allExpressions.split(",");
};

/**
 * Ensures the comma-separated expressions are treated as separate parts and evaluted independently
 * @param {{}} allCronParts
 */
const splitParts = allCronParts => {
  let splitParts = {};
  Object.keys(allCronParts).forEach((key, index) => {
    splitParts[key] = separateExpressions(allCronParts[key]);
  });
  return splitParts;
};

/**
 * Processes each of the expressions and subsequent parts independently and joins each sequence and removes any duplicates
 * @param {[]} cronPart
 * @param {string} cronLabel
 */
const processCron = (cronPart, cronLabel) => {
  let extractedSequences = [];
  cronPart.forEach(part => {
    extractedSequences.push(extractSequence(part, cronLabel));
  });
  let finalSequence = [].concat.apply([], extractedSequences);
  finalSequence = [...new Set(finalSequence)];
  return finalSequence;
};

const printParsed = parsedArguments => {
  const columnLength = 14;
  Object.keys(parsedArguments).forEach((label, index) => {
    let columnLabel = label;
    for (let current = columnLabel.length; current < columnLength; current++) {
      columnLabel += " ";
    }
    let columnValue = parsedArguments[label].join(" ");
    let row = columnLabel + columnValue;

    console.log(row);
  });
};

/**
 * The main processor, takes the input arguments and outputs an object with labels assigined to calculated sequences
 * @param {[]} inputArguments
 */
const mainParser = inputArguments => {
  const cronLabels = [
    "minute",
    "hour",
    "day of month",
    "month",
    "day of week",
    "command"
  ];
  let processedCron = {};

  let cronParts = splitArguments(inputArguments);
  let splitCronParts = splitParts(cronParts);

  cronLabels.forEach((label, index) => {
    if (label !== "command") {
      processedCron[label] = processCron(splitCronParts[label], label);
    }
  });

  processedCron.command = splitCronParts.command;

  return processedCron;
};

module.exports = {
  splitArguments,
  sequencer,
  singleSequence,
  everySequence,
  everythSequence,
  rangeSequence,
  rangethSequence,
  rangeParser,
  extractSequence,
  matchFormat,
  separateExpressions,
  splitParts,
  processCron,
  printParsed,
  mainParser
};
