import { twMerge } from "tailwind-merge";

interface Props extends React.ComponentPropsWithoutRef<"section"> {
  hasBackground?: boolean;
}

export default function Section(props: Props) {
  return (
    <section
      id={props.id}
      className={twMerge(
        "relative block h-auto w-full",
        props.className,
        props.hasBackground ? "py-20 lg:py-28" : "py-20 lg:py-36"
      )}
    >
      {props.children}
    </section>
  );
}
