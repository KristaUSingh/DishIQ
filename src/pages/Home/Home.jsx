import React, { useState } from 'react';
import './Home.css';

import Header from '../../components/navbar/Header/Header';
import ExploreRestaurants from '../../components/navbar/ExploreRestaurants/ExploreRestaurants';
import FoodDisplay from '../../components/navbar/FoodDisplay/FoodDisplay';

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div>
      <Header />
      <ExploreRestaurants category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
    </div>
  );
};

export default Home;
