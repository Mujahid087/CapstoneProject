require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Category = require("../models/CategoryModel");
const MenuItem = require("../models/MenuItem");

const categoriesData = [
  { categoryName: "Pizza" },
  { categoryName: "Sides" },
  { categoryName: "Beverages" },
  { categoryName: "Combos" },
  { categoryName: "New Launches" },
  { categoryName: "Bestsellers" },
];

const menuItemsData = {
  Pizza: [
    {
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella, tomato sauce, and basil leaves",
      price: 199,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
      isAvailable: true,
    },
    {
      name: "Farmhouse Pizza",
      description: "Loaded with capsicum, onions, tomatoes, and mushrooms on a cheese base",
      price: 299,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
      isAvailable: true,
    },
    {
      name: "Veggie Supreme",
      description: "A supreme blend of golden corn, black olives, capsicum, and red paprika",
      price: 349,
      image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400",
      isAvailable: true,
    },
    {
      name: "Pepperoni Pizza",
      description: "Generous portions of spicy pepperoni with mozzarella cheese",
      price: 379,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
      isAvailable: true,
    },
    {
      name: "BBQ Chicken Pizza",
      description: "Grilled chicken, BBQ sauce, onions, and a blend of cheeses",
      price: 399,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      isAvailable: true,
    },
  ],
  Sides: [
    {
      name: "Garlic Bread",
      description: "Freshly baked bread topped with garlic butter and herbs",
      price: 99,
      image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400",
      isAvailable: true,
    },
    {
      name: "Cheese Garlic Bread",
      description: "Garlic bread loaded with melted mozzarella and cheddar cheese",
      price: 149,
      image: "https://images.unsplash.com/photo-1573140401552-3c9337c57e63?w=400",
      isAvailable: true,
    },
    {
      name: "Stuffed Garlic Bread",
      description: "Garlic bread stuffed with corn, capsicum, and cheese filling",
      price: 179,
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400",
      isAvailable: true,
    },
    {
      name: "Chicken Wings",
      description: "Crispy fried chicken wings tossed in spicy peri-peri sauce",
      price: 199,
      image: "https://images.unsplash.com/photo-1608039829572-9b0189da3900?w=400",
      isAvailable: true,
    },
  ],
  Beverages: [
    {
      name: "Coca Cola",
      description: "Chilled 300ml Coca Cola to complement your pizza",
      price: 60,
      image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
      isAvailable: true,
    },
    {
      name: "Pepsi",
      description: "Refreshing 300ml Pepsi served chilled",
      price: 60,
      image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
      isAvailable: true,
    },
    {
      name: "Sprite",
      description: "300ml lemon-lime Sprite for a refreshing burst",
      price: 60,
      image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400",
      isAvailable: true,
    },
    {
      name: "Mojito",
      description: "Fresh mint and lime mocktail with a fizzy twist",
      price: 99,
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400",
      isAvailable: true,
    },
  ],
  Combos: [
    {
      name: "Pizza Combo Meal",
      description: "1 Medium Pizza + Garlic Bread + 1 Beverage at a special price",
      price: 349,
      image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400",
      isAvailable: true,
    },
    {
      name: "Family Combo",
      description: "2 Large Pizzas + 2 Sides + 4 Beverages perfect for family gatherings",
      price: 899,
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400",
      isAvailable: true,
    },
    {
      name: "Duo Combo",
      description: "2 Medium Pizzas + 2 Beverages ideal for a date night",
      price: 549,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
      isAvailable: true,
    },
  ],
  "New Launches": [
    {
      name: "Truffle Mushroom Pizza",
      description: "Premium truffle oil drizzled over sauteed mushrooms and mozzarella",
      price: 449,
      image: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400",
      isAvailable: true,
    },
    {
      name: "Peri Peri Paneer Pizza",
      description: "Spicy peri-peri seasoned paneer with jalapenos and onion rings",
      price: 389,
      image: "https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=400",
      isAvailable: true,
    },
  ],
  Bestsellers: [
    {
      name: "Classic Pepperoni",
      description: "Our all-time bestseller with double pepperoni and extra cheese",
      price: 399,
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400",
      isAvailable: true,
    },
    {
      name: "Cheese Burst Pizza",
      description: "Pizza loaded with a burst of liquid cheese in every bite",
      price: 429,
      image: "https://images.unsplash.com/photo-1571066811602-716837d681de?w=400",
      isAvailable: true,
    },
    {
      name: "Tandoori Chicken Pizza",
      description: "Smoky tandoori chicken chunks with mint mayo and onions",
      price: 419,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      isAvailable: true,
    },
  ],
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log(`Found ${existingCategories} existing categories. Skipping seed to prevent duplicates.`);
      console.log("To re-seed, delete existing categories and menu items first.");
      await mongoose.disconnect();
      return;
    }

    console.log("Inserting categories...");
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${createdCategories.length} categories`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.categoryName] = cat._id;
    });

    const allMenuItems = [];
    for (const [categoryName, items] of Object.entries(menuItemsData)) {
      items.forEach((item) => {
        allMenuItems.push({
          ...item,
          categoryId: categoryMap[categoryName],
        });
      });
    }

    console.log("Inserting menu items...");
    const createdItems = await MenuItem.insertMany(allMenuItems);
    console.log(`Inserted ${createdItems.length} menu items`);

    console.log("\nSeed completed successfully!");
    console.log("Categories:", createdCategories.map((c) => c.categoryName).join(", "));
    console.log("Total menu items:", createdItems.length);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
