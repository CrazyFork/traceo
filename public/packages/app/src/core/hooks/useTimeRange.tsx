import { useEffect, useState } from "react";
import { timeService } from "../lib/time";
import historyService from "../lib/history";

type RangeType = [number, number];

export const useTimeRange = (initial?: { from: number; to: number }) => {
  const searchParams = new URLSearchParams(window.location.search);

  const from = parseInt(searchParams.get("from"));
  const to = parseInt(searchParams.get("to"));

  const initialParams: RangeType = [from || initial?.from, to || initial?.to];
  const [ranges, setRanges] = useState<RangeType>(initialParams);

  useEffect(() => {
    const unlisten = historyService.listen(({ action, location }) => {
      if (action === "POP") {
        const search = new URLSearchParams(location.search);
        setRanges([parseInt(search.get("from")), parseInt(search.get("to"))]);
      }
    });

    return () => {
      unlisten();
    };
  }, []);

  useEffect(() => {
    timeService.setParams({
      from: ranges[0],
      to: ranges[1]
    });
  }, [ranges]);

  return { ranges, setRanges };
};
