"use client";

import { InfiniteMovingCards } from "../ui/infinite-cards";
import { Star } from "lucide-react";
import HalfStar from "../ui/half-star";
import { Dot } from "../Dot";
import { useTranslations } from "next-intl";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";
import { fadeIn } from "@/variants";

const Reviews = () => {
  const t = useTranslations("Reviews");
  const testimonials = [
    {
      quote: t("madiny"),
      name: "Madiny",
      title: "https://madinytattoo.ro",
      star: <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />,
    },
    {
      quote: t("tng"),
      name: "Mihai",
      title: "https://tngag.ro",
      star: <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />,
    },
    {
      quote: t("monte-bianco"),
      name: "Monte Bianco",
      title: "https://montebianco.ro",
      star: <HalfStar />,
    },
    {
      quote: t("mbody"),
      name: "Mihaela",
      title: "https://mbody.vercel.app",
      star: <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />,
    },
    {
      quote: t("dianazu"),
      name: "Diana",
      title: "https://dianazu.vercel.app",
      star: <HalfStar />,
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
