import React, { useState } from 'react';
import './Home.css';

import Header from '../../components/navbar/Header/Header';
import ExploreRestaurants from '../../components/navbar/ExploreRestaurants/ExploreRestaurants';
import FoodDisplay from '../../components/navbar/FoodDisplay/FoodDisplay';

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <>
      <Header />
      <ExploreRestaurants category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
    </>
  );
};

export default Home;
