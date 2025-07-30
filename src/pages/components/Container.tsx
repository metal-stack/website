import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  children: ReactNode;
  wide?: boolean;
  noPadding?: boolean;
}

export default function Container(props: Props) {
  return (
    <div
      className={twMerge(
        props.wide
          ? "max-w-screen-2xl min-[1552px]:px-0 px-8 sm:px-12"
          : "max-w-screen-lg  min-[1040px]:px-0 px-8 sm:px-6",
        "w-full mx-auto",
        props.noPadding ? "!px-0 sm:!px-0" : ""
      )}
    >
      <div className={twMerge("flex gap-4", props.className)}>
        {props.children}
      </div>
    </div>
  );
}
