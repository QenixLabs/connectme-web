import Image from "next/image";
import logo from "@/assets/rootin-logo-orange.png";

export function RootInLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src={logo}
        alt="RootIn — Connect • Collaborate • Get In"
        className="h-auto w-full max-w-[16rem]"
        priority
      />
    </div>
  );
}
