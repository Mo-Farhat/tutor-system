import React, { useEffect, useRef } from 'react';
import "../../css/home/home-reviews.css"
import useAnimateOnScroll from '../../utils/useAnimateOnScroll';

function Reviews() {

  const reviewsMainRef = useRef(null);
  const ref = useAnimateOnScroll();

  useEffect(() => {
    const reviewsMain = reviewsMainRef.current;
    let scrollSpeed = 1; // Scroll speed: Adjust this to make it faster/slower
    let isScrolling = false;

    // Function to scroll reviewsMain horizontally
    const scrollReviews = () => {
      if (reviewsMain) {
        // Scroll horizontally by 'scrollSpeed' pixels
        reviewsMain.scrollLeft += scrollSpeed;

        // If we've reached the end, reset to the beginning (loop effect)
        if (reviewsMain.scrollLeft >= reviewsMain.scrollWidth - reviewsMain.clientWidth) {
          reviewsMain.scrollLeft = 0;
        }
      }
    };

    // Start scrolling when the component mounts
    const interval = setInterval(scrollReviews, 20); // 10ms interval for smoother scrolling

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  // Latest 6 reviews data
  const latestReviews = [
    {
      name: "Amara",
      date: "2 months ago",
      text: "My tutoring at Strive Academics has been excellent. My tutor, Clayton, explains concepts clearly, and I've already noticed significant improvement. I highly recommend him and Strive for UCAT preparation."
    },
    {
      name: "Mehriza Khokhar",
      date: "a month ago", 
      text: "My experience with Strive Academics has been fantastic. I highly recommend both the company and my tutor, Clayton. He provides tailored sessions that focus on my goals and areas of weakness."
    },
    {
      name: "Lihini Vandercone",
      date: "a month ago",
      text: "I found Yong's class to be effective, encouraging and improving. Thanks to his guidance and aid, I have seen noticeable changes and improvements within my Ucat performance."
    },
    {
      name: "Skye Madeleine",
      date: "3 months ago",
      text: "The interview tutoring at Strive Academics was exceptional!! My tutors, Brendan and Seran, provided clear explanations and encouraged everyone to actively participate in answering questions."
    },
    {
      name: "Janette Nguyen", 
      date: "3 months ago",
      text: "My son has been tutoring with Sienna for UCAT, she is amazing with him. Very knowledgeable and has given many tips on how to better achieve and understand the UCAT."
    },
    {
      name: "Alice Niu",
      date: "3 weeks ago",
      text: "Sienna was my tutor and she was very helpful in assisting me with UCAT preparation. Pasindu was also very supportive and easy to reach out to."
    }
  ];

  return (
    <div ref={ref} className="home-reviews-section section-animate-target">
      <section
        className="row container-fluid section d-flex g-0 z-index-0"
        id="home_reviews"
      >
        <h1 className="row col-8 d-flex fw-bold reviews-main-h">🌟 Trusted by Families Across Australia</h1>

        <p className="row col-6 d-flex fw-light reviews-sub-h">
        See why students love learning with us.
        </p>

        <div class="row container d-flex g-0 gap-3 reviews-main" ref={reviewsMainRef} >
          {latestReviews.map((review, index) => (
            <div key={index} className="col-3 d-flex review-main">
              <div className="row h-100 w-100 g-0 gap-3 d-flex p-3 review-sec">
                <div className="row g-0 container d-flex review-t">
                  <div className="d-flex p-2 review-u-img-main">
                    <div className="d-flex review-u-img-sec">
                      {/* <img src="" alt="" srcset="" /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-user temp-user"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                      </svg>
                    </div>
                  </div>
                  <div className="row d-flex review-details-main">
                    <h1 className="fw-bold mb-0 review-un">{review.name}</h1>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
                <div className="gap-3 review-icns-main">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-star"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-star"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-star"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-star"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-star"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                </div>
                <div className="row review-con-main">
                  <span className="w-100 h-100 review-con">
                    {review.text}
                  </span>
                </div>
                <div className="d-flex review-site-img-main">
                  <img src="/Images/review sites/trustpilot.png" className="review-site-img" alt="" />
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Reviews;