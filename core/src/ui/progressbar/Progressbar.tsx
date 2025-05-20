interface ProgressbarProps {
  progress: number;
  status: "idle" | "uploading" | "successful" | "failed";
}

export default function Progressbar({ progress, status }: ProgressbarProps) {
  const isIdle = status === "idle";

  function getColor() {
    if (status === "uploading") {
      return "bg-primary";
    } else if (status === "successful") {
      return "bg-green-500";
    } else if (status === "failed") {
      return "bg-red-600";
    } else {
      return "bg-primary";
    }
  }
  const color = getColor();
  const text =
    status === "uploading"
      ? `${progress}%`
      : status === "failed"
        ? "Failed"
        : `${progress}%`;
  return (
    <div
      className={`bg-gray/5 h-4 w-full rounded-md ${isIdle ? "opacity-0" : "opacity-100"} transition-all delay-300 ease-in-out`}
    >
      <div
        className={`${color} rounded-md transition-all delay-300 ease-in-out`}
        style={{ width: `${progress}%` }}
      >
        <p className="pl-4 text-left text-xs text-white">{text}</p>
      </div>
    </div>
  );
}
