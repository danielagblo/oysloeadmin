import React from "react";
import styles from "./reviewstars.module.css";
import { Star } from "lucide-react";
import { StarIcon } from "../SVGIcons/StarIcon";

export const ReviewStars = ({ count }) => {
  return (
    <div className={`${styles.reviewContainer}`}>
      {Array?.from({ length: 5 })?.map((_, idx) => {
        console.log(count, idx);
        return <StarIcon color={idx < count ? "#374957" : "white"} />;
      })}
    </div>
  );
};
