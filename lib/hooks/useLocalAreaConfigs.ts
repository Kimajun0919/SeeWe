"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { areaConfigs as defaultAreaConfigs } from "@/lib/config/areas";
import {
  clearLocalAreaConfigs,
  loadLocalAreaConfigs,
  LOCAL_AREA_CONFIGS_UPDATED_EVENT,
  saveLocalAreaConfigs,
} from "@/lib/config/localAreaConfigs";
import type { AreaConfig } from "@/types/area";

export function useLocalAreaConfigs() {
  const [configs, setConfigs] = useState<AreaConfig[]>(defaultAreaConfigs);

  useEffect(() => {
    const syncConfigs = () => setConfigs(loadLocalAreaConfigs());

    syncConfigs();
    window.addEventListener("storage", syncConfigs);
    window.addEventListener(LOCAL_AREA_CONFIGS_UPDATED_EVENT, syncConfigs);

    return () => {
      window.removeEventListener("storage", syncConfigs);
      window.removeEventListener(LOCAL_AREA_CONFIGS_UPDATED_EVENT, syncConfigs);
    };
  }, []);

  const saveConfigs = useCallback((nextConfigs: AreaConfig[]) => {
    setConfigs(nextConfigs);
    saveLocalAreaConfigs(nextConfigs);
  }, []);

  const resetConfigs = useCallback(() => {
    setConfigs(defaultAreaConfigs);
    clearLocalAreaConfigs();
  }, []);

  return useMemo(
    () => ({
      areaConfigs: configs,
      getAreaConfig: (areaNm: string) => configs.find((area) => area.areaNm === areaNm),
      getDefaultAreaConfig: () => configs[0],
      saveAreaConfigs: saveConfigs,
      resetAreaConfigs: resetConfigs,
    }),
    [configs, resetConfigs, saveConfigs],
  );
}
