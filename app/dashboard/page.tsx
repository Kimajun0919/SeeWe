import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient";

type DashboardPageProps = {
  searchParams: Promise<{
    area?: string | string[] | undefined;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area;

  return <DashboardOverviewClient initialAreaNm={areaParam} />;
}
