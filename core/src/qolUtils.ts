// Quality of live utilities

import z from "zod";

export function formatOperatingSystemFromAppCode(os: string) {
  return z
    .preprocess((data) => {
      if (data === "and") {
        return "android";
      }
      return data;
    }, z.string())
    .parse(os);
}

export function isCreativeTest(name: string) {
  return name.toLowerCase().includes("creative test");
}

export function isValueDefinedOrZero<T>(value: T) {
  return !!value || value === 0;
}

export function removeParentheses(element: string) {
  return element.replace(/[()]/g, "").trim();
}

export function removeElementsInParentheses(element: string) {
  return element.replace(/\((.*?)\)/g, "").trim();
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getNameWithoutExtenstion(name: string, maxExtensionLength = 4) {
  const lastDotIndex = name.lastIndexOf(".");

  // If there's no dot, or the dot is the first character (e.g. hidden files), return the name.
  if (lastDotIndex <= 0) {
    return name;
  }

  // If the last character is a dot, remove it.
  if (lastDotIndex === name.length - 1) {
    return name.slice(0, -1);
  }

  const extension = name.slice(lastDotIndex + 1);
  if (
    /^[a-z0-9]+$/i.test(extension) &&
    extension.length <= maxExtensionLength
  ) {
    return name.slice(0, lastDotIndex);
  }
  return name;
}
