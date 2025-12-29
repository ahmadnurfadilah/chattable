import "dotenv/config";
import slugify from "slugify";
import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { users, organizations, members, menuCategories, menus } from "./schema";

async function seed() {
  console.log("🌱 Starting seed...");

  const usersData = [
    {
      name: "Ahmad Nurfadilah",
      email: "ahmadnurfadilah22@gmail.com",
    },
  ];

  const restaurantsData = [
    {
      name: "Moonbrew Coffee House",
      description: "Slow mornings, good stories",
      menu: [
        {
          name: "Espresso Bliss",
          short_description: "Rich and bold single-shot espresso brewed to perfection.",
          category: "Coffee",
          price: 3.0,
        },
        {
          name: "Caramel Cloud Latte",
          short_description: "Smooth milk latte topped with creamy caramel foam.",
          category: "Coffee",
          price: 4.5,
        },
        {
          name: "Vanilla Cold Brew",
          short_description: "Slow-steeped cold brew infused with vanilla sweetness.",
          category: "Coffee",
          price: 4.25,
        },
        {
          name: "Hazelnut Mocha",
          short_description: "Espresso with chocolate and hazelnut syrup topped with whipped cream.",
          category: "Coffee",
          price: 4.75,
        },
        {
          name: "Coconut Iced Latte",
          short_description: "Chilled latte with a hint of coconut for a tropical touch.",
          category: "Coffee",
          price: 4.5,
        },
        {
          name: "Matcha Green Tea",
          short_description: "Finely ground matcha whisked with steamed milk.",
          category: "Non Coffee",
          price: 4.0,
        },
        {
          name: "Choco Mint Frappe",
          short_description: "Chocolate frappe blended with mint and topped with cream.",
          category: "Non Coffee",
          price: 4.75,
        },
        {
          name: "Rose Lemonade Sparkler",
          short_description: "Refreshing lemonade with a floral rose twist.",
          category: "Non Coffee",
          price: 3.75,
        },
        {
          name: "Golden Turmeric Latte",
          short_description: "A comforting mix of turmeric, cinnamon, and steamed milk.",
          category: "Non Coffee",
          price: 4.25,
        },
        {
          name: "Berry Bliss Smoothie",
          short_description: "Fresh mix of strawberries, blueberries, and yogurt.",
          category: "Non Coffee",
          price: 4.5,
        },
        {
          name: "Classic Croissant",
          short_description: "Flaky buttery croissant baked fresh daily.",
          category: "Dessert",
          price: 2.75,
        },
        {
          name: "Almond Biscotti",
          short_description: "Crunchy almond biscuits perfect with coffee.",
          category: "Dessert",
          price: 2.5,
        },
        {
          name: "Cheesecake Slice",
          short_description: "Creamy baked cheesecake with a graham crust.",
          category: "Dessert",
          price: 3.95,
        },
        {
          name: "Chocolate Lava Cake",
          short_description: "Rich chocolate cake with a gooey molten center.",
          category: "Dessert",
          price: 4.25,
        },
        {
          name: "Cinnamon Roll",
          short_description: "Soft pastry swirled with cinnamon sugar glaze.",
          category: "Dessert",
          price: 3.25,
        },
        {
          name: "Avocado Toast",
          short_description: "Toasted bread topped with smashed avocado and chili flakes.",
          category: "Snack",
          price: 5.0,
        },
        {
          name: "Smoked Salmon Bagel",
          short_description: "Bagel layered with cream cheese and smoked salmon.",
          category: "Snack",
          price: 6.25,
        },
        {
          name: "Caprese Panini",
          short_description: "Grilled panini with mozzarella, tomato, and basil pesto.",
          category: "Snack",
          price: 6.0,
        },
        {
          name: "Truffle Fries",
          short_description: "Crispy fries tossed with truffle oil and parmesan.",
          category: "Snack",
          price: 4.75,
        },
        {
          name: "Greek Yogurt Parfait",
          short_description: "Layers of Greek yogurt, honey, and granola with fresh fruit.",
          category: "Dessert",
          price: 4.0,
        },
      ],
    },
  ];

  // Seed Users
  console.log("👤 Seeding users...");
  const createdUsers = [];
  for (const userData of usersData) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser) {
      console.log(`   User ${userData.email} already exists, skipping...`);
      createdUsers.push(existingUser);
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          emailVerified: true,
        })
        .returning();
      console.log(`   ✓ Created user: ${newUser.email}`);
      createdUsers.push(newUser);
    }
  }

  // Seed Restaurants (Organizations)
  console.log("📝 Seeding restaurants...");
  const createdRestaurants = [];
  for (const restaurantData of restaurantsData) {
    // Check if restaurant already exists by name
    const existingRestaurants = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, restaurantData.name))
      .limit(1);

    if (existingRestaurants.length > 0) {
      console.log(`   Restaurant ${restaurantData.name} already exists, skipping...`);
      createdRestaurants.push(existingRestaurants[0]);
    } else {
      const slug = slugify(restaurantData.name, { lower: true, strict: true }) + "-" + Math.random().toString(36).substring(2, 8);
      const [newRestaurant] = await db
        .insert(organizations)
        .values({
          name: restaurantData.name,
          slug,
          metadata: JSON.stringify({ description: restaurantData.description }),
          createdAt: new Date(),
        })
        .returning();
      console.log(`   ✓ Created restaurant: ${newRestaurant.name}`);
      createdRestaurants.push(newRestaurant);
    }
  }

  // Seed Members (link users to restaurants)
  console.log("🔗 Linking users to restaurants...");
  for (let i = 0; i < createdUsers.length && i < createdRestaurants.length; i++) {
    const user = createdUsers[i];
    const restaurant = createdRestaurants[i];

    const [existingMember] = await db
      .select()
      .from(members)
      .where(and(eq(members.userId, user.id), eq(members.organizationId, restaurant.id)))
      .limit(1);

    if (!existingMember) {
      await db.insert(members).values({
        userId: user.id,
        organizationId: restaurant.id,
        role: "owner",
        createdAt: new Date(),
      });
      console.log(`   ✓ Linked user ${user.email} to restaurant ${restaurant.name}`);
    } else {
      console.log(`   Member link already exists, skipping...`);
    }
  }

  // Seed Menu Categories and Menus
  console.log("📋 Seeding menu categories and menus...");
  for (const restaurantData of restaurantsData) {
    const restaurant = createdRestaurants.find((r) => r.name === restaurantData.name);
    if (!restaurant) continue;

    // Get unique categories from menu items
    const uniqueCategories = [...new Set(restaurantData.menu.map((item) => item.category))];

    // Create category map to store category IDs
    const categoryMap: Record<string, string> = {};
    let orderColumn = 1;

    // Create menu categories
    for (const categoryName of uniqueCategories) {
      const [existingCategory] = await db
        .select()
        .from(menuCategories)
        .where(and(eq(menuCategories.organizationId, restaurant.id), eq(menuCategories.name, categoryName)))
        .limit(1);

      if (existingCategory) {
        console.log(`   Category ${categoryName} already exists for ${restaurant.name}, skipping...`);
        categoryMap[categoryName] = existingCategory.id;
      } else {
        const [newCategory] = await db
          .insert(menuCategories)
          .values({
            organizationId: restaurant.id,
            name: categoryName,
            orderColumn,
          })
          .returning();
        console.log(`   ✓ Created category: ${categoryName} for ${restaurant.name}`);
        categoryMap[categoryName] = newCategory.id;
        orderColumn++;
      }
    }

    // Create menus
    for (const menuItem of restaurantData.menu) {
      const categoryId = categoryMap[menuItem.category];
      if (!categoryId) {
        console.error(`   ✗ Category ${menuItem.category} not found for menu item ${menuItem.name}`);
        continue;
      }

      const [existingMenu] = await db
        .select()
        .from(menus)
        .where(and(eq(menus.organizationId, restaurant.id), eq(menus.name, menuItem.name)))
        .limit(1);

      if (existingMenu) {
        console.log(`   Menu item ${menuItem.name} already exists, skipping...`);
      } else {
        await db.insert(menus).values({
          organizationId: restaurant.id,
          categoryId,
          name: menuItem.name,
          description: menuItem.short_description,
          price: menuItem.price.toString(),
          isAvailable: true,
        });
        console.log(`   ✓ Created menu item: ${menuItem.name}`);
      }
    }
  }

  console.log("🎉 Seed completed successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
