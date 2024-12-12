import React, { useState } from 'react';

const StarRating = ({ rating, setRating }) => {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                        cursor: "pointer",
                        color: star <= rating ? "gold" : "gray"
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;