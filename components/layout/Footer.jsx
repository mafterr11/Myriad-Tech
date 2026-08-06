import { useTranslations } from "next-intl";
import Socials from "../Socials";
import Link from "next/link";

const currentYear = new Date().getFullYear();
const Footer = () => {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-line bg-grainy py-10">
      <div className="container flex flex-col items-center justify-between gap-8 xl:flex-row-reverse">
        {/* Right Side */}
        <div className="flex items-center justify-center gap-x-6 max-md:flex-col max-md:gap-y-5">
          <div className="text-center text-sm font-semibold underline underline-offset-4 max-md:flex-col">
            <Link href={t("gdpr")}>{t("name")}</Link>
          </div>
          <div className="text-center text-sm font-semibold underline underline-offset-4 max-md:flex-col">
            <Link href={t("cookies")}>{t("name2")}</Link>
          </div>
          <Socials className="flex gap-x-6 text-[20px]" />
        </div>
        {/* Middle part */}
        <div className="my-2 flex flex-col items-center justify-center gap-x-1 text-center text-sm md:flex-row">
          <a
            href="https://www.linkedin.com/in/maftei-alexandru/"
            className="hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-accent hover:font-medium">Myriad Tech</span>
          </a>
          &copy; {currentYear} - {t("rights")}
        </div>
        {/* Left Side */}
        <div className="flex items-center justify-center max-md:flex-col">
          <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener noreferrer">
            <img
              style={{ width: "250px" }}
              src="https://wpfitness.eu/wp-content/uploads/2022/10/anpc-sal.png"
              alt="Solutionarea Alternativa a Litigiilor"
              loading="lazy"
            />
          </a>
          <br />
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <img
              style={{ width: "250px" }}
              src="https://wpfitness.eu/wp-content/uploads/2022/10/anpc-sol.png"
              alt="Solutionarea Online a Litigiilor"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
