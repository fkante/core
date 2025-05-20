import countryCodeLookup from "country-code-lookup";
import { addMinutes, format } from "date-fns";

import { INITIALS_TO_NAME, Platform } from "./definitions";

//! Todo: split this file. its too big already

export function responsibleInitialsToName(initials: string) {
  return (
    INITIALS_TO_NAME[initials as keyof typeof INITIALS_TO_NAME] || initials
  );
}

export function chunk<T>(array: T[], limit: number) {
  const chunkedArray = array.reduce((resultArray: T[][], item, index) => {
    const chunkIndex = Math.floor(index / limit);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
  return chunkedArray;
}

export function getAppCodeWithoutPlatform(appCode: string) {
  return appCode.split("-")[0];
}

export function getPlatformFromAppCode(appCode: string) {
  return isIOS(appCode) ? Platform.iOS : Platform.Android;
}

export function truncateNumberWithTwoDecimals(n: number) {
  // Don't truncate number if it is a round number
  if (!n.toString().includes(".")) {
    return n.toString();
  }
  return n.toFixed(2);
}

export function roundToPrecision(value: number, precision = 0) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

// 2020-12-20 08:52:01
export function formatDateTime(date: Date) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

// 2020-12-20
export function formatDate(
  date: Date,
  dateFormat: "yyyy-MM-dd" | "yyyyMMdd" | "yyyy-MM" = "yyyy-MM-dd"
) {
  return format(date, dateFormat);
}

export function isValidDate(date: Date) {
  return date instanceof Date && !isNaN(date.getTime());
}

// 08:52:01
export function formatTime(date: Date) {
  return format(date, "HH:mm:ss");
}

export function isMorning(date: Date) {
  const hour = getGMTDate(date.getTime().toString(), true).getHours();
  return hour < 12;
}

export function isAfternoon(date: Date) {
  const hour = getGMTDate(date.getTime().toString(), true).getHours();
  return hour >= 12;
}

export function getDateInThePast(count: number) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - count);

  return yesterday;
}

export function getGMTDate(timestamp: string, fromDate = false) {
  const multiplier = fromDate ? 1 : 1000;
  const date = new Date(parseInt(timestamp, 10) * multiplier);
  const timezoneOffset = new Date().getTimezoneOffset();
  return addMinutes(date, timezoneOffset);
}

export function getElementTrimmedFromParenthesis(element: string) {
  return element ? element.replace(/\((.*?)\)/g, "").trim() : "";
}

export function getElementTrimmedFromBrackets(element: string) {
  return element ? element.replace(/\[(.*?)\]/g, "").trim() : "";
}

export function groupBy<T>(array: Array<T>, fieldToGroupBy: keyof T) {
  return array.reduce(
    (acc, currentValue) => {
      const v = currentValue[fieldToGroupBy] as string;

      if (v) {
        acc[v] = acc[v] || [];
        acc[v].push(currentValue);
      }

      return acc;
    },
    {} as { [key: string]: Array<T> }
  );
}

export function getValueInParenthesis(str: string, shouldUseLast = false) {
  if (!str.includes("(") || !str.includes(")")) {
    return str;
  }

  const regExp = /(?<=\().*?(?=\))/g;
  const value = str.match(regExp);

  if (value) {
    if (shouldUseLast && value.length > 1) {
      return value[value.length - 1].trim();
    }
    if (value[0]) {
      return value[0].trim();
    }
  }

  return null;
}

export function sleep(durationInMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationInMs));
}

export function truncateText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }

  return text;
}

export function getTopTierCountryCodes() {
  // United States, Austria, Germany, Italy, Spain, Switzerland, France, Belgium, Australia, Canada, United Kingdom, Netherlands, New Zealand, Denmark, Finland, Ireland, Norway, Sweden, Japan
  return [
    "at",
    "au",
    "ae",
    "be",
    "ca",
    "ch",
    "cn",
    "de",
    "dk",
    "fi",
    "fr",
    "gb",
    "ie",
    "jp",
    "nl",
    "no",
    "nz",
    "se",
    "sg",
    "us",
  ];
}

export function isIOS(os: string) {
  return os.toLowerCase().includes("ios");
}

export function isAndroid(os: string) {
  return os.toLowerCase().includes("and");
}

export function cloneObject<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj));
}

export function removeKeyFromObject<
  Obj extends object,
  Attribute extends keyof Obj,
>(key: Attribute, object: Obj) {
  const { [key]: removedProp, ...rest } = object;
  removedProp;
  return rest;
}

export function getCountryCodeFromCampaignName(campaignName: string) {
  const campaignNameWords = campaignName.toLowerCase().split(" ");
  return (
    campaignNameWords.find((word) => countryCodeLookup.byInternet(word)) || null
  );
}

export function replaceCommaByDot(value: string) {
  return value.replace(/,/g, () => ".");
}
export function convertBufferToJson(buffer: Buffer) {
  return JSON.parse(buffer.toString());
}

export function reverseMap(obj: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
  );
}
