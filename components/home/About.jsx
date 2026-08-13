import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { fadeIn } from "@/variants";
import {
  Code2,
  User2,
  MailIcon,
  PhoneCall,
  GraduationCap,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Dot } from "../Dot";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-images/constants";
import Qualifications from "./Qualifications";

const fallbackImage = {
  src: SITE_IMAGE_DEFAULTS.about.image_url,
  alt: SITE_IMAGE_DEFAULTS.about.alt_en,
};

const infoData = [
  { icon: <User2 size={20} />, text: "Maftei Alexandru" },
  { icon: <PhoneCall size={20} />, text: "+40720425840" },
  { icon: <MailIcon size={20} />, text: "alexandrumaftei95@gmail.com" },
  { icon: <Calendar size={20} />, text: "14 Aug, 1995" },
  { icon: <GraduationCap size={20} />, text: "Academia de Studii Economice " },
];

const About = ({ image = fallbackImage }) => {
  const t = useTranslations("About");
  const qualificationData = [
    {
      title: t("edu"),
      data: [
        {
          university: "ASE",
          qualification: "Bachelor in Economy",
          years: "2014-2017",
        },
        {
          university: "SDA Academy - Java/Frontend",
          qualification: "Certificate",
          years: "2023-2024",
        },
      ],
    },
    {
      title: t("exp"),
      data: [
        { company: "DB Schenker", role: "Transport Agent", years: "2018-2022" },
        {
          company: "Porsche Inter Auto",
          role: "Digital Specialist",
          years: "2022-prezent",
        },
        { company: "Freelancer", role: "Web Developer", years: "2023-present" },
      ],
    },
  ];

  const getData = (arr, title) => arr.find((item) => item.title === title);

  return (
    <section id="about" className="site-section">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:mb-20 xl:flex-row xl:items-end">
          <div>
            <span className="section-kicker">Profile / Background</span>
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

        <div className="grid items-start gap-10 xl:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] xl:gap-16">
          <MotionDiv
            variants={fadeIn("down", 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto w-full max-w-[28rem] xl:mx-0"
          >
            <div className="relative aspect-[0.88] border border-line bg-body-light p-3 shadow-[0.7rem_0.7rem_0_rgba(92,133,135,0.14)]">
              <Image
                src={image.src}
                fill
                sizes="(max-width: 1199px) 88vw, 28rem"
                loading="lazy"
                alt={image.alt}
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between border-b border-line pb-3 text-xs font-bold tracking-[0.12em] text-black/55 uppercase">
              <span>{t("tab3.trigger")}</span>
              <span>01 / 03</span>
            </div>
          </MotionDiv>

          <MotionDiv
            variants={fadeIn("up", 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            mobileViewport={{
              once: true,
              amount: 0.05,
              margin: "0px 0px 80px 0px",
            }}
            className="paper-panel min-w-0 p-5 sm:p-8"
          >
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <TabsTrigger
                  value="skills"
                  className="min-w-0 flex-col gap-1.5 px-2 py-3 leading-tight tracking-[0.04em] whitespace-normal sm:flex-row sm:gap-2 sm:px-4 sm:tracking-[0.08em]"
                >
                  <Code2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t("tab3.trigger")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="min-w-0 flex-col gap-1.5 px-2 py-3 leading-tight tracking-[0.04em] whitespace-normal sm:flex-row sm:gap-2 sm:px-4 sm:tracking-[0.08em]"
                >
                  <User2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t("tab1.trigger")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="qualifications"
                  className="col-span-2 sm:col-span-1 min-w-0 flex-col gap-1.5 px-2 py-3 leading-tight tracking-[0.04em] whitespace-normal sm:flex-row sm:gap-2 sm:px-4 sm:tracking-[0.08em]"
                >
                  <GraduationCap
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t("tab2.trigger")}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills">
                <div>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <h3>{t("tab3.title")}</h3>
                    <span className="text-xs font-bold tracking-[0.12em] text-accent uppercase">Stack</span>
                  </div>
                  <div className="editorial-rule mb-7" />
                  <Qualifications />
                </div>
              </TabsContent>

              <TabsContent value="personal">
                <div>
                  <h3 className="mb-4">{t("tab1.title")}</h3>
                  <p className="mb-8 max-w-2xl text-lg">{t("tab1.description")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {infoData.map((item) => (
                      <div
                        className="flex items-center gap-x-3 border-b border-line py-3 text-sm"
                        key={item.text}
                      >
                        <div className="text-accent" aria-hidden="true">{item.icon}</div>
                        <div>{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="qualifications">
                <div>
                  <h3 className="mb-8">{t("tab2.title")}</h3>
                  <div className="grid gap-10 md:grid-cols-2">
                    <div className="flex flex-col gap-y-6">
                      <div className="flex items-center gap-x-3 text-xl">
                        <GraduationCap size={25} className="text-accent" aria-hidden="true" />
                        <h4>{getData(qualificationData, t("edu")).title}</h4>
                      </div>
                      <div className="flex flex-col gap-y-7">
                        {getData(qualificationData, t("edu")).data.map((item) => (
                          <div className="group flex gap-x-5" key={item.university}>
                            <div className="relative ml-1 h-20 w-px bg-line">
                              <div className="absolute -left-[4px] top-0 h-2 w-2 rounded-full bg-accent transition-transform duration-500 group-hover:translate-y-16 motion-reduce:transition-none" />
                            </div>
                            <div>
                              <div className="mb-1 font-recursive text-lg font-bold">{item.university}</div>
                              <div className="mb-2 text-sm text-black/65">{item.qualification}</div>
                              <div className="text-xs font-bold tracking-[0.1em] text-accent">{item.years}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-y-6">
                      <div className="flex items-center gap-x-3 text-xl">
                        <Briefcase size={25} className="text-accent" aria-hidden="true" />
                        <h4>{getData(qualificationData, t("exp")).title}</h4>
                      </div>
                      <div className="flex flex-col gap-y-7">
                        {getData(qualificationData, t("exp")).data.map((item) => (
                          <div className="group flex gap-x-5" key={item.company}>
                            <div className="relative ml-1 h-20 w-px bg-line">
                              <div className="absolute -left-[4px] top-0 h-2 w-2 rounded-full bg-accent transition-transform duration-500 group-hover:translate-y-16 motion-reduce:transition-none" />
                            </div>
                            <div>
                              <div className="mb-1 font-recursive text-lg font-bold">{item.company}</div>
                              <div className="mb-2 text-sm text-black/65">{item.role}</div>
                              <div className="text-xs font-bold tracking-[0.1em] text-accent">{item.years}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default About;
