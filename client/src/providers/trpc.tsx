import SuperJSON from "superjson";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { queryClient } from "./query";
import type { AppRouter } from "../../../kreator-server/src/router";
import { env } from "@/env";

export const trpc = createTRPCReact<AppRouter>();

/*
 **
 ** Example of how to use the trpc client
 **
 */
/*
const example = trpc.exampleWithArgs.useMutation();

example.mutate({
  message: "Hello, world!",
});

example.data?.newNumber;
*/

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${env.VITE_SERVER_URL}/trpc`,
      transformer: SuperJSON,
    }),
  ],
});

const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {/* @ts-expect-error Children has the wrong type */}
      {children}
    </trpc.Provider>
  );
};

export default TRPCProvider;
