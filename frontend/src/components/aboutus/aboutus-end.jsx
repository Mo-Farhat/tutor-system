import "../../css/aboutus/aboutus-end.css";
import React from "react";
import useAnimateOnScroll from "../../utils/useAnimateOnScroll";

function Aboutend() {
  const ref = useAnimateOnScroll();

  return (
    <div ref={ref} className="aboutus-end-section section-animate-target">
      <section
        className="row container-fluid d-flex g-0 about-us-end-main"
        id="aboutus_end"
      >
        <div className="col-12 col-lg-8 d-flex aboutus-end-sec">
          <h1 className="row fw-bold aboutus-end-main-h">Why Choose Us ?</h1>
          <span className="row fw-semibold aboutus-end-des">
            With decades of experience among our tutors, we know how to help you
            strive for your personal best.
          </span>

          <p className="row col-10 aboutus-end-slogan">
            <span className="fw-bold aboutus-end-slogan-bold">
              Strive for your Personal Best.
            </span>{" "}
            Get started with one of our stellar tutors now!
            <br />
            <a href="/find-a-tutor" className="aboutus-end-cta-link">Find a Tutor now</a>
          </p>

          <div className="col-12 d-flex gap-5 aboutus-end-btn-grp">
            <a
              href="/find-a-tutor"
              type="button"
              className="col-4 btn btn-outline-primary border-3 fw-semibold aboutus-end-btn"
              id="aboutus-end-btn-1"
            >
              👩🏻‍🏫 Private Tutoring
            </a>
            <a
              href="/pricing?category=1"
              type="button"
              className="col-4 btn btn-outline-primary border-3 fw-semibold aboutus-end-btn"
              id="aboutus-end-btn-2"
            >
              🧑🏻‍🎓 Bring a Friend and Save
            </a>
            <a
              href="/interview-preparation"
              type="button"
              className="col-4 btn btn-outline-primary border-3 fw-semibold aboutus-end-btn"
              id="aboutus-end-btn-3"
            >
              💻 Interview Preparation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Aboutend;