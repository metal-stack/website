import { Tab as HTab } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

interface Props {
  selected?: boolean;
  children: React.ReactNode;
}

export default function Tab(props: Props) {
  return (
    <HTab className="p-0 flex-1 rounded-md border-0 cursor-pointer">
      <div
        className={twMerge(
          "rounded-md dark:bg-neutral-900 text-sm font-bold py-3 px-4",
          props.selected
            ? "bg-white dark:bg-white  text-black drop-shadow-sm"
            : "text-black/50 dark:text-white/50 hover:bg-neutral-50 hover:dark:bg-neutral-800"
        )}
      >
        {props.children}
      </div>
    </HTab>
  );
}
