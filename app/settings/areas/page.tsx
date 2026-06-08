import { AreaSettingsClient } from "@/components/settings/AreaSettingsClient";

type AreaSettingsPageProps = {
  searchParams: Promise<{
    area?: string | string[] | undefined;
  }>;
};

export default async function AreaSettingsPage({ searchParams }: AreaSettingsPageProps) {
  const params = await searchParams;
  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area;

  return <AreaSettingsClient initialAreaNm={areaParam} />;
}
