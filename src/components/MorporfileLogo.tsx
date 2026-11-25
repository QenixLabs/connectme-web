import Image from "next/image";
import logo from "@/assets/morporfile-logo-orange.png";

export function MorporfileLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src={logo}
        alt="Morporfile"
        className="h-auto w-full max-w-[16rem]"
        priority
      />
    </div>
  );
}
