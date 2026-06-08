"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";

type DashboardMenuProps = {
  areaNm: string;
  areaOptions?: Array<{
    areaNm: string;
    displayName: string;
  }>;
  currentPage: "dashboard" | "details" | "settings";
  feedbackFormUrl?: string;
  onAreaChange?: (areaNm: string) => void;
};

export function DashboardMenu({ areaNm, areaOptions, currentPage, feedbackFormUrl, onAreaChange }: DashboardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const encodedAreaNm = encodeURIComponent(areaNm);
  const canSelectArea = Boolean(areaOptions?.length && onAreaChange);
  const menuItems = [
    {
      key: "dashboard",
      href: `/dashboard?area=${encodedAreaNm}`,
      label: "대시보드",
    },
    {
      key: "details",
      href: `/dashboard/details?area=${encodedAreaNm}`,
      label: "자세히 보기",
    },
    {
      key: "settings",
      href: `/settings/areas?area=${encodedAreaNm}`,
      label: "권역 설정 보기",
    },
  ].filter((item) => item.key !== currentPage);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <nav
      ref={menuRef}
      aria-label="주요 메뉴"
      className="sticky top-3 z-50 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur sm:rounded-3xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BrandLogo />
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden max-w-40 truncate rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-300 sm:inline">
            {areaOptions?.find((area) => area.areaNm === areaNm)?.displayName ?? areaNm}
          </span>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label="메뉴 열기"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/10"
          >
            <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
            메뉴
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute right-3 top-[4.5rem] z-50 grid w-[min(20rem,calc(100vw-2rem))] gap-2 rounded-3xl border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-slate-950/40 backdrop-blur">
          {canSelectArea ? (
            <label className="grid gap-2 rounded-2xl bg-white/[0.06] p-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              권역 선택
              <select
                value={areaNm}
                onChange={(event) => {
                  onAreaChange?.(event.target.value);
                  setIsOpen(false);
                }}
                className="min-h-10 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold tracking-normal text-white outline-none ring-sky-300 transition focus:ring-2"
              >
                {areaOptions?.map((area) => (
                  <option key={area.areaNm} value={area.areaNm}>
                    {area.displayName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="rounded-2xl px-3 py-3 font-semibold text-slate-100 transition hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}

          {feedbackFormUrl ? (
            <a
              href={feedbackFormUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl bg-white px-3 py-3 font-semibold text-slate-950 transition hover:bg-sky-100"
            >
              같이 개선하기
            </a>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
