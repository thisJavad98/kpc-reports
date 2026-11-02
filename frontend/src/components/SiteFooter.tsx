const THISJ_URL =
  "https://www.linkedin.com/in/mohammad-javad-moghofei-907671214/";

export function SiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <p className="pointer-events-auto px-3 py-1.5 text-[8px] leading-none text-[#a3a3a3] flex">
        Powerd by{" "}
        <p
          className="font-medium ps-1"
          style={{ color: "#ff6a00" }}
        >
          Moghofei
        </p>
      </p>
    </footer>
  );
}
