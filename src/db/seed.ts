import { users, restaurants, orders, orderItems, products, authLinks } from "./schema";
import { faker } from "@faker-js/faker";
import { db } from "./connections";
import chalk from "chalk";
import { createId } from "@paralleldrive/cuid2";

/**
 * Reset the database
 */
await db.delete(users).execute();
await db.delete(restaurants).execute();
await db.delete(orders).execute();
await db.delete(orderItems).execute();
await db.delete(products).execute();
await db.delete(authLinks).execute();

console.log(chalk.yellow("✓ Database reset successfully"));

/**
 * Create customers
 */

const [customer1, customer2] = await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: "customer"

  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: "customer"
  },
]).returning();

console.log(chalk.yellow("✓ Customers created successfully"));

/**
 * Create managers
 */

const [manager] = await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: "admin@pizzashop.com",
    phone: faker.phone.number(),
    role: "manager"
  },
]).returning({ id: users.id });

console.log(chalk.yellow("✓ Managers created successfully"));

/**
 * Create restaurants
 */

const [restaurant] = await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
]).returning();


console.log(chalk.yellow("✓ Restaurants created successfully"));


/**
 * Generate products
 */

function generateProduct() {
  return {
    name: faker.commerce.productName(),
    restaurantId: restaurant.id,
    description: faker.commerce.productDescription(),
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
  }
}

/**
 * Create products
 */

const availableProducts = await db.insert(products).values([
  generateProduct(),
  generateProduct(),
  generateProduct(),
  generateProduct(),
  generateProduct(),
  generateProduct(),
  generateProduct(),
]).returning();

console.log(chalk.yellow("✓ Products created successfully"));


/**
 * Create orders
 */

type OrderItemsInsert = typeof orderItems.$inferInsert;
type OrdersInsert = typeof orders.$inferInsert;

const ordersItemsToInsert: OrderItemsInsert[] = [];
const ordersToInsert: OrdersInsert[] = [];


for (let i = 0; i < 200; i++) {
  const orderId = createId();
  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3
  });

  let totalInCents = 0;

  orderProducts.forEach(orderProduct => {
    const quantity = faker.number.int({ min: 1, max: 3 });
    const priceInCents = orderProduct.priceInCents * quantity;
    totalInCents += priceInCents;

    ordersItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      quantity,
      priceInCents: orderProduct.priceInCents
    });
  });

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      "pending", 
      "processing", 
      "delivering",
      "delivered",
      "cancelled"
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  });
}

await db.insert(orders).values(ordersToInsert);
await db.insert(orderItems).values(ordersItemsToInsert);

console.log(chalk.yellow("✓ Orders created successfully"));

console.log(chalk.greenBright("✓ Database seeded successfully"));


process.exit();