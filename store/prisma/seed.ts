import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "E-Liquids",
        slug: "e-liquids",
        description: "Premium vaping liquids in various flavors",
      },
    }),
    prisma.category.create({
      data: {
        name: "Devices",
        slug: "devices",
        description: "Vape devices and mods",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Coils, batteries, and other accessories",
      },
    }),
  ]);

  // Create stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Central London",
        slug: "central-london",
        address: "123 Oxford Street",
        city: "London",
        postalCode: "W1D 1LL",
        country: "GB",
        phone: "+44 20 7123 4567",
        email: "central@ministryofvapes.co.uk",
        latitude: 51.5155,
        longitude: -0.1413,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "21:00" },
          tuesday: { open: "09:00", close: "21:00" },
          wednesday: { open: "09:00", close: "21:00" },
          thursday: { open: "09:00", close: "21:00" },
          friday: { open: "09:00", close: "22:00" },
          saturday: { open: "10:00", close: "22:00" },
          sunday: { open: "11:00", close: "20:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Camden",
        slug: "camden",
        address: "45 Camden High Street",
        city: "London",
        postalCode: "NW1 7JH",
        country: "GB",
        phone: "+44 20 7485 2345",
        email: "camden@ministryofvapes.co.uk",
        latitude: 51.5391,
        longitude: -0.1426,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "10:00", close: "20:00" },
          tuesday: { open: "10:00", close: "20:00" },
          wednesday: { open: "10:00", close: "20:00" },
          thursday: { open: "10:00", close: "20:00" },
          friday: { open: "10:00", close: "21:00" },
          saturday: { open: "10:00", close: "21:00" },
          sunday: { open: "11:00", close: "19:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Shoreditch",
        slug: "shoreditch",
        address: "78 Brick Lane",
        city: "London",
        postalCode: "E1 6RL",
        country: "GB",
        phone: "+44 20 7247 8901",
        email: "shoreditch@ministryofvapes.co.uk",
        latitude: 51.5224,
        longitude: -0.0724,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "11:00", close: "20:00" },
          tuesday: { open: "11:00", close: "20:00" },
          wednesday: { open: "11:00", close: "20:00" },
          thursday: { open: "11:00", close: "21:00" },
          friday: { open: "11:00", close: "22:00" },
          saturday: { open: "11:00", close: "22:00" },
          sunday: { open: "12:00", close: "19:00" },
        },
      },
    }),
  ]);

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ministryofvapes.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
      referralCode: "ADMIN001",
      loyaltyAccount: {
        create: {
          points: 0,
          lifetimePoints: 0,
          completedOrders: 0,
        },
      },
    },
  });

  // Create manager user with store assignment
  const managerPassword = await hash("manager123", 10);
  const managerUser = await prisma.user.create({
    data: {
      email: "manager@ministryofvapes.com",
      password: managerPassword,
      name: "Sarah Johnson",
      role: "MANAGER",
      emailVerified: new Date(),
      workingStoreId: stores[0]!.id, // Central London store
      referralCode: "MANAGER001",
      loyaltyAccount: {
        create: {
          points: 0,
          lifetimePoints: 0,
          completedOrders: 0,
        },
      },
    },
  });

  // Update store to set manager
  await prisma.store.update({
    where: { id: stores[0]!.id },
    data: { managerId: managerUser.id },
  });

  // Create staff user with store assignment
  const staffPassword = await hash("staff123", 10);
  const staffUser = await prisma.user.create({
    data: {
      email: "staff@ministryofvapes.com",
      password: staffPassword,
      name: "John Smith",
      role: "STAFF",
      emailVerified: new Date(),
      workingStoreId: stores[0]!.id, // Central London store
      referralCode: "STAFF001",
      loyaltyAccount: {
        create: {
          points: 0,
          lifetimePoints: 0,
          completedOrders: 0,
        },
      },
    },
  });

  // Create customer user with loyalty account
  const customerPassword = await hash("customer123", 10);
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: customerPassword,
      name: "Jane Doe",
      role: "CUSTOMER",
      emailVerified: new Date(),
      referralCode: "CUST001",
      loyaltyAccount: {
        create: {
          points: 150,
          lifetimePoints: 500,
          completedOrders: 5,
          tier: "SILVER",
        },
      },
    },
  });

  // Create some products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Blue Razz E-Liquid",
        slug: "blue-razz-e-liquid",
        description: "A refreshing blue raspberry flavored e-liquid with a perfect balance of sweet and tart. Made with high-quality ingredients for a smooth vaping experience.",
        shortDescription: "Sweet and tart blue raspberry flavor",
        sku: "EL-BR-001",
        barcode: "1234567890123",
        price: 14.99,
        compareAtPrice: 19.99,
        stock: 100,
        categoryId: categories[0]!.id,
        featured: true,
        isSubscribable: true,
        subscriptionPrice: 12.99,
        metaTitle: "Blue Razz E-Liquid - Premium Vape Juice",
        metaDescription: "Experience the perfect blend of sweet and tart with our Blue Razz e-liquid. Premium quality vape juice available at Ministry of Vapes.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500",
              alt: "Blue Razz E-Liquid",
              position: 0,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Starter Vape Kit",
        slug: "starter-vape-kit",
        description: "Perfect for beginners, this starter kit includes everything you need to begin your vaping journey. Features adjustable wattage, long battery life, and easy-to-use design.",
        shortDescription: "Complete kit for beginners",
        sku: "DV-SK-001",
        barcode: "1234567890124",
        price: 49.99,
        compareAtPrice: 69.99,
        stock: 50,
        categoryId: categories[1]!.id,
        featured: true,
        metaTitle: "Starter Vape Kit - Begin Your Vaping Journey",
        metaDescription: "Get started with vaping using our comprehensive starter kit. Includes device, coils, and accessories.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1597399849368-af2f1e5de27f?w=500",
              alt: "Starter Vape Kit",
              position: 0,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Replacement Coils Pack",
        slug: "replacement-coils-pack",
        description: "High-quality replacement coils compatible with most devices. Pack of 5 coils for extended use.",
        shortDescription: "Pack of 5 replacement coils",
        sku: "AC-RC-001",
        barcode: "1234567890125",
        price: 12.99,
        stock: 200,
        categoryId: categories[2]!.id,
        metaTitle: "Replacement Coils - 5 Pack",
        metaDescription: "Keep your vape performing at its best with our replacement coils. Pack of 5 high-quality coils.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?w=500",
              alt: "Replacement Coils",
              position: 0,
            },
          ],
        },
      },
    }),
  ]);

  // Create store inventory for each product in each store
  for (const store of stores) {
    for (const product of products) {
      await prisma.storeInventory.create({
        data: {
          storeId: store.id,
          productId: product.id,
          stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
        },
      });
    }
  }

  console.log("Seed data created successfully!");
  console.log(`Admin user created with email: admin@ministryofvapes.com and password: admin123`);
  console.log(`Manager user created with email: manager@ministryofvapes.com and password: manager123`);
  console.log(`Staff user created with email: staff@ministryofvapes.com and password: staff123`);
  console.log(`Customer user created with email: customer@example.com and password: customer123`);
  console.log(`${stores.length} stores created with inventory`);
  console.log("All users have been created with loyalty accounts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 