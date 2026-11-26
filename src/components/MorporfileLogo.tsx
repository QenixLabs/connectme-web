import Image from "next/image";

export function MorporfileLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/morporfile-logo-v3.png"
        width={2170}
        height={725}
        alt="Morporfile"
        className="h-auto w-full max-w-[16rem]"
        priority
      />
    </div>
  );
}
