import { clsx } from "clsx";
import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-2xl border border-sky-300/20 bg-slate-950/45 px-3 py-2 shadow-lg shadow-sky-950/20",
        className,
      )}
    >
      <Image
        src="/seewe-logo.svg"
        alt="SeeWe"
        width={220}
        height={64}
        priority
        className={clsx("h-10 w-auto sm:h-12", imageClassName)}
      />
    </div>
  );
}
