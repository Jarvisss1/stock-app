import React, { useState, useRef } from "react";
import { View, Dimensions, PanResponder, Text } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  G,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "../app/context/ThemeContext";

type ChartDataPoint = {
  value: number;
  date: string;
};

type LineChartProps = {
  data: ChartDataPoint[];
  height?: number;
};

export default function LineChart({ data, height = 250 }: LineChartProps) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return <View style={{ height }} />;
  }

  const slicedData = data.length > 90 ? data.slice(data.length - 90) : data;
  const numericData = slicedData.map((p) => p.value);

  const width = Dimensions.get("window").width - 40;

  const minValue = Math.min(...numericData);
  const maxValue = Math.max(...numericData);
  let range = maxValue - minValue;
  if (range === 0) {
    range = maxValue * 0.1;
  }

  const getPoint = (index: number) => {
    const point = numericData[index];
    const x = (index / (numericData.length - 1)) * width;
    const y = height - ((point - minValue) / range) * height;
    return { x, y };
  };

  const linePath = numericData
    .map((_, i) => {
      const { x, y } = getPoint(i);
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const index = Math.round((touchX / width) * (slicedData.length - 1));
        setSelectedIndex(index);
      },
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const index = Math.min(
          slicedData.length - 1,
          Math.max(0, Math.round((touchX / width) * (slicedData.length - 1)))
        );
        setSelectedIndex(index);
      },
      onPanResponderRelease: () => {
        setSelectedIndex(null);
      },
      onPanResponderTerminate: () => {
        setSelectedIndex(null);
      },
    })
  ).current;

  const lineColor = "#0a7ea4";
  const gradientStartColor =
    theme === "dark" ? "rgba(10, 126, 164, 0.4)" : "rgba(10, 126, 164, 0.3)";
  const gradientEndColor = theme === "dark" ? "#121212" : "#ffffff";
  const tooltipBg = theme === "dark" ? "#f0f0f0" : "#ffffff";
  const tooltipText = theme === "dark" ? "#000" : "#333";

  let tooltipX = 0;
  let tooltipY = 0;
  if (selectedIndex !== null) {
    const { x, y } = getPoint(selectedIndex);
    tooltipX = x;
    tooltipY = y;
  }
  // Adjust tooltip position to stay within bounds
  if (selectedIndex !== null) {
    if (tooltipX > width - 130) {
      // Tooltip width is 120
      tooltipX -= 130;
    } else {
      tooltipX += 10;
    }
    if (tooltipY > height - 70) {
      // Tooltip height is ~60
      tooltipY -= 70;
    }
  }

  return (
    <View
      style={{ height, width, alignSelf: "center" }}
      {...panResponder.panHandlers}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={gradientStartColor} stopOpacity="1" />
            <Stop offset="1" stopColor={gradientEndColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" />

        {selectedIndex !== null && (
          <G>
            <Line
              x1={getPoint(selectedIndex).x}
              y1="0"
              x2={getPoint(selectedIndex).x}
              y2={height}
              stroke={theme === "dark" ? "#fff" : "#aaa"}
              strokeWidth="1"
              strokeDasharray="4, 4"
            />
            <Circle
              cx={getPoint(selectedIndex).x}
              cy={getPoint(selectedIndex).y}
              r="6"
              fill={lineColor}
              stroke={tooltipBg}
              strokeWidth="2"
            />
            <G x={tooltipX} y={tooltipY}>
              <Rect
                width="120"
                height="50"
                rx="8"
                fill={tooltipBg}
                stroke="#ddd"
                strokeWidth="1"
              />
              <SvgText
                x="60"
                y="20"
                fill={tooltipText}
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                {`$${slicedData[selectedIndex].value.toFixed(2)}`}
              </SvgText>
              <SvgText
                x="60"
                y="40"
                fill={tooltipText}
                fontSize="12"
                textAnchor="middle"
              >
                {slicedData[selectedIndex].date}
              </SvgText>
            </G>
          </G>
        )}
      </Svg>
    </View>
  );
}
