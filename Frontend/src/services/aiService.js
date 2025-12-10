import { supabase } from "../api/supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
const LLM_MODEL = "gemini-2.5-flash"; 

export async function getChatbotResponse(userMessage) {
  // 1. Search local KB (case-insensitive)
  const { data: kbMatches, error } = await supabase
    .from("knowledge_base")
    .select("kb_id, question, answer, disabled")
    .ilike("question", `%${userMessage}%`);

  if (error) {
    console.error("KB search error:", error);
  }

  // 2. If KB found and not disabled → return KB answer
  if (kbMatches && kbMatches.length > 0) {
    const bestMatch = kbMatches[0];

    if (!bestMatch.disabled) {
      return {
        answer: bestMatch.answer,
        source: "KB",
        kb_id: bestMatch.kb_id
      };
    }
  }

  // 3. Otherwise fallback to LLM
  try {
    // LLM Contextual Prompt
    const prompt = `You are a assistant for the DishIQ restaurant ordering platform. Answer the user's question, which the local knowledge base could not answer, based on general knowledge or the context of a food/restaurant system. There are 3 restaurants: Chilaca (Authentic and fresh Mexican street food, featuring customizable burritos and bowls.), Citizen Chicken (Hand-breaded chicken sandwiches, tenders, and more!), and Da Brix (New York-style pizza and Italian-American comfort dishes, perfect for sharing.). 
    The menus are as such "dish_id	name	price	restaurant_name	category	description
      4	Placeholder	0	Chilaca	Burritos	
      5	Cilantro Lime Chicken Burrito	9.39	Chilaca	Burritos	Contains Chicken marinated with fresh lime, cilantro, and cumin and Cilantro Lime Rice.Topped with cheddar cheese, sour cream, Jalapeno Peppers, and Cuban Black Beans
      6	Pork Conchinita Pibil Burrito	9.39	Chilaca	Burritos	Contains slow roasted Pork marinated in citrus and achiote and Spanish Brown Rice. Topped with Fajita Vegetables, Salsa Verde, and Cheddar Cheese
      7	Beef Picadillo Burrito	9.39	Chilaca	Burritos	Contains ground beef simmered in a tomato-based sauce with Cilantro Lime Rice. Topped with chipotle ranch, fajita vegetables, and cheddar cheese
      8	Placeholder	0	Chilaca	Bowls	
      9	Cilantro Lime Chicken Bowl	9.39	Chilaca	Bowls	Contains Chicken marinated with fresh lime, cilantro, and cumin and Cilantro Lime Rice. Topped with Fajita Vegetables, Sour Cream, Jalapeno Peppers, and Spanish Pinto Beans
      10	Pork Conchinita Pibil Bowl	9.39	Chilaca	Bowls	Contains slow roasted Pork marinated in citrus and achiote and Spanish Brown Rice with Spanish Pinto Beans. Topped with Fajita Vegetables, Chipotle Ranch, and Cheddar Cheese
      11	Beef Picadillo Bowl	9.39	Chilaca	Bowls	Contains ground beef simmered in a tomato-based sauce with Cilantro Lime Rice and Cuban Black Beans. Topped with Sour Cream, Fajita vegetables, and Cheddar cheese
      12	Placeholder	0	Chilaca	SALADS	
      13	Cilantro Lime Chicken Salad	9.39	Chilaca	SALADS	Contains Chicken marinated with fresh lime, cilantro, and cumin and Cilantro Lime Rice. Topped with Fajita Vegetables, Salsa Verde, Jalapeno Peppers, and Spanish Pinto Beans
      14	Pork Conchinita Pibil Salad	9.39	Chilaca	SALADS	Contains slow roasted Pork marinated in citrus and achiote and Spanish Brown Rice with Spanish Pinto Beans. Topped with Fajita Vegetables, Chipotle Ranch, and Jalapenos
      15	Beef Picadillo Salad	9.39	Chilaca	SALADS	Contains ground beef simmered in a tomato-based sauce with Cilantro Lime Rice and Cuban Black Beans. Topped with Sour Cream, Fajita vegetables, and Chipotle Ranch
      16	Placeholder	0	Chilaca	Tacos	
      17	Cilantro Lime Chicken Taco	3.09	Chilaca	Tacos	1 taco. Contains Chicken marinated with fresh lime, cilantro, and cumin and Cilantro Lime Rice in a soft shell. Topped with Fajita Vegetables, Salsa Verde, Spanish Pinto Beans, and Cheddar Cheese.
      18	Pork Conchinita Pibil Taco	3.09	Chilaca	Tacos	1 taco. Contains slow roasted Pork marinated in citrus and achiote and Spanish Brown Rice with Spanish Pinto Beans. Topped with Fajita Vegetables, Chipotle Ranch, Jalapenos, and Cheddar Cheese
      19	Beef Picadillo Taco	3.09	Chilaca	Tacos	1 taco. Contains ground beef simmered in a tomato-based sauce with Cilantro Lime Rice and Cuban Black Beans. Topped with Sour Cream, Fajita vegetables, Chipotle Ranch, and Cheddar Cheese
      20	Placeholder	0	Chilaca	Add Ons	
      21	Guacamole	2	Chilaca	Add Ons	
      22	Queso	2	Chilaca	Add Ons	
      23	Placeholder	0	Chilaca	Extras	
      24	Cilantro Lime Chicken	3	Chilaca	Extras	
      25	Pork Conchinita Pibil	3	Chilaca	Extras	
      26	Beef Picadillo	3	Chilaca	Extras	
      27	Cheddar Cheese	2	Chilaca	Extras	
      28	Jalapenos	2	Chilaca	Extras	
      29	Chipotle Ranch	2	Chilaca	Extras	
      30	Pico De Gallo	2	Chilaca	Extras	
      31	Salsa Verde	2	Chilaca	Extras	
      32	Sour Cream	2	Chilaca	Extras	
      33	Placeholder	0	Citizen Chicken	Chicken Sandwiches	
      34	Halal Chicken Sandwich & Fries	9.39	Citizen Chicken	Chicken Sandwiches	Crispy fired halal chicken stacked on a soft bun with lettuce, tomato, and a tangy house sauce. Paired with hot, crispy fries.
      35	Plant-Based Chicken Sandwich & Fries	9.39	Citizen Chicken	Chicken Sandwiches	Crispy grilled plant-based chicken stacked on a soft bun with lettuce, tomato, and a tangy house sauce. Served with fries.
      36	Nashville Halal Hot Chicken Sandwich & Fries	9.99	Citizen Chicken	Chicken Sandwiches	Spicy Nashville-style halal chicken on a toasted bun with pickles and our house sauce. Served with crispy fries.
      37	Placeholder	0	Citizen Chicken	Burgers	
      38	Halal Beef Hamburger & Fries	11.49	Citizen Chicken	Burgers	Juicy halal beef burger stacked with fresh lettuce, tomato, and a creamy sauce on a warm bun. Comes with golden fries.
      39	Veggie Burger & Fries	11.49	Citizen Chicken	Burgers	A seasoned veggie patty on a toasted bun with lettuce, tomato, and our house sauce. Served with crispy fries.
      40	Placeholder	0	Citizen Chicken	Tenders	
      41	3 Piece Halal Tenders with Fries	8.39	Citizen Chicken	Tenders	Three crispy halal chicken tenders served with a side of hot, seasoned fries.
      42	5 Piece Halal Tenders with Fries	10.49	Citizen Chicken	Tenders	Five crispy halal chicken tenders served with a side of hot, seasoned fries.
      43	Placeholder	0	Citizen Chicken	Sides	
      44	Fries	2.89	Citizen Chicken	Sides	
      45	Fried Pickles	4.19	Citizen Chicken	Sides	
      46	Placeholder	0	Citizen Chicken	Extras	
      47	Cheese	1.55	Citizen Chicken	Extras	Add cheese to any sandwich or burger
      48	Placeholder	0	Da Brix	6" Italian Subs	
      49	Chicken Parmesan	7.99	Da Brix	6" Italian Subs	A 6" sub filled with breaded chicken, marinara sauce, and melted mozzarella, toasted to perfection
      50	Meatball Parmesan	7.99	Da Brix	6" Italian Subs	A 6" Italian sub packed with seasoned meatballs, marinara sauce, and melted mozzarella, toasted to perfection
      51	Sausage & Peppers	7.99	Da Brix	6" Italian Subs	A 6" sub loaded with spicy Italian sausage cooked with peppers and onions, served on a warm, toasted roll
      52	Placeholder	0	Da Brix	Pizza By The Slice	
      53	Cheese Slice	2.89	Da Brix	Pizza By The Slice	A classic slice topped with melted mozzarella and rich tomato sauce
      54	Pepperoni Slice	3.09	Da Brix	Pizza By The Slice	A crisp NY-style slice with tomato sauce, mozzarella, and sizzling pepperoni on top
      55	Veggie Slice	3.65	Da Brix	Pizza By The Slice	A veggie slice topped with mozzarella, tomato sauce, peppers, onions, mushrooms, and olives
      56	Buffalo Chicken Slice	4.09	Da Brix	Pizza By The Slice	A slice topped with buffalo-style chicken, mozzarella, and a drizzle of ranch
      57	Margarita Slice	3.39	Da Brix	Pizza By The Slice	A classic Margherita slice with rich tomato sauce, melted mozzarella, and fresh basil leaves.
      58	Sausage Slice	3.49	Da Brix	Pizza By The Slice	A warm slice layered with tomato sauce, melted mozzarella, and seasoned Italian sausage
      59	Placeholder	0	Da Brix	Pastas	
      60	Mac & Cheese	5.29	Da Brix	Pastas	Macaroni coated in a smooth, cheesy sauce for a comforting, homemade taste
      61	Chicken Alfredo	10.49	Da Brix	Pastas	Pasta tossed in creamy Alfredo sauce and topped with tender grilled chicken
      62	Spaghetti & Meatballs	11.49	Da Brix	Pastas	Classic spaghetti tossed in marinara and topped with tender, seasoned meatballs
      63	Penne Alla Vodka	9.39	Da Brix	Pastas	Al dente penne coated in a rich, creamy tomato vodka sauce". 
    VIP customers get a 5% discount on their orders and they get 1 free delivery for every 3 orders (a customer can get VIP status after spending over $100 or completing 3 successful orders without complaints). 
    Answer to the best of your ability, using common sense to deduce restaurant specific or general questions. Ensure your answers are concise and correct, no need to explain logic unless specifically asked for by a customer, ie. if a customer asks for the average dish price no need to explain the computation unless they specifically ask for a breakdown, computation, etc. If dietary questions are asked (ie. is a specific dish kosher or glueten free and it is not specified above, respond back telling the user to reach out to support.)
    The user asked: "${userMessage}"`;
    
    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: LLM_MODEL,
      contents: prompt,
    });
    
    const llmAnswer = response.text.trim();

    // Return LLM response
    return {
      answer: llmAnswer,
      source: "LLM",
      kb_id: null // LLM answers do not have a KB ID
    };
  } catch (llmError) {
    console.error("Gemini LLM call failed:", llmError);

    // Fallback message if LLM is unavailable
    return {
      answer: "I'm sorry, I am currently unable to find an answer. Please contact support or try again later.",
      source: "ERROR",
      kb_id: null
    };
  }
}
