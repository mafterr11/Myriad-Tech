import { forwardRef } from "react";
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

// forwardRef so Radix's `asChild` trigger can attach to the real button.
export const HireMeButton = forwardRef(({ onClick, ...props }, ref) => {
  const t = useTranslations("Nav");

  return (
    <Button ref={ref} size="sm" onClick={onClick} {...props}>
      {t("specialBtn.name")}
    </Button>
  );
});

HireMeButton.displayName = "HireMeButton";

export const HireMeDialog = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <HireMeDialogContent />
  </Dialog>
);

// The desktop nav opens the dialog from its own trigger; the mobile nav has to
// close the drawer first, so it drives `HireMeDialog` with its own state.
// Both render the same button and the same content.
const HireMe = () => (
  <Dialog>
    <DialogTrigger asChild>
      <HireMeButton />
    </DialogTrigger>
    <HireMeDialogContent />
  </Dialog>
);

export default HireMe;
