/**
 * TODO: Update this component to use your client-side framework's link
 * This has been updated to use Tanstack Router. -- Francis May 2025
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */

import React, { forwardRef } from "react";

import * as Headless from "@headlessui/react";
import { Link as TanstackLink } from "@tanstack/react-router";

export const Link = forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<"a">,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <TanstackLink {...props} to={props.href} ref={ref} />
    </Headless.DataInteractive>
  );
});
