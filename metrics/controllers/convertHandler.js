const validUnits = ["gal", "l", "mi", "km", "lbs", "kg"];

function ConvertHandler() {
  this.getNum = function (input) {
    const numMatch = input.trim().match(/^[\d./]+/);

    if (!numMatch) {
      return 1;
    }

    const numString = numMatch[0];
    const fractionParts = numString.split("/");
    const decimalPattern = /^\d+(\.\d+)?$/;

    if (fractionParts.length > 2) {
      return "invalid number";
    }

    if (fractionParts.length === 2) {
      const numerator = fractionParts[0];
      const denominator = fractionParts[1];

      if (
        !decimalPattern.test(numerator) ||
        !decimalPattern.test(denominator)
      ) {
        return "invalid number";
      }

      return parseFloat(numerator) / parseFloat(denominator);
    }

    if (!decimalPattern.test(numString)) {
      return "invalid number";
    }

    return parseFloat(numString);
  };

  this.getUnit = function (input) {
    const unitMatch = input.trim().match(/[a-zA-Z]+$/);

    if (!unitMatch) {
      return "invalid unit";
    }

    const normalizedUnit = unitMatch[0].toLowerCase();

    if (!validUnits.includes(normalizedUnit)) {
      return "invalid unit";
    }

    return normalizedUnit === "l" ? "L" : normalizedUnit;
  };

  this.getReturnUnit = function (initUnit) {
    let result;

    let u = this.getUnit(initUnit);
    if (u !== "invalid unit") {
      switch (u) {
        case "L":
          result = "gal";
          break;
        case "gal":
          result = "L";
          break;
        case "mi":
          result = "km";
          break;
        case "km":
          result = "mi";
          break;
        case "lbs":
          result = "kg";
          break;
        case "kg":
          result = "lbs";
          break;
      }
    }
    return result === undefined ? "invalid unit" : result;
  };

  this.spellOutUnit = function (unit) {
    let result;

    let u = this.getUnit(unit);
    if (u !== "invalid unit") {
      switch (u) {
        case "L":
          result = "liters";
          break;
        case "gal":
          result = "gallons";
          break;
        case "mi":
          result = "miles";
          break;
        case "km":
          result = "kilometers";
          break;
        case "lbs":
          result = "pounds";
          break;
        case "kg":
          result = "kilograms";
          break;
      }
    }
    return result === undefined ? "invalid unit" : result;
  };

  this.convert = function (initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    let result;

    let iN = initNum;
    let iU = this.getUnit(initUnit);

    if (iN !== "invalid number" && iU !== "invalid unit") {
      switch (iU) {
        case "gal":
          result = iN * galToL;
          break;
        case "L":
          result = iN / galToL;
          break;
        case "lbs":
          result = iN * lbsToKg;
          break;
        case "kg":
          result = iN / lbsToKg;
          break;
        case "mi":
          result = iN * miToKm;
          break;
        case "km":
          result = iN / miToKm;
          break;
      }
    }
    return result ? result : "Conversion error";
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    returnNum = parseFloat(returnNum.toFixed(5));
    return {
      initNum: initNum,
      initUnit: initUnit,
      returnNum: returnNum,
      returnUnit: returnUnit,
      string: `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum.toFixed(5)} ${this.spellOutUnit(returnUnit)}`,
    };
  };
}

module.exports = ConvertHandler;
