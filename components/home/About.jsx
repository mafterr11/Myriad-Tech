import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { fadeIn } from "@/variants";
import {
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
import Qualifications from "./Qualifications";

const infoData = [
  { icon: <User2 size={20} />, text: "Maftei Alexandru" },
  { icon: <PhoneCall size={20} />, text: "+40720425840" },
  { icon: <MailIcon size={20} />, text: "alexandrumaftei95@gmail.com" },
  { icon: <Calendar size={20} />, text: "14 Aug, 1995" },
  { icon: <GraduationCap size={20} />, text: "Academia de Studii Economice " },
];

const About = () => {
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
                src="/about-option-2-process-v2.png"
                fill
                sizes="(max-width: 1199px) 88vw, 28rem"
                loading="lazy"
                alt="Web design process with website wireframes"
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
            className="paper-panel min-w-0 p-5 sm:p-8"
          >
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="skills">{t("tab3.trigger")}</TabsTrigger>
                <TabsTrigger value="personal">{t("tab1.trigger")}</TabsTrigger>
                <TabsTrigger value="qualifications">{t("tab2.trigger")}</TabsTrigger>
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
