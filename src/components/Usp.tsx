import { CarbonIconType } from "@carbon/icons-react";

interface UspProps {
  icon: CarbonIconType;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function Usp(props: UspProps) {
  return (
    <div className="flex-1 border border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30 transition-all rounded-box p-6 pb-10 bg-neutral-100 dark:bg-neutral-950 relative overflow-clip">
      <props.icon className="w-32 h-32 absolute -right-6 -top-6 mb-4 dark:text-white/50 text-black/30 opacity-20" />
      <div className="text-amber-500 font-bold mt-8 mb-4">{props.title}</div>
      <p>{props.description}</p>
      {props.children}
    </div>
  );
}
