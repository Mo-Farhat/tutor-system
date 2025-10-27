import React, { useState } from "react";
import "../../css/reviews/reviews-list.css";
import useAnimateOnScroll from '../../utils/useAnimateOnScroll';

// Review card component
const ReviewCard = ({ id, name, date, rating, reviewText, platform, ownerReply, ownerReplyDate, isNew, photos }) => {
  const [expanded, setExpanded] = useState(false);

  // Generate star ratings (filled and unfilled)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star empty"}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Get emoji for avatar based on name
  const getEmoji = (name) => {
    const firstChar = name.charAt(0).toUpperCase();
    // Generate emoji based on first character or specific names
    const avatarEmojis = {
      'A': '👨', 'B': '👩', 'C': '👨‍🦱', 'D': '👩‍🦰', 'E': '👨‍🦰', 'F': '👩‍🦱',
      'G': '👨‍🦲', 'H': '👩‍🦲', 'I': '👨‍💼', 'J': '👩‍💼', 'K': '👨‍🎓', 'L': '👩‍🎓',
      'M': '👨‍🔬', 'N': '👩‍🔬', 'O': '👨‍💻', 'P': '👩‍💻', 'Q': '👨‍🎨', 'R': '👩‍🎨',
      'S': '👨‍🏫', 'T': '👩‍🏫', 'U': '👨‍⚕️', 'V': '👩‍⚕️', 'W': '👨‍🌾', 'X': '👩‍🌾',
      'Y': '👨‍🍳', 'Z': '👩‍🍳'
    };
    return avatarEmojis[firstChar] || "👤";
  };

  const shouldShowToggle = (reviewText || '').length > 220 || !!ownerReply;
  const textId = `review-text-${id}`;

  return (
    <div className={`review-card ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="reviewer-info">
        <div className="reviewer-avatar" data-name={name}>
          <div className="avatar-placeholder">
            {getEmoji(name)}
          </div>
        </div>
        <div className="reviewer-name-date">
          <h3 className="reviewer-name">
            {name}
            {isNew && <span className="new-badge">New</span>}
            {photos && photos > 0 && <span className="photo-count">📷 {photos}</span>}
          </h3>
          <p className="review-date">{date}</p>
        </div>
      </div>
      
      <div className="review-rating">
        {renderStars(rating)}
      </div>
      
      <div className={`review-text ${expanded ? '' : 'clamped'}`} id={textId}>
        <p>{reviewText}</p>
      </div>

      {expanded && ownerReply && (
        <div className="owner-reply">
          <div className="owner-reply-header">
            <strong>Strive Academics (owner)</strong>
            <span className="owner-reply-date">{ownerReplyDate}</span>
          </div>
          <p className="owner-reply-text">{ownerReply}</p>
        </div>
      )}

      {shouldShowToggle && (
        <button
          type="button"
          className="read-more-btn"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
      
      <div className="review-platform">
        <img src="/Images/review sites/google.png" alt="Google" className="platform-icon" />
      </div>
    </div>
  );
};

function ReviewsList() {
  // New Google Reviews data
  const reviews = [

    {
      id: 2,
      name: "Charlotte Hamilton",
      date: "19 Jan 2024",
      rating: 5,
      reviewText: "Each of the tutors at Strive were committed to providing individualised support, and helped each student improve in the areas they struggled with. I could not have received dentistry offers in two states without their guidance, I highly recommend!!",
      platform: "google"
    },
    {
      id: 3,
      name: "Anushree Vora",
      date: "33 weeks ago",
      rating: 5,
      reviewText: "Strive Academics have helped me significantly! The tutors are highly supportive, and the group sessions are very informative and collaborative! It works really well to break down the key areas of interviews into more manageable sessions!",
      platform: "google"
    },
    {
      id: 4,
      name: "Sandamalie Gunasinghe",
      date: "4 weeks ago",
      rating: 5,
      reviewText: "We are very grateful to Pasindu and his colleague Adithya for their support and encouragement during the preparation for the medical interview process of my daughter. Their guidance helped build confidence and provided valuable insights into how to approach the interview with clarity and composure. They generously shared their experiences and tips, which made a real difference during the preparation journey. Their willingness to take time to help and motivate was truly appreciated, and their contribution was an important part of the success achieved. We are thankful for their kindness and support and would highly recommend them to anyone preparing for their medical school journey.",
      platform: "google"
    },

    {
      id: 6,
      name: "Mehriza Khokhar",
      date: "4 weeks ago",
      rating: 5,
      reviewText: "My experience with Strive Academics has been fantastic. I highly recommend both the company and my tutor, Clayton. He provides tailored sessions that focus on my goals and areas of weakness, and he explains concepts and strategies for different UCAT question types clearly. Clayton is also flexible and understanding with scheduling. I've already seen improvements in my scores and feel confident that, with his guidance, I can achieve a competitive UCAT score.",
      platform: "google"
    }
  ];

  const ref = useAnimateOnScroll();

  return (
    <div ref={ref} className="reviews-list-section section-animate-target">
      <div className="d-flex reviews-list-container">
        <div className="reviews-grid">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              name={review.name}
              date={review.date}
              rating={review.rating}
              reviewText={review.reviewText}
              platform={review.platform}
              ownerReply={review.ownerReply}
              ownerReplyDate={review.ownerReplyDate}
              isNew={review.isNew}
              photos={review.photos}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewsList; 