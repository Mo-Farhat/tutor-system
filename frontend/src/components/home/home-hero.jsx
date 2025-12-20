import "../../css/home/home-hero.css"
import React from 'react';
import useAnimateOnScroll from '../../utils/useAnimateOnScroll';

function Hero() {
  const ref = useAnimateOnScroll();

  return (
    <div ref={ref} className="home-hero-section section-animate-target">
      <section
        className="row container-fluid d-flex g-0"
        id="home_hero"
      >

        <div className="hero-content-wrapper container position-relative">
          <div className="hero-sec d-flex align-items-center">
            <div className="row w-100">
              {/* Text Column */}
              <div className="col-lg-7 col-md-12 d-flex flex-column justify-content-center hero-text-col">
                <h1 className="fw-bold hero-main-h">
                  Welcome to Strive Academics!
                </h1>
                <span className="hero-sub-h">
                  Strive to achieve your personal best and unlock your full academic
                  potential.
                </span>
                <div className="d-flex gap-3 hero-btns-main">
                  <a href="/find-a-tutor"
                    type="button"
                    className="btn btn-primary hero-btns"
                    id="hero-ft-btn"
                  >
                    Find a Tutor
                  </a>
                  <a href="#home_services"
                    type="button"
                    className="btn btn-outline-primary hero-btns"
                    id="hero-lau-btn"
                  >
                    Learn about us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Image Column - Now outside .hero-sec */}
          <div className="hero-img-container">
              <img 
              src="/Images/Home/hero-student.png" 
              alt="Student holding diploma" 
              className="img-fluid hero-student-img"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
