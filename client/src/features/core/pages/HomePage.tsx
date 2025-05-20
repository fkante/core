import LastBriefs from "../components/LastBriefs";
import { useAuth } from "@/providers/authContext";

export default function HomePage() {
  const { user } = useAuth();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl/8 font-semibold sm:text-xl/8 text-secondary [view-transition-name:main-heading]">{greeting}, {user?.name}</h1>
      <div className="h-px w-full bg-zinc-200 [view-transition-name:main-divider]" />
      <LastBriefs />
    </div>
  );
}