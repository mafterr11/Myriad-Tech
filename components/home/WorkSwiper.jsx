"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useEffect, useRef, useState } from "react";
import { Pagination, Autoplay } from "swiper/modules";
import ProjectCard from "./ProjectCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { useInView, useReducedMotion } from "framer-motion";

const WorkSwiper = ({ projects = [] }) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.3 });
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    if (!swiper?.autoplay) return;

    if (isInView && !prefersReducedMotion) {
      swiper.autoplay.start();
    } else {
      swiper.autoplay.stop();
    }
  }, [swiper, isInView, prefersReducedMotion]);

  return (
    <div ref={containerRef}>
      <Swiper
        className="!px-5 sm:!px-7 xl:!px-0"
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
        pagination={{ el: ".swiper-pagination", clickable: true }}
        autoplay={
          prefersReducedMotion
            ? false
            : {
                delay: 4200,
                pauseOnMouseEnter: true,
                disableOnInteraction: false,
              }
        }
        onSwiper={(instance) => {
          instance.autoplay?.stop();
          setSwiper(instance);
        }}
        aria-label="Selected projects"
      >
        {projects.map((project) => (
          <SwiperSlide key={project.id || project.slug} className="!h-auto">
            <ProjectCard
              project={project}
              cardClassName="h-full min-h-[560px]"
              descriptionClassName="line-clamp-5"
              readMoreThreshold={175}
            />
          </SwiperSlide>
        ))}
        <div
          slot="container-end"
          className="swiper-pagination !static mt-3 flex min-h-6 items-center justify-center"
        />
      </Swiper>
    </div>
  );
};

export default WorkSwiper;
