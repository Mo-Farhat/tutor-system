import React from "react";
import "../../css/reviews/reviews-list.css";

// Review card component
const ReviewCard = ({ name, date, rating, reviewText, platform, ownerReply, ownerReplyDate, isNew, photos }) => {
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

  return (
    <div className="review-card">
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
      
      <div className="review-text">
        <p>{reviewText}</p>
      </div>

      {ownerReply && (
        <div className="owner-reply">
          <div className="owner-reply-header">
            <strong>Strive Academics (owner)</strong>
            <span className="owner-reply-date">{ownerReplyDate}</span>
          </div>
          <p className="owner-reply-text">{ownerReply}</p>
        </div>
      )}
      
      <div className="review-platform">
        <img src="/Images/review sites/google.png" alt="Google" className="platform-icon" />
      </div>
    </div>
  );
};

function ReviewsList() {
  // Real Google Reviews data
  const reviews = [
    {
      id: 1,
      name: "Amara",
      date: "2 months ago",
      rating: 5,
      reviewText: "My tutoring at Strive Academics has been excellent. My tutor, Clayton, explains concepts clearly, and I've already noticed significant improvement. I highly recommend him and Strive for UCAT preparation.",
      platform: "google",
      ownerReply: "Thank you for the kind words Amara!",
      ownerReplyDate: "2 months ago"
    },
    {
      id: 2,
      name: "Mehriza Khokhar",
      date: "a month ago",
      rating: 5,
      reviewText: "My experience with Strive Academics has been fantastic. I highly recommend both the company and my tutor, Clayton. He provides tailored sessions that focus on my goals and areas of weakness, and he explains concepts and strategies for …More",
      platform: "google",
      ownerReply: "Thank you Mehriza, we appreciate the kind words",
      ownerReplyDate: "a month ago"
    },
    {
      id: 3,
      name: "Lihini Vandercone",
      date: "a month ago",
      rating: 5,
      reviewText: "I found Yong's class to be effective, encouraging and improving. Thanks to his guidance and aid, I have seen noticeable changes and improvements within my Ucat performance throughout these few classes. So far I have had a positive experience, and look forward to continue to benefit from this support and help.",
      platform: "google",
      ownerReply: "Thank you Lihini, we're really pleased that you've been enjoying sessions!",
      ownerReplyDate: "a month ago"
    },
    {
      id: 4,
      name: "Skye Madeleine",
      date: "3 months ago",
      rating: 5,
      reviewText: "The interview tutoring at Strive Academics was exceptional!! My tutors, Brendan and Seran, provided clear explanations and encouraged everyone to actively participate in answering questions. The mock interview opportunities were incredibly helpful, and the feedback I received was detailed and thorough. I highly recommend their services.",
      platform: "google",
      ownerReply: "Thank you Skye, we're very happy that you achieved an offer!",
      ownerReplyDate: "3 months ago"
    },
    {
      id: 5,
      name: "Janette Nguyen",
      date: "3 months ago",
      rating: 5,
      reviewText: "My son has been tutoring with Sienna for UCAT, she is amazing with him. Very knowledgeable and has given many tips on how to better achieve and understand the UCAT. I'm excited to see my son's progress through the next few months with Sienna and what he will achieve in his UCAT. Thank you Pasindu and strive for recommending Sienna.",
      platform: "google",
      ownerReply: "Thank you Janette! We appreciate the kind words",
      ownerReplyDate: "3 months ago",
      reviewCount: "5 reviews"
    },
    {
      id: 6,
      name: "Sandamalie Gunasinghe",
      date: "a month ago",
      rating: 5,
      reviewText: "We are very grateful to Pasindu and his colleague Adithya for their support and encouragement during the preparation for the medical interview process of my daughter. …More",
      platform: "google",
      ownerReply: "Thank you Sandamalie! We're very happy that your daughter was able to achieve her goal with us.",
      ownerReplyDate: "a month ago",
      reviewCount: "3 reviews"
    },
    {
      id: 7,
      name: "Alice Niu",
      date: "3 weeks ago",
      rating: 5,
      reviewText: "Sienna was my tutor and she was very helpful in assisting me with UCAT preparation. Pasindu was also very supportive and easy to reach out to.",
      platform: "google",
      ownerReply: "Thanks Alice, we really appreciate your kind words!",
      ownerReplyDate: "3 weeks ago",
      isNew: true
    },
    {
      id: 8,
      name: "Piumee Bandara",
      date: "a week ago",
      rating: 5,
      reviewText: "My tutor Sienna and the team at Strive Academics have been extremely supportive and encouraging in helping me with UCAT and my ATAR subjects, Biology & Chemistry. They have given me mentorship and advice outside of sessions, and I found my UCAT sessions with Sienna very helpful.",
      platform: "google",
      ownerReply: "Thank you Piumee!",
      ownerReplyDate: "9 months ago",
      reviewCount: "2 reviews",
      isNew: true
    },
    {
      id: 9,
      name: "kizza Kogami",
      date: "4 months ago",
      rating: 5,
      reviewText: "Personally I found it overly helpful in achieving the best results in my medical interview. I would highly recommend it for interview prep. They did however focus mainly on Adelaide medical and dental interviews as most of the students were …More",
      platform: "google",
      ownerReply: "Thanks for the feedback, and we're glad you achieved your goal! Your feedback is really helpful in updating our workshops to make sure it caters to all universities and not just Adelaide. All the best and congratulations!",
      ownerReplyDate: "4 months ago"
    },
    {
      id: 10,
      name: "Andrew Baxter",
      date: "4 months ago",
      rating: 5,
      reviewText: "Could not speak more highly of Strive. My daughter got the absolute min ATAR and UCAT, but thanks to Strive she smashed the interview and landed an offer. Worth every penny.",
      platform: "google",
      ownerReply: "Thanks for the kind words Andrew, we're very happy that your daughter achieved her goal!",
      ownerReplyDate: "4 months ago",
      reviewCount: "5 reviews",
      photos: 1
    },
    {
      id: 11,
      name: "Keerat Ghotra",
      date: "8 months ago",
      rating: 5,
      reviewText: "Aaditya, one of the tutors at Strive, has been an incredible support in preparing me for med interviews. His feedback is amazing, and his expertise shines through in every session. I highly recommend strive for medicine interview prep.",
      platform: "google",
      ownerReply: "Thank you Keerat, we're glad you've been enjoying sessions with Aaditya",
      ownerReplyDate: "8 months ago",
      reviewCount: "3 reviews"
    },
    {
      id: 12,
      name: "Anushree Vora",
      date: "7 months ago",
      rating: 5,
      reviewText: "Strive Academics have helped me significantly! The tutors are highly supportive, and the group sessions are very informative and collaborative! It works really well to break down the key areas of interviews into more manageable sessions!",
      platform: "google",
      ownerReply: "Thank you Anushree, we appreciate your kind words",
      ownerReplyDate: "7 months ago",
      reviewCount: "6 reviews",
      photos: 1
    },
    {
      id: 13,
      name: "Krishna Sriram",
      date: "11 months ago",
      rating: 5,
      reviewText: "I have been taking the Strive UCAT training recently and it has truly been a game changer in helping me improve my skills. My tutor Brendan has been amazing and his support has made the whole process more enjoyable and easier. Would definitely recommend to others",
      platform: "google",
      ownerReply: "Thank you! We're glad you've enjoyed sessions.",
      ownerReplyDate: "11 months ago",
      reviewCount: "14 reviews"
    },
    {
      id: 14,
      name: "Renèe Jane Borkowski",
      date: "4 months ago",
      rating: 5,
      reviewText: "Strive has provided a supportive learning environment. Everything is explained clearly, you're given so much patience to figure out the answer and explanations where you might have gone wrong, to better next time. You are never made to feel like you can't, only that with more practise you can! Thanks so much for your support :)",
      platform: "google",
      ownerReply: "Thanks Renèe! We will pass on your kind words to your tutor Chamith",
      ownerReplyDate: "4 months ago",
      reviewCount: "13 reviews",
      photos: 4
    },
    {
      id: 15,
      name: "Agan Pillai",
      date: "a year ago",
      rating: 5,
      reviewText: "Strive UCAT has been super helpful in helping me learn UCAT skills and improving my scores! I am currently learning with Pasindu, and the experience has been patient and amazing, and I'm feeling very confident in how progress has been going. 10/10 would recommend to anyone who wants tutoring for UCAT.",
      platform: "google",
      ownerReply: "Thank you Agan!",
      ownerReplyDate: "a year ago",
      reviewCount: "3 reviews"
    },
    {
      id: 16,
      name: "Abiram Jeyanthan",
      date: "8 months ago",
      rating: 5,
      reviewText: "Strive academics has been an amazing service to kickstart my interview preparation journey. Aaditya Meda has been an amazing help by providing all the best answers and really helping me step by step for what to do. Would recommend for anyone currently lost on their journey to enter med/dent!",
      platform: "google",
      ownerReply: "Thank you Abiram, we appreciate your feedback and will pass on your kind words to Aaditya.",
      ownerReplyDate: "8 months ago",
      reviewCount: "2 reviews"
    },
    {
      id: 17,
      name: "Spiridon Spiliopoulos",
      date: "11 months ago",
      rating: 5,
      reviewText: "Over the last few months, I have had the pleasure of participating in tutoring sessions with Brendan. Our time together has been incredibly valuable. Brendan's unwavering enthusiasm and passion for his work has significantly boosted my confidence in my UCAT studies.",
      platform: "google",
      ownerReply: "Thank you Spiridon! We'll make sure to pass on your kind words to Brendan.",
      ownerReplyDate: "11 months ago"
    },
    {
      id: 18,
      name: "Joel Ransom",
      date: "6 months ago",
      rating: 5,
      reviewText: "Very pleased with my tutoring with Seran. His lessons were very beneficial and held me in good stead for my interview!",
      platform: "google",
      ownerReply: "Thank you Joel, Seran loved working with you. Hoping for good news soon!",
      ownerReplyDate: "6 months ago"
    },
    {
      id: 19,
      name: "Advait Naik",
      date: "a year ago",
      rating: 5,
      reviewText: "The tutors at Strive have provided me with excellent guidance, and have taught me many skills that have aided me in my UCAT study. I would highly recommend Strive to anyone looking to prepare for their UCAT exams.",
      platform: "google",
      ownerReply: "Thank you Advait",
      ownerReplyDate: "a year ago"
    },
    {
      id: 20,
      name: "Aden Lu",
      date: "2 years ago",
      rating: 5,
      reviewText: "Strive tuition definitely impacted my confidence going into the UCAT in a positive way, providing great resources and teachings which improved my timing and accuracy skills. The tutors are very knowledgeable and were happy to help with any …More",
      platform: "google",
      ownerReply: "Thank you Aden! Your feedback means so much to our tutoring team",
      ownerReplyDate: "2 years ago",
      reviewCount: "3 reviews"
    }
  ];

  return (
    <div className="d-flex reviews-list-container">
      <div className="reviews-grid">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
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
  );
}

export default ReviewsList; 