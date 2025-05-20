import {
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import Button from "../button/Button";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  footer?: boolean;
  icon?: React.ReactNode;
  onSubmit: () => Promise<void> | void;
  onSubmitLabel?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  warning?: boolean;
  width?: string;
}

export default function Dialog(props: DialogProps) {
  const {
    children,
    footer = true,
    icon,
    onSubmit,
    onSubmitLabel,
    open,
    setOpen,
    title,
    warning,
    width = "max-w-lg",
  } = props;
  const id = title ?? Math.random().toString(36).substring(7);

  return (
    <HeadlessDialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop
        id={`${id}-dialog-backdrop`}
        transition
        className="bg-gray/75 fixed inset-0 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            id={`${id}-dialog-panel`}
            transition
            className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full ${width} data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95`}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {(warning || icon) && (
                  <div
                    className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${warning ? "bg-red-100" : "bg-gray/5"} sm:mx-0 sm:size-10`}
                  >
                    {warning ? (
                      <ExclamationTriangleIcon
                        aria-hidden="true"
                        className="size-6 text-red-600"
                      />
                    ) : (
                      icon
                    )}
                  </div>
                )}
                <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                  {title && (
                    <DialogTitle
                      as="h3"
                      className="text-secondary ml-4 text-base font-semibold"
                    >
                      {title}
                    </DialogTitle>
                  )}
                  <div className="mt-2">{children}</div>
                </div>
              </div>
            </div>
            {footer && (
              <div className="bg-gray/5 gap-2 px-4 py-3 sm:flex sm:justify-end sm:px-6">
                <div className="w-full max-w-64 gap-2 sm:flex sm:flex-row-reverse">
                  <Button
                    id={`${id}-dialog-submit`}
                    onClick={async () => {
                      await onSubmit();
                      setOpen(false);
                    }}
                    size="md"
                    warning={warning}
                  >
                    <p className="!text-sm">{onSubmitLabel || "Save"}</p>
                  </Button>
                  <Button
                    onClick={() => setOpen(false)}
                    size="md"
                    gray={true}
                    id={`${id}-dialog-cancel`}
                  >
                    <p className="!text-sm">Cancel</p>
                  </Button>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </HeadlessDialog>
  );
}
