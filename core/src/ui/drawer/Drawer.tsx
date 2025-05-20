import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import Button from "../button/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  open: boolean;
  onSubmit: () => void;
  setOpen: (open: boolean) => void;
  onSubmitLabel?: string;
  width?: string;
}

export default function Drawer(props: DrawerProps) {
  const {
    title,
    children,
    open,
    setOpen,
    onSubmit,
    onSubmitLabel = "Save",
    width = "max-w-xl",
  } = props;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="bg-gray/75 fixed inset-0 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className={`pointer-events-auto ${width} w-screen transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700`}
            >
              <div className="divide-border flex h-full flex-col divide-y bg-white shadow-xl">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-secondary text-base font-semibold">
                        {title}
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="focus:ring-primary/50 hover:text-gray/50 relative rounded-md bg-white text-gray-400 focus:outline-none focus:ring-2"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    {children}
                  </div>
                </div>
                <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
                  <div className="w-20">
                    <Button onClick={() => setOpen(false)} size="sm" secondary>
                      Cancel
                    </Button>
                  </div>
                  <div className="w-20">
                    <Button onClick={() => onSubmit()} size="sm">
                      {onSubmitLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
