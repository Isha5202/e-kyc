import logo from "@/assets/logos/namcobank-logo.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[150px] h-[150px]">
        <Image
          src={logo}
          fill
          className="dark:hidden"
          alt="NAMCO logo"
          role="presentation"
          quality={100}
        />
      </div>
    </div>
  );
}
