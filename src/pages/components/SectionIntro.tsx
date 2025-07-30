import { twMerge } from "tailwind-merge";
import Container from "./Container";

interface Props extends React.ComponentPropsWithoutRef<"section"> {
  hasBackground?: boolean;
  fullWidth?: boolean;
  center?: boolean;
  title: string;
  description?: string;
  strapline?: string;
}

export default function SectionIntro(props: Props) {
  return (
    <Container
      noPadding={props.fullWidth ? true : false}
      className={twMerge(
        "block w-full my-10",
        props.center ? "text-center mx-auto" : "",
        props.fullWidth ? "" : "sm:w-2/3 md:w-1/2"
      )}
    >
      {props.strapline && (
        <h4 className="mb-2 font-bold dark:text-amber-500 text-amber-500">
          {props.strapline}
        </h4>
      )}
      <h2 className="font-bold">{props.title}</h2>
      <p className="mt-4">{props.description}</p>
      {props.children}
    </Container>
  );
}
