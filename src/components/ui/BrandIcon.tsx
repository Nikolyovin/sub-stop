import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Brand, getBrandIconColor } from "../../utils/brandUtils";
import { useTheme } from "../../theme/ThemeContext";

interface BrandIconProps {
  brand: Brand;
  size: number;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ brand, size }) => {
  const { theme } = useTheme();
  const color = getBrandIconColor(brand, theme === "dark");

  if (brand.iconFamily === "ionicons") {
    return <Ionicons name={brand.icon as any} size={size} color={color} />;
  }
  return (
    <MaterialCommunityIcons
      name={brand.icon as any}
      size={size}
      color={color}
    />
  );
};
