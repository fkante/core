import { useBriefs } from "@/hooks/useBriefs";

export default function LastBriefs() {
  const { briefs } = useBriefs();

  if (!briefs) {
    return <div>No new briefs for now</div>;
  }

  return (
    briefs.map((brief, index) => (
      <div
        className={`h-64 ${index > 1 ? "hidden md:block" : "flex-1"}`}
      >
        <a
          style={{ backgroundImage: `url("${brief.bannerImage}")` }}
          className="flex h-60 w-full snap-center flex-col justify-end rounded-2xl bg-cover bg-center bg-no-repeat drop-shadow-xl transition-all duration-500 ease-in-out hover:scale-[1.03]"
          href={"/brief/" + brief.id + "/"}
          data-transition-name={`brief-${brief.id}`}
        >
          <div className="flex flex-col items-start justify-end gap-2 rounded-2xl">
            <div className="flex h-24 flex-col items-center justify-center gap-1 self-stretch rounded-2xl bg-white px-5 py-4">
              <div className="text-secondary text-sm">{brief.title}</div>
              <div className="flex items-center justify-center self-stretch">
                <div className="text-base font-bold text-black">
                  <p>{brief.appCode}</p>
                </div>
              </div>
              <div className="flex items-center justify-center self-stretch">
                <div className="text-base font-normal text-black">
                  <p>${brief.reward / 100}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    ))
  );
}