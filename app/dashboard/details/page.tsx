import type { Metadata } from "next";
import { DashboardDetailsClient } from "@/components/dashboard/DashboardDetailsClient";

export const metadata: Metadata = {
  title: "SeeWe 자세히 보기",
  description: "SeeWe 출입구별 추정 인구, 예측, 교통, 대중교통 상세 정보.",
};

type DashboardDetailsPageProps = {
  searchParams: Promise<{
    area?: string | string[] | undefined;
  }>;
};

export default async function DashboardDetailsPage({ searchParams }: DashboardDetailsPageProps) {
  const params = await searchParams;
  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area;

  return <DashboardDetailsClient initialAreaNm={areaParam} />;
}
