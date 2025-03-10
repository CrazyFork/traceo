import { Dictionary } from "@traceo/types";
import { LegendComponentOption } from "echarts";

interface BaseLegendOptions {
  position?: "horizontal" | "vertical";
  selected?: Dictionary<boolean>;
}
export const BaseLegend = ({ selected }: BaseLegendOptions): LegendComponentOption => ({
  icon: "roundRect",
  itemHeight: 5,
  textStyle: {
    color: "#ffffff"
  },
  selected,
  // TODO: values based on position
  bottom: 0,
  left: 30
});
