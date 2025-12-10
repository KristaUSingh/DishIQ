import React from 'react'
import './ExploreRestaurants.css'
import { restaurant_list } from '../../../assets/assets'
import { useNavigate } from "react-router-dom";

const ExploreRestaurants = () => {
  const navigate = useNavigate();

  return (
    <div className='explore-restaurant' id='explore-restaurant'>
      <h1>Explore Our Restaurants</h1>
      <p className='explore-restaurant-text'>
        Choose your next meal from our diverse restaurants featuring a delectable array of dishes.
      </p>

      <div className='explore-restaurant-list'>
        {restaurant_list.map((item, index) => (
          <div
            key={index}
            className='explore-restaurant-list-item'
            onClick={() => navigate(`/restaurant/${item.restaurant_name}`)}
          >
            <img src={item.restaurant_image} alt={item.restaurant_name} />
            <p><b>{item.restaurant_name}</b></p>
            <p className='restaurant-description'>{item.description}</p>
          </div>
        ))}
      </div>

      <hr />
    </div>
  );
};

export default ExploreRestaurants;
