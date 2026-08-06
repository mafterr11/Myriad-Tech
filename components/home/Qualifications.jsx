import Image from "next/image";
import React from "react";

const qualifications = [
  {
    title: "NextJS",
    icon: "/qualifications/nextjs.svg",
    description: "React Framework",
  },
  {
    title: "React",
    icon: "/qualifications/react.svg",
    description: "Javascript Framework",
  },
  {
    title: "Typescript",
    icon: "/qualifications/ts.svg",
    description: "Type-Safe Javascript",
  },
  {
    title: "TailwindCSS",
    icon: "/qualifications/tailwind.svg",
    description: "CSS Framework",
  },
  {
    title: "Framer Motion",
    icon: "/qualifications/framer.svg",
    description: "Animation Library for React",
  },
  {
    title: "Prisma",
    icon: "/qualifications/prisma.svg",
    description: "ORM for Node.js & Typescript",
  },
  {
    title: "Postgresql",
    icon: "/qualifications/postgresql.svg",
    description: "Relational Database",
  },
  {
    title: "Git",
    icon: "/qualifications/github.svg",
    description: "Version Control System",
  },
  {
    title: "Wordpress",
    icon: "/qualifications/wordpress.svg",
    description: "Content Management System",
  },
  {
    title: "WooCommerce",
    icon: "/qualifications/woo.svg",
    description: "Ecommerce Plugin",
  },
  {
    title: "CSS",
    icon: "/qualifications/css.svg",
    description: "Styling language",
  },
  {
    title: "Javascript",
    icon: "/qualifications/javascript.svg",
    description: "Programming Language",
  },
];

const Qualifications = () => {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 max-md:grid-cols-1">
      {qualifications.map((qualification, index) => (
        <div
          key={index}
          className="hover:bg-body flex cursor-pointer items-center gap-3 border p-2 shadow-lg transition-transform duration-300 ease-linear hover:z-50 hover:scale-[1.3] hover:rotate-[-3deg]"
        >
          <div className="relative h-12 w-12">
            <Image
              src={qualification.icon}
              className="object-contain"
              fill
              alt={`${qualification.title} image`}
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="font-bold">{qualification.title}</div>
            <div className="text-black/70">{qualification.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Qualifications;
