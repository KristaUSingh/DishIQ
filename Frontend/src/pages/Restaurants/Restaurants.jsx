import React from 'react';
import './Restaurants.css'; 
import { useNavigate } from 'react-router-dom';

import AIChatbot from '../../components/AIChatbot/AIChatbot';
import { restaurant_list } from '../../assets/assets'; 

const CHILACA_IMAGE_URL = "https://www.ninosalvaggio.com/wp-content/uploads/2020/04/Ninos_Mexican-FOOD-1024x683.jpg";
const CITIZEN_CHICKEN_IMAGE_URL = "https://www.unileverfoodsolutions.us/dam/global-ufs/mcos/NAM/calcmenu/recipes/US-recipes/sandwiches/spicy-mayo-fried-chicken-sandwich/crispychickensandwich_1206x709.jpg";
const DA_BRIX_IMAGE_URL = "https://pizzatoday.com/wp-content/uploads/2021/03/nyslice-1.jpg";


const getDetailedDescription = (name) => {
    switch (name) {
        case 'Chilaca':
            return 'Experience the vibrancy of authentic Mexican street food. Chilaca offers fully customizable burritos, bowls, tacos, and quesadillas, crafted with fresh, high-quality ingredients and bold, traditional flavors. Your next favorite Mexican meal starts here.';
        case 'Citizen Chicken':
            return 'Serving up hand-crafted perfection, Citizen Chicken specializes in premium, hand-breaded chicken sandwiches, succulent tenders, and crispy fries. Focused on quality and comfort, it’s the ultimate destination for a satisfying, craveable chicken experience.';
        case 'Da Brix':
            return 'Bringing a taste of the East Coast to you, Da Brix features classic New York-style thin-crust pizza, hearty pasta dishes, and Italian-American comfort food. Perfect for a family dinner or sharing with friends, our recipes are steeped in tradition and flavor.';
        default:
            return 'Discover a delicious menu from this unique restaurant.';
    }
};

const Restaurants = () => {
  const navigate = useNavigate();

  const handleRestaurantClick = (restaurantName) => {
    navigate(`/restaurant/${restaurantName}`); 
  };

 return (
    <> 
      <div className='restaurants-page'>
        <div className="restaurants-header-full">
          <h1 className='title'>Explore Our Restaurants</h1>
          <p className='subtitle'>
            Choose your next meal from our diverse collection of restaurants, each featuring a delectable array of unique and satisfying dishes.
          </p>
        </div>
          
        <div className="restaurants-list-full-vertical"> 
          {restaurant_list.map((item, index) => {
            
            let imageUrl = item.restaurant_image;

            if (item.restaurant_name === 'Chilaca') {
              imageUrl = CHILACA_IMAGE_URL;
            } else if (item.restaurant_name === 'Citizen Chicken') {
              imageUrl = CITIZEN_CHICKEN_IMAGE_URL; 
            } else if (item.restaurant_name === 'Da Brix') {
              imageUrl = DA_BRIX_IMAGE_URL; 
            }

            return (
              <div 
                key={index} 
                className="restaurant-card-vertical"
                onClick={() => handleRestaurantClick(item.restaurant_name)} 
              >
                <div className='restaurant-image-container-vertical'>
                   <img 
                     src={imageUrl} 
                     alt={item.restaurant_name} 
                     className='restaurant-image-vertical' 
                   />
                </div>

                <div className='restaurant-details-vertical'>
                    <h2 className='restaurant-name-vertical'>{item.restaurant_name}</h2>
                    <p className='restaurant-description-vertical'>
                        {getDetailedDescription(item.restaurant_name)}
                    </p>
                    <button className='view-menu-btn'>View Menu</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Added Chatbot wrapper */}
      <div className="chatbot-wrapper">
        <AIChatbot />
      </div>
    </>
  );
};

export default Restaurants;
