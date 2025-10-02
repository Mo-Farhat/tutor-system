import "../../css/aboutus/aboutus-points.css";
import React from "react";
import useAnimateOnScroll from "../../utils/useAnimateOnScroll";

function Points() {
  const ref = useAnimateOnScroll();

  return (
    <div ref={ref} className="aboutus-points-section section-animate-target">
      <section
        className="row container-fluid section d-flex g-0 z-index-0 abouts-msg-main"
        id="aboutus-points"
      >
        <div className="col-8 aboutus-points-sec">
          <div className="row d-flex ms-xl-6 about-us-point-main">
            <div className="col-12 col-lg-6 d-flex about-us-point-con order-1 order-lg-1">
              <h1
                className="fw-bold d-flex mb-3 aboutus-point-main-h"
                id="aboutus-point-l"
              >
                Quality Education
              </h1>
              <span className="aboutus-point-des" id="aboutus-point-l">
                We believe that quality education is a pillar for success.
              </span>
            </div>
            <div className="col-12 col-lg-6 d-flex aboutus-point-img-main order-2 order-lg-2">
              <img
                src="/Images/site-images/about-us/aboutus-1.svg"
                alt=""
                className="aboutus-point-img"
                id="aboutus-point1-img"
              />
            </div>
          </div>

          <div className="row d-flex about-us-point-main">
            <div className="col-12 col-lg-6 d-flex about-us-point-con order-1 order-lg-2">
              <h1
                className="fw-bold d-flex mb-3 aboutus-point-main-h"
                id="aboutus-point-r"
              >
                Unique Strengths
              </h1>
              <span className="d-flex aboutus-point-des" id="aboutus-point-r">
                We believe that each student possesses unique strengths
              </span>
            </div>
            <div className="col-12 col-lg-6 d-flex aboutus-point-img-main order-2 order-lg-1">
              <img
                src="/Images/site-images/about-us/aboutus-2.svg"
                alt=""
                className="aboutus-point-img"
                id="aboutus-point2-img"
              />
            </div>
          </div>

          <div className="row d-flex about-us-point-main">
            <div className="col-12 col-lg-6 d-flex about-us-point-con order-1 order-lg-1">
              <h1
                className="fw-bold d-flex mb-3 aboutus-point-main-h"
                id="aboutus-point-l"
              >
                Personalised Tutoring
              </h1>
              <span className="aboutus-point-des" id="aboutus-point-l">
                We believe that each student learns differently and offer
                personalised tutoring.
              </span>
            </div>
            <div className="col-12 col-lg-6 d-flex aboutus-point-img-main order-2 order-lg-2">
              <img
                src="/Images/site-images/about-us/aboutus-3.svg"
                alt=""
                className="aboutus-point-img"
                id="aboutus-point3-img"
              />
            </div>
          </div>

          <div className="row d-flex about-us-point-main">
            <div className="col-12 col-lg-6 d-flex about-us-point-con order-1 order-lg-2">
              <h1
                className="fw-bold d-flex mb-3 aboutus-point-main-h"
                id="aboutus-point-r"
              >
                Learn from the Best
              </h1>
              <span className="d-flex aboutus-point-des" id="aboutus-point-r">
                We believe that to be the best, you have to learn from the best.
                That's why we only hire the top 3%.
              </span>
            </div>
            <div className="col-12 col-lg-6 d-flex aboutus-point-img-main order-2 order-lg-1">
              <img
                src="/Images/site-images/about-us/aboutus-4.svg"
                alt=""
                className="aboutus-point-img"
                id="aboutus-point4-img"
              />
            </div>
          </div>

          <div className="row d-flex about-us-point-main">
            <div className="col-12 col-lg-6 d-flex about-us-point-con order-1 order-lg-1">
              <h1
                className="fw-bold d-flex mb-3 aboutus-point-main-h"
                id="aboutus-point-l"
              >
                Mental Health Advocacy
              </h1>
              <span className="aboutus-point-des" id="aboutus-point-l">
                We understand the pressures of school, and our tutors advocate
                for your mental health.
              </span>
            </div>
            <div className="col-12 col-lg-6 d-flex aboutus-point-img-main order-2 order-lg-2">
              <img
                src="/Images/site-images/about-us/aboutus-5.svg"
                alt=""
                className="aboutus-point-img"
                id="aboutus-point5-img"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Points;

//Hello
