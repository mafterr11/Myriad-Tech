"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination, Autoplay } from "swiper/modules";
import ProjectCard from "./ProjectCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { useReducedMotion } from "framer-motion";

const WorkSwiper = ({ projects = [] }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Swiper
      className="h-[620px] !px-5 pb-10 sm:!px-7 xl:!px-0"
      slidesPerView={1}
      slidesPerGroup={1}
      breakpoints={{
        700: {
          slidesPerView: 2,
        },
        1400: {
          slidesPerView: 3,
        },
      }}
      spaceBetween={18}
      modules={[Pagination, Autoplay]}
      pagination={{ clickable: true }}
      autoplay={
        prefersReducedMotion
          ? false
          : {
              delay: 4200,
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
            }
      }
      aria-label="Selected projects"
    >
      {projects.map((project) => (
        <SwiperSlide key={project.id || project.slug} className="!h-auto">
          <ProjectCard
            project={project}
            cardClassName="h-[560px]"
            descriptionClassName="line-clamp-5"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default WorkSwiper;
