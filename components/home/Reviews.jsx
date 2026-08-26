"use client";

import { InfiniteMovingCards } from "../ui/infinite-cards";
import { Dot } from "../Dot";
import { useTranslations } from "next-intl";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";
import { fadeIn } from "@/variants";

const Reviews = () => {
  const t = useTranslations("Reviews");
  // Keep these ratings in sync with components/seo/OrganizationJsonLd.jsx,
  // which publishes the same numbers as structured data.
  const testimonials = [
    {
      quote: t("madiny"), 
      name: "Madiny",
      url: "https://madinytattoo.ro",
      rating: 5,
    },
    { quote: t("tng"), name: "Mihai", url: "https://tngag-grup.vercel.app", rating: 5 },
    {
      quote: t("monte-bianco"),
      name: "Monte Bianco",
      url: "https://montebianco.ro",
      rating: 4.5,
    },
    {
      quote: t("mbody"),
      name: "Mihaela",
      url: "https://mbody.vercel.app",
      rating: 5,
    },
    {
      quote: t("dianazu"),
      name: "Diana",
      url: "https://dianazu.vercel.app",
      rating: 4.5,
    },
  ];

  return (
    <section id="reviews" className="site-section bg-softPaper overflow-hidden">
      <div className="container">
        <div className="mb-10 flex flex-col justify-between gap-6 xl:mb-14 xl:flex-row xl:items-end">
          <div>
            <span className="section-kicker">Client voices</span>
            <MotionH2
              variants={fadeIn("down", 0.4)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="section-title mt-4"
            >
              <Dot />
              {t("title")}
            </MotionH2>
          </div>
        </div>

        <MotionDiv
          variants={fadeIn("down", 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
        </MotionDiv>
      </div>
    </section>
  );
};

export default Reviews;
