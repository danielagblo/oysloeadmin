import React from "react";
import styles from "./reviewstars.module.css";
import { Star } from "lucide-react";
import { StarIcon } from "../SVGIcons/StarIcon";

export const ReviewStars = ({
  count,
  bgColor,
  paddingLeft,
  offColor = "white",
}) => {
  return (
    <div
      className={`${styles.reviewContainer}`}
      style={{
        ...(bgColor && { backgroundColor: bgColor }),
        ...(paddingLeft != null && { paddingLeft }),
        // ...{ border: "2px solid green" },
      }}
    >
      {Array?.from({ length: 5 })?.map((_, idx) => {
        return (
          <StarIcon key={idx} color={idx < count ? "#374957" : offColor} />
        );
      })}
    </div>
  );
};
