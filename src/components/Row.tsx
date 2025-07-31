import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Row(props: Props) {
  return (
    <div
      className={twMerge("relative", props.className ? props.className : "")}
    >
      {props.children}
    </div>
  );
}
