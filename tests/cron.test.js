const {
  splitArguments,
  splitParts,
  singleSequence,
  everySequence,
  everythSequence,
  rangeParser,
  rangeSequence,
  rangethSequence,
  matchFormat,
  extractSequence,
  mainParser
} = require("../src/cron");

describe("test splitting of arguments from the Command Line", () => {
  it("should assign arguments from command line accurately", () => {
    let expected = {
      minute: "*/15",
      hour: "0",
      "day of month": "1,15",
      month: "*",
      "day of week": "1-5",
      command: "/usr/bin/find"
    };
    let actualReturn = splitArguments(
      "node index.js -args */15 0 1,15 * 1-5 /usr/bin/find".split(" ")
    );
    expect(actualReturn).toStrictEqual(expected);
  });
});

describe("test splitting series of expressions in single arguments", () => {
  it("should split expressions by a comma", () => {
    let expected = {
      minute: ["*/15", "55"],
      hour: ["0-3"],
      "day of month": ["1", "15"],
      month: ["*"],
      "day of week": ["1-5"],
      command: ["/usr/bin/find"]
    };
    let splittedArgs = splitArguments(
      "node index.js -args */15,55 0-3 1,15 * 1-5 /usr/bin/find".split(" ")
    );
    let actualReturn = splitParts(splittedArgs);
    expect(actualReturn).toStrictEqual(expected);
  });
});

describe("test processing different types of sequences in expressions", () => {
  it("should correctly output single digit as an array with single digit", () => {
    let expected = [5];
    let actual = singleSequence("5");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output array of range", () => {
    let expected = [1, 2, 3, 4, 5];
    let actual = everySequence(1, 5);
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output array of range with step increments", () => {
    let expected = [0, 15, 30, 45];
    let actual = everythSequence("*/15", 0, 59);
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output limits of range processed from sequence of characters", () => {
    let expected = ["5", "15"];
    let actual = rangeParser("5-15");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output array of range from processed ramge limits", () => {
    let expected = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let actual = rangeSequence("5-15");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output array of range from processed limits with steps", () => {
    let expected = [5, 10, 15];
    let actual = rangethSequence("5-15/5");
    expect(actual).toStrictEqual(expected);
  });
});

describe("test validation of all allowed formats", () => {
  it("should recognize format '*'", () => {
    let expected = "every";
    let actual = matchFormat("*");
    expect(actual).toBe(expected);
  });

  it("should recognize format '*/5'", () => {
    let expected = "everyth";
    let actual = matchFormat("*/5");
    expect(actual).toBe(expected);
  });

  it("should recognize format '5'", () => {
    let expected = "single";
    let actual = matchFormat("5");
    expect(actual).toBe(expected);
  });

  it("should recognize format '5-15'", () => {
    let expected = "range";
    let actual = matchFormat("5-15");
    expect(actual).toBe(expected);
  });

  it("should recognize format 5-15/5", () => {
    let expected = "rangeth";
    let actual = matchFormat("5-15/5");
    expect(actual).toBe(expected);
  });
});

describe("test if correct sequences are extracted for each format", () => {
  it("should correctly output single digit sequence for expression '5'", () => {
    let expected = [5];
    let actual = extractSequence("5");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output range sequence for expression '5-10'", () => {
    let expected = [5, 6, 7, 8, 9, 10];
    let actual = extractSequence("5-10", "minute");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output full range sequence relative to part of cron for expression '*' and part 'month'", () => {
    let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let actual = extractSequence("*", "month");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output full range sequence relative to part of cron and with steps for expression '*/6' and part 'hour'", () => {
    let expected = [0, 6, 12, 18];
    let actual = extractSequence("*/6", "hour");
    expect(actual).toStrictEqual(expected);
  });

  it("should correctly output full range sequence relative to part of cron for expression '5-15/5' and part 'minute'", () => {
    let expected = [5, 10, 15];
    let actual = extractSequence("5-15/5", "minute");
    expect(actual).toStrictEqual(expected);
  });
});

describe("test several inputs", () => {
  it("5 0 * 8 *", () => {
    let inputArguments = "node index.js -args 5 0 * 8 * /usr/bin/find".split(
      " "
    );
    let expected = {
      minute: [5],
      hour: [0],
      "day of month": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
      ],
      month: [8],
      "day of week": [0, 1, 2, 3, 4, 5, 6],
      command: ["/usr/bin/find"]
    };
    let actual = mainParser(inputArguments);
    expect(actual).toStrictEqual(expected);
  });

  it("23 0-20/2 5-10 */6 3", () => {
    let inputArguments = "node index.js -args 23 0-20/2 5-10 */6 3 /usr/bin/find".split(
      " "
    );
    let expected = {
      minute: [23],
      hour: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      "day of month": [5, 6, 7, 8, 9, 10],
      month: [1, 7],
      "day of week": [3],
      command: ["/usr/bin/find"]
    };
    let actual = mainParser(inputArguments);
    expect(actual).toStrictEqual(expected);
  });
});
