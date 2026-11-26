import Image from "next/image";

export function MorporfiilLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/morporfiil-logo-v3.png"
        width={2170}
        height={725}
        alt="Morporfiil"
        className="h-auto w-full max-w-[16rem]"
        priority
      />
    </div>
  );
}
