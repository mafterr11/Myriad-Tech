import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import { RiPhoneLine, RiWhatsappLine } from "react-icons/ri";

const HireMeDialogContent = () => {
  const t = useTranslations("Nav");

  return (
    <DialogContent className="border-line bg-body p-7 sm:p-10">
      <DialogHeader>
        <DialogTitle className="font-recursive text-3xl tracking-[-0.05em] sm:text-4xl">
          {t("specialBtn.title")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("specialBtn.subtext")}
        </DialogDescription>
      </DialogHeader>
      <p className="mb-6 max-w-xl text-lg">{t("specialBtn.subtext")}</p>
      <div className="flex items-center justify-center gap-3 max-md:flex-col">
        <Button asChild size="sm" className="relative w-full">
          <a
            href="http://wa.me/+40720425840"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiWhatsappLine size={22} className="absolute left-4" />{" "}
            {t("specialBtn.wapp")}
          </a>
        </Button>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="relative w-full"
        >
          <a href="tel:+40720425840">
            <RiPhoneLine size={22} className="absolute left-4" />{" "}
            {t("specialBtn.tel")}
          </a>
        </Button>
      </div>
    </DialogContent>
  );
};

export const HireMeButton = ({ onClick }) => {
  const t = useTranslations("Nav");

  return (
    <Button size="sm" onClick={onClick}>
      {t("specialBtn.name")}
    </Button>
  );
};

export const HireMeDialog = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <HireMeDialogContent />
  </Dialog>
);

const HireMe = () => {
  const t = useTranslations("Nav");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">{t("specialBtn.name")}</Button>
      </DialogTrigger>
      <HireMeDialogContent />
    </Dialog>
  );
};

export default HireMe;
