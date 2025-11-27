// ExploreRestaurants.jsx (Updated)

import React from 'react'
import './ExploreRestaurants.css'
import { restaurant_list } from '../../../assets/assets'

const ExploreRestaurants = ({category, setCategory}) => {

  return (
    <div className='explore-restaurant' id='explore-restaurant'>
      <h1>Explore Our Restaurants</h1>
      <p className='explore-restaurant-text'>Choose your next meal from our diverse restaurants featuring a delectable array of dishes. </p>
      <div className='explore-restaurant-list'> 
        {restaurant_list.map((item,index)=>{
            return(
                <div onClick={()=>setCategory(prev=>prev===item.restaurant_name?"All":item.restaurant_name)} key={index} className='explore-restaurant-list-item'>
                    <img className={category===item.restaurant_name?"active":""} src={item.restaurant_image} alt={item.restaurant_name}/>
                    {/* Make the name bold */}
                    <p><b>{item.restaurant_name}</b></p> 
                    {/* Add the description caption */}
                    <p className='restaurant-description'>{item.description}</p>
                </div>
            )
        })}
      </div>
      <hr/>
    </div>
  )
}

export default ExploreRestaurants
