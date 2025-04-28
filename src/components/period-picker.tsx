"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Dropdown, DropdownContent, DropdownTrigger } from "./ui/dropdown";
import { v4 as uuidv4 } from "uuid";

type PropsType<TItem extends string> = {
  defaultValue?: TItem;
  items?: TItem[];
  sectionKey: string;
  minimal?: boolean;
  onChange: (selectedValue: TItem) => void; // Add onChange prop
};

const PARAM_KEY = "selected_time_frame";

// Explicitly restrict TItem to "today" or "monthly"
export function PeriodPicker({
  defaultValue,
  sectionKey,
  items,
  minimal,
  onChange,
}: PropsType<"today" | "monthly">) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<"today" | "monthly">(defaultValue || "monthly");

  useEffect(() => {
    // Fetch the data for the selected time frame when it changes
    const fetchData = async () => {
      const res = await fetch(`/api/overview?selected_time_frame=${selectedTimeFrame}`);
      const data = await res.json();
      // Process the data (e.g., update chart data)
      console.log(data);
    };

    fetchData();
  }, [selectedTimeFrame]); // Trigger when the selected time frame changes

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between gap-x-1 rounded-md border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark-5 outline-none ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-neutral-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[placeholder]:text-neutral-400 [&>span]:line-clamp-1 [&[data-state='open']>svg]:rotate-0",
          minimal && "border-none bg-transparent p-0 text-dark dark:bg-transparent dark:text-white"
        )}
      >
        <span className="capitalize">{selectedTimeFrame}</span>
        <ChevronUpIcon className="size-4 rotate-180 transition-transform" />
      </DropdownTrigger>

      <DropdownContent
        align="end"
        className="min-w-[7rem] overflow-hidden rounded-lg border border-[#E8E8E8] bg-white p-1 font-medium text-dark-5 shadow-md dark:border-dark-3 dark:bg-dark-2 dark:text-current"
      >
        <ul>
          {(items || ["today", "monthly"]).map((item) => (
            <li key={uuidv4()}>
              <button
                className="flex w-full select-none items-center truncate rounded-md px-3 py-2 text-sm capitalize outline-none hover:bg-[#F9FAFB] hover:text-dark-3 dark:hover:bg-[#FFFFFF1A] dark:hover:text-white"
                onClick={() => {
                  setSelectedTimeFrame(item);
                  router.push(pathname + `?${PARAM_KEY}=${item}`);
                  onChange(item); // Call onChange when a value is selected
                  setIsOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
