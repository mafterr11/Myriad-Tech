import Image from "next/image";
import { Link } from "@/i18n/navigation";

const Logo = ({ source, size }) => {
  return (
    <Link
      href="/"
      aria-label="Myriad Tech home"
      className="focus-ring inline-flex w-fit items-center"
    >
      <div className={`${size} w-auto`}>
        <Image
          src={source}
          width={250}
          height={250}
          className={`${size} w-auto`}
          alt="Myriad Tech"
          sizes="(max-width: 768px) 180px, 220px"
          priority={true}
        />
      </div>
    </Link>
  );
};

export default Logo;
