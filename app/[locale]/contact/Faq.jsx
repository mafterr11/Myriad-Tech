"use client";

import { useState } from "react";
import { ChevronDownIcon, Rocket, CreditCard, Smartphone, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MotionDiv } from "@/lib/motion-client";
import { fadeIn } from "@/variants";

export default function Faq() {
  const [openItem, setOpenItem] = useState(null);
  const t = useTranslations("Contact");
  const questions = [
    { title: t("faq.q1"), description: t("faq.a1"), icon: Rocket },
    { title: t("faq.q2"), description: t("faq.a2"), icon: CreditCard },
    { title: t("faq.q3"), description: t("faq.a3"), icon: Smartphone },
    { title: t("faq.q4"), description: t("faq.a4"), icon: Settings2 },
  ];

  return (
    <div className="mt-10 w-full space-y-3">
      <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
        <span className="section-kicker">FAQ</span>
        <span className="text-xs font-bold tracking-[0.12em] text-black/40 uppercase">01 / 04</span>
      </div>
      {questions.map((question, index) => {
        const Icon = question.icon;
        const isOpen = openItem === index;
        const answerId = `faq-answer-${index}`;
        const buttonId = `faq-question-${index}`;

        return (
          <MotionDiv
            key={question.title}
            className="overflow-hidden border border-line bg-white/35"
            variants={fadeIn("down", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenItem(isOpen ? null : index)}
              className={`focus-ring flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors motion-reduce:transition-none ${isOpen ? "bg-accent text-white" : "hover:bg-white/65"}`}
            >
              <span className="flex items-center gap-3 text-sm font-bold sm:text-base">
                <Icon size={18} aria-hidden="true" />
                {question.title}
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              data-open={isOpen}
              className="faq-answer"
            >
              <div>
                <p className="px-4 py-4 text-sm leading-7 text-black/70">{question.description}</p>
              </div>
            </div>
          </MotionDiv>
        );
      })}
    </div>
  );
}
