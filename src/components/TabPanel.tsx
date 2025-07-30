import { TabPanel as HTabPanel } from "@headlessui/react";

interface Props {
  title?: string;
  children: React.ReactNode;
}
export default function TabPanel(props: Props) {
  return (
    <HTabPanel>
      <div className="rounded-md border dark:border-white/10 dark:text-white bg-white dark:bg-neutral-900 p-6">
        <div className="w-full">
          <div className="lg:w-2/3">
            <h3
              lang="en"
              className="text-2xl mt-4 mb-4 font-bold bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg !text-transparent bg-clip-text"
            >
              {props.title}
            </h3>
          </div>
          {props.children}
        </div>
      </div>
    </HTabPanel>
  );
}
