import React from "react";

import type { Icon } from "../types";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "formAction"> {
  errorText?: string;
  helpText?: string;
  label?: string;
  placeholder?: string;
  type?:
    | "email"
    | "password"
    | "text"
    | "currency"
    | "number"
    | "date"
    | "checkbox"
    | "file";
  hint?: string;
  leadingIcon?: Icon;
  trailingIcon?: Icon;
  leadingDropdown?: {
    label: string;
    options: string[];
  };
  formAction?: string;
}
export default function Input(props: InputProps) {
  const {
    errorText,
    helpText,
    label,
    placeholder,
    type = "text",
    hint,
    leadingIcon,
    trailingIcon,
    leadingDropdown,
    ...rest
  } = props;

  const ERROR_COLOR =
    "!text-red-900 !ring-red-300 placeholder:!text-red-300 focus:!ring-red-500";
  const DEFAULT_COLOR =
    "text-secondary placeholder:text-secondary/40 focus:ring-primary";

  function getLabelClass() {
    return "text-secondary block text-sm/6 font-medium";
  }

  function getHintClass() {
    return "text-md text-gray-500";
  }

  function getLeftPadding({
    isCurrency,
    leadingIcon,
    leadingDropdown,
  }: {
    isCurrency: boolean;
    leadingIcon?: Icon;
    leadingDropdown?: {
      label: string;
      options: string[];
    };
  }) {
    if (isCurrency || leadingIcon) return "pl-10";
    if (leadingDropdown) return "pl-16";
    return "";
  }

  function getInputStyle({
    isCurrency,
    leadingIcon,
    leadingDropdown,
    hasError,
  }: {
    isCurrency: boolean;
    leadingIcon?: Icon;
    leadingDropdown?: {
      label: string;
      options: string[];
    };
    hasError: boolean;
  }) {
    const defaultClass = `${getLeftPadding({
      isCurrency,
      leadingIcon,
      leadingDropdown,
    })} block w-full rounded-md bg-surface-secondary/20 border border-border-secondary py-1.5 pr-10 focus:ring-1 focus:ring-inset disabled:!cursor-not-allowed disabled:!bg-gray-50 disabled:!text-gray-500 disabled:!ring-gray-200 sm:text-sm/6`;
    const inputClass =
      (hasError ? ERROR_COLOR : DEFAULT_COLOR) + " " + defaultClass;
    return inputClass;
  }

  function getCurrencyStyle() {
    return {
      symbol: {
        div: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        span: "text-gray-500 sm:text-sm",
      },
      name: {
        div: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
        span: "text-gray-500 sm:text-sm",
      },
    };
  }

  function getLeadingDropdownStyle() {
    return "focus:ring-primary h-full rounded-md border-0 bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset sm:text-sm";
  }

  function getErrorStyle() {
    return "mt-2 text-sm text-red-600";
  }

  function getHelpStyle() {
    return "mt-2 text-sm text-gray-500";
  }

  const hasLabel = !!label;
  const hasHelpText = !!helpText;
  const hasError = !!errorText;
  const isCurrency = type === "currency";
  const inputType = isCurrency ? "text" : type;
  const hintClass = getHintClass();
  const labelClass = getLabelClass();

  const inputClass = getInputStyle({
    isCurrency,
    leadingIcon,
    leadingDropdown,
    hasError,
  });
  const currencyStyle = getCurrencyStyle();
  const leadingDropdownStyle = getLeadingDropdownStyle();
  return (
    <div>
      <div className="mb-2 flex justify-between">
        {hasLabel ? (
          <label htmlFor={props.name} className={labelClass}>
            {label}
          </label>
        ) : null}
        {hint ? (
          <>
            {!hasLabel ? <span> </span> : null}
            <span className={hintClass}>{hint}</span>
          </>
        ) : null}
      </div>
      <div className="relative rounded-md">
        {leadingIcon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <img
              src={leadingIcon.src}
              alt={leadingIcon.alt}
              className={leadingIcon.class}
            />
          </div>
        ) : null}
        {isCurrency ? (
          <div className={currencyStyle.symbol.div}>
            <span className={currencyStyle.symbol.span}>$</span>
          </div>
        ) : null}
        {leadingDropdown ? (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <label htmlFor={leadingDropdown.label} className="sr-only">
              {leadingDropdown.label}
            </label>
            <select
              id={leadingDropdown.label}
              name={leadingDropdown.label}
              autoComplete={leadingDropdown.label}
              className={leadingDropdownStyle}
            >
              {leadingDropdown.options.map((option) => (
                <option id={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <input
          type={inputType}
          className={inputClass}
          placeholder={placeholder}
          {...rest}
        />
        {isCurrency ? (
          <div className={currencyStyle.name.div}>
            <span className={currencyStyle.name.span} id="price-currency">
              USD
            </span>
          </div>
        ) : null}
        {!hasError && trailingIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <img
              src={trailingIcon.src}
              alt={trailingIcon.alt}
              className={trailingIcon.class}
            />
          </div>
        ) : null}
        {hasError ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="size-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </div>
      {hasError ? <p className={getErrorStyle()}>{errorText}</p> : null}

      {hasHelpText && !hasError ? (
        <p className={getHelpStyle()}>{helpText}</p>
      ) : null}
    </div>
  );
}
