import React, { useEffect, useRef } from 'react';
import "../../css/home/home-reviews.css"

function Reviews() {

  const reviewsMainRef = useRef(null);

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
      name: "Yuvraj Singh",
      date: "21 Jun 2022",
      text: "Amazing team of dedicated tutors promoting a fun and encouraging learning environment. Highly recommend them for your studies."
    },
    {
      name: "Charlotte Hamilton",
      date: "19 Jan 2024", 
      text: "Each of the tutors at Strive were committed to providing individualised support, and helped each student improve in the areas they struggled with. I could not have received dentistry offers in two states without their guidance, I highly recommend!!"
    },
    {
      name: "Anushree Vora",
      date: "33 weeks ago",
      text: "Strive Academics have helped me significantly! The tutors are highly supportive, and the group sessions are very informative and collaborative! It works really well to break down the key areas of interviews into more manageable sessions!"
    },
    {
      name: "Sandamalie Gunasinghe",
      date: "4 weeks ago",
      text: "We are very grateful to Pasindu and his colleague Adithya for their support and encouragement during the preparation for the medical interview process of my daughter. Their guidance helped build confidence and provided valuable insights into how to approach the interview with clarity and composure."
    },
    {
      name: "Piumee Bandara", 
      date: "11 minutes ago",
      text: "My tutor Sienna and the team at Strive Academics have been extremely supportive and encouraging in helping me with UCAT and my ATAR subjects, Biology & Chemistry. They have given me mentorship and advice outside of sessions, and I found my UCAT sessions with Sienna very helpful."
    },
    {
      name: "Mehriza Khokhar",
      date: "4 weeks ago",
      text: "My experience with Strive Academics has been fantastic. I highly recommend both the company and my tutor, Clayton. He provides tailored sessions that focus on my goals and areas of weakness, and he explains concepts and strategies for different UCAT question types clearly."
    }
  ];

  return (

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

  );
}

export default Reviews;