import { useTranslations } from "next-intl";

// Visually hidden until it takes focus, so the first Tab on any page offers a
// way past the fixed header and the whole navigation block.
const SkipLink = () => {
  const t = useTranslations("Nav");

  return (
    <a href="#main-content" className="skip-link">
      {t("skip")}
    </a>
  );
};

export default SkipLink;
