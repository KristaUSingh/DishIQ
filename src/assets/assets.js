import logo from './logo.png'
import basketIcon from './basket_icon.png'
import searchIcon from './search_icon.png'
import cerealAndSnack from './Cereal & Snacks.JPG'
import chilacaMenu from './Chilaca Menu.JPG'
import chilacaRest from './Chilaca Restaurant.JPG'
import chilaca from './Chilaca.JPG'
import chips from './Chips.JPG'
import citizenChickMenu1 from './Citizen Chicken Menu P1.JPG'
import citizenChickMenu2 from './Citizen Chicken Menu P2.JPG'
import citizenChickRest from './Citizen Chicken Restaurant.JPG'
import citizenChick from './Citizen Chicken.JPG'
import daBrixMenu1 from './Da Brix Menu P1.JPG'
import daBrixMenu2 from './Da Brix Menu P2.JPG'
import drinks from './Drinks.JPG'
import header from './Header.jpg'
import citizenChickID1 from './Citizen Chicken ID1.jpg'
import citizenChickID2 from './Citizen Chicken ID2.jpg'
import citizenChickID3 from './Citizen Chicken ID3.jpg'
import citizenChickID4 from './Citizen Chicken ID4.jpg'
import citizenChickID5 from './Citizen Chicken ID5.jpg'
import citizenChickID6 from './Citizen Chicken ID6.jpg'
import citizenChickID7 from './Citizen Chicken ID7.jpg'
import citizenChickID8 from './Citizen Chicken ID8.jpg'
import citizenChickID9 from './Citizen Chicken ID9.jpg'
import citizenChickID10 from './Citizen Chicken ID10.jpg'
import facebook_icon from './facebook_icon.png'
import x_icon from './x_icon.png'
import linkedin_icon from './linkedin_icon.png'
import add_icon_green from './add_icon_green.png'
import add_icon_white from './add_icon_white.png'
import remove_icon_red from './remove_icon_red.png'
import rating_stars from './rating_stars.png'
import cross_icon from './cross_icon.png'
import trash_icon_red from "./trash_icon_red.svg"
import instagram_icon from "./instagram_icon.png"

    
export const assets = {
    logo,
    basketIcon,
    searchIcon,
    cerealAndSnack,
    chilacaMenu,
    chilacaRest,
    chilaca,
    chips,
    citizenChickMenu1,
    citizenChickMenu2,
    citizenChickRest,
    citizenChick,
    daBrixMenu1,
    daBrixMenu2,
    drinks,
    header,
    citizenChickID1,
    citizenChickID2,
    citizenChickID3,
    citizenChickID4,
    citizenChickID5,
    citizenChickID6,
    citizenChickID7,
    citizenChickID8,
    citizenChickID9,
    citizenChickID10,
    facebook_icon,
    x_icon,
    linkedin_icon,
    add_icon_green,
    add_icon_white,
    remove_icon_red, 
    rating_stars,
    cross_icon,
    trash_icon_red,
    instagram_icon
}

export const restaurant_list = [
    {
        restaurant_name: "Chilaca",
        restaurant_image: chilaca,
        description: "Authentic and fresh Mexican street food, featuring customizable burritos and bowls."
    },
    {
        restaurant_name: "Citizen Chicken",
        restaurant_image: citizenChick,
        description: "Hand-breaded chicken sandwiches, tenders, and more!"
    },
    {
        restaurant_name: "Da Brix",
        restaurant_image: daBrixMenu2,
        description: "New York-style pizza and Italian-American comfort dishes, perfect for sharing."
    }
]

export const food_list = [
    {
        /*Think this is database or backend stuff. So only doing one restaurant, Citizen Chicken menu for the sake of the report*/
        _id: "1",
        name: "Halal Chicken Sandwich & Fries",
        price: 9.39,
        image: citizenChickID1,
        category: "Citizen Chicken"

    },
    {
        _id: "2",
        name: "Plant-Based Chicken Sandwich & Fries",
        price: 9.39,
        image: citizenChickID2,
        category: "Citizen Chicken"
    },
    {
        _id: "3",
        name: "Nashville Halal Hot Chicken Sandwich & Fries",
        price: 9.99,
        image: citizenChickID3,
        category: "Citizen Chicken"
    },
    {
        _id: "4",
        name: "Halal Beef Hamburger & Fries",
        price: 11.49,
        image: citizenChickID4,
        category: "Citizen Chicken"
    },
    {
        _id: "5",
        name: "Veggie Burger & Fries",
        price: 11.49,
        image: citizenChickID5,
        category: "Citizen Chicken"
    },
    {
        _id: "6",
        name: "3 Piece Halal Tenders with Fries",
        price: 8.39,
        image: citizenChickID6,
        category: "Citizen Chicken"
    },
    {
        _id: "7",
        name: "5 Piece Halal Tenders with Fries",
        price: 10.49,
        image: citizenChickID7,
        category: "Citizen Chicken"
    },
    {
        _id: "8",
        name: "Fries",
        price: 2.89,
        image: citizenChickID8,
        category: "Citizen Chicken"
    },
    {
        _id: "9",
        name: "Fried Pickles",
        price: 4.19,
        image: citizenChickID9,
        category: "Citizen Chicken"
    },
    {
        _id: "10",
        name: "Add Cheese to Any Sandwich",
        price: 1.55,
        image: citizenChickID10,
        category: "Citizen Chicken"
    }
]