import { useEffect, useState } from "react";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { SelectOption as GenericSelectionOption } from "../types";

type SelectOption = GenericSelectionOption & {
  leadingIcon?: React.ReactNode;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: SelectOption[];
  optionSelected?: SelectOption | SelectOption[];
  onOptionChange?: (value: string | number | readonly string[]) => void;
  placeholder?: string;
}

interface SelectMultipleProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: SelectOption[];
  optionSelected?: SelectOption[];
  onOptionChange?: (value: readonly string[]) => void;
  placeholder?: string;
}

/**
 * Select component
 * We have two types of select components:
 * 1. Single select
 * 2. Multiple select
 * We separate the two types of select components to make the code simpler to maintain
 * Multiple select will return selected options with key[x]: value[x]
 * example: { 'language[0]': 'French', 'language[1]': 'English' }
 */
export default function Select({
  label,
  hint,
  options,
  optionSelected,
  multiple = false,
  onOptionChange,
  placeholder = "Select an option",
  ...rest
}: SelectProps) {
  const [selected, setSelected] = useState(optionSelected as SelectOption);
  if (multiple) {
    return (
      <SelectMultiple
        label={label}
        options={options}
        optionSelected={optionSelected as SelectOption[]}
        placeholder={placeholder}
        onOptionChange={onOptionChange}
        {...rest}
      />
    );
  }

  function selectOnChange(value: string | number | readonly string[]) {
    const newSelected = options.find((option) => option.value === value);
    if (!newSelected) {
      return;
    }
    setSelected(newSelected);
  }

  return (
    <div className="flex flex-col">
      <Listbox
        value={selected?.value}
        {...rest}
        onChange={(value) => {
          if (!value) {
            return;
          }
          if (onOptionChange) {
            // onChange of the parent component
            onOptionChange(value);
          }
          // control the internal state of the select component
          selectOnChange(value);
        }}
      >
        {label || hint ? (
          <div className="mb-2 flex justify-between">
            {label ? (
              <Label className="text-secondary block text-sm/6 font-medium">
                {label}
              </Label>
            ) : null}
            {hint ? (
              <>
                {!label ? <span> </span> : null}
                <span className="text-md text-gray-500">{hint}</span>
              </>
            ) : null}
          </div>
        ) : null}
        <div className="relative">
          <ListboxButton className="text-secondary placeholder:text-secondary/40 focus:ring-primary bg-surface-secondary/20 border-border-secondary block w-full rounded-md border py-1.5 pr-10 ring-inset focus:ring-2 focus:ring-inset disabled:!cursor-not-allowed disabled:!bg-gray-50 disabled:!text-gray-500 disabled:!ring-gray-200 sm:text-sm/6">
            {!selected ? (
              <span className="text-secondary/40 ml-3 flex items-center truncate">
                {placeholder}
              </span>
            ) : (
              <>
                <span className="flex items-center">
                  {selected.leadingIcon ? (
                    <div className="size-5 shrink-0 rounded-full">
                      {selected.leadingIcon}
                    </div>
                  ) : null}
                  <span className="ml-3 block truncate">{selected.label}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="size-5 text-gray-400"
                  />
                </span>
              </>
            )}
          </ListboxButton>

          <ListBoxOptionElement options={options} />
        </div>
      </Listbox>
    </div>
  );
}

function SelectMultiple({
  label,
  options,
  optionSelected: optionsSelected,
  multiple = true,
  placeholder = "Select an option",
  onOptionChange,
  ...rest
}: SelectMultipleProps) {
  const [selected, setSelected] = useState<SelectOption[]>([]);

  const { name } = rest;

  useEffect(() => {
    // Set the initial selected option on mount
    if (optionsSelected) {
      setSelected(optionsSelected);
    }
  }, [optionsSelected]);

  function onSelectChange(value: string | number | readonly string[]) {
    const newSelected = options.filter(
      (option) =>
        option.value && (value as string[]).includes(option.value as string)
    );
    setSelected(newSelected);
  }

  return (
    <div className="flex size-full flex-col">
      <Listbox
        value={selected.map((option) => option.value)}
        //@ts-expect-error - value is not a valid prop for multiple select
        onChange={(value) => {
          if (onOptionChange) {
            onOptionChange(value as string[]);
          }
          onSelectChange(value as string[]);
        }}
        multiple={multiple}
        {...rest}
        name={name}
      >
        {label ? (
          <Label className="text-secondary mb-2 block text-sm/6 font-medium">
            {label}
          </Label>
        ) : null}
        <div className="relative">
          <ListboxButton className="text-secondary placeholder:text-secondary/40 focus:ring-primary bg-surface-secondary/20 border-border-secondary block w-full rounded-md border py-1.5 pr-10 ring-inset focus:ring-2 focus:ring-inset disabled:!cursor-not-allowed disabled:!bg-gray-50 disabled:!text-gray-500 disabled:!ring-gray-200 sm:text-sm/6">
            {selected.length === 0 ? (
              <span className="text-secondary/40 ml-3 flex items-center truncate">
                {placeholder}
              </span>
            ) : selected.length === 1 ? (
              <span className="flex items-center">
                {selected[0].leadingIcon ? (
                  <div className="size-5 shrink-0 rounded-full">
                    {selected[0].leadingIcon}
                  </div>
                ) : null}
                <span className="ml-3 block truncate">{selected[0].label}</span>
              </span>
            ) : (
              <span className="ml-3 flex items-center truncate">
                {selected.length} selected
              </span>
            )}
            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
              <ChevronUpDownIcon
                aria-hidden="true"
                className="size-5 text-gray-400"
              />
            </span>
          </ListboxButton>

          <ListBoxOptionElement options={options} />
        </div>
      </Listbox>
    </div>
  );
}

function ListBoxOptionElement({ options }: { options: SelectOption[] }) {
  return (
    <ListboxOptions
      transition
      className="absolute z-10 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
    >
      {options.map((option) => (
        <ListboxOption
          key={option.value}
          value={option.value}
          className="data-[focus]:bg-primary text-secondary group relative cursor-pointer select-none py-2 pl-3 pr-9 data-[focus]:text-white"
        >
          <div className="flex items-center">
            {option.leadingIcon ? (
              <div className="size-5 shrink-0 rounded-full">
                {option.leadingIcon}
              </div>
            ) : null}
            <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
              {option.label}
            </span>
          </div>

          <span className="text-primary absolute inset-y-0 right-0 flex items-center pr-4 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
            <CheckIcon aria-hidden="true" className="size-5" />
          </span>
        </ListboxOption>
      ))}
    </ListboxOptions>
  );
}
