/**
 * Rocket Icon Component
 * Stylized rocket icon matching the Skillence brand
 */

const RocketIcon = ({ className = "w-8 h-8", showFlame = true, showStars = true }) => {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rocket Body */}
      <path
        d="M50 10 L35 50 L30 90 L50 110 L70 90 L65 50 Z"
        stroke="#54C6F4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Rocket Window */}
      <circle
        cx="50"
        cy="40"
        r="8"
        stroke="#54C6F4"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Rocket Fins */}
      <path
        d="M35 50 L25 60 L30 65 Z"
        stroke="#54C6F4"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M65 50 L75 60 L70 65 Z"
        stroke="#54C6F4"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Flame */}
      {showFlame && (
        <path
          d="M45 90 L50 105 L55 90"
          stroke="#FFC107"
          strokeWidth="3"
          strokeLinecap="round"
          fill="#FFC107"
          opacity="0.8"
        />
      )}
      
      {/* Stars/Sparkles */}
      {showStars && (
        <>
          <circle cx="75" cy="25" r="2" fill="#E91E63" opacity="0.8" />
          <circle cx="80" cy="30" r="1.5" fill="#E91E63" opacity="0.6" />
          <circle cx="25" cy="35" r="1.5" fill="#E91E63" opacity="0.7" />
        </>
      )}
    </svg>
  );
};

export default RocketIcon;
