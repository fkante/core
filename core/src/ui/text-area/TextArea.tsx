export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  errorText?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
}
export default function Textarea({
  errorText,
  hint,
  label,
  placeholder,
  ...props
}: TextAreaProps) {
  function getLabelClass() {
    return "text-secondary text-sm font-medium";
  }

  function getHintClass() {
    return "text-secondary/70 text-sm";
  }

  function getErrorClass() {
    return "mt-2 text-sm text-red-600";
  }

  function getTextAreaClass({ errorText }: { errorText?: string }) {
    const errorColor =
      "!text-red-900 !ring-red-300 placeholder:!text-red-300 focus:!ring-red-500";
    const defaultColor =
      "text-secondary placeholder:text-secondary/40 focus:ring-primary";
    const textAreaClass =
      "block w-full rounded-md bg-surface-secondary/20 border border-border-secondary py-1.5 pr-10 pl-1.5 focus:ring-1 focus:ring-inset disabled:!cursor-not-allowed disabled:!bg-gray-50 disabled:!text-gray-500 disabled:!ring-gray-200 sm:text-sm/6 " +
      (errorText ? errorColor : defaultColor);
    return textAreaClass;
  }

  const textAreaStyle = getTextAreaClass({ errorText });
  const labelClass = getLabelClass();
  const hintClass = getHintClass();
  const errorClass = getErrorClass();
  return (
    <div>
      <div className="mb-2 flex justify-between">
        {label ? (
          <label htmlFor={props.name} className={labelClass}>
            {label}
          </label>
        ) : null}
        {hint ? (
          <>
            {!label ? <span> </span> : null}
            <span className={hintClass}>{hint}</span>
          </>
        ) : null}
      </div>
      <div className="">
        <textarea
          rows={4}
          placeholder={placeholder}
          className={textAreaStyle}
          {...props}
        ></textarea>
      </div>
      {errorText ? <p className={errorClass}>{errorText}</p> : null}
    </div>
  );
}
