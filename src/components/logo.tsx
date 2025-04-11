import darkLogo from "@/assets/logos/namcobank-logo.svg";
import logo from "@/assets/logos/namcobank-logo.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative w-[150px] h-[150px]">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
