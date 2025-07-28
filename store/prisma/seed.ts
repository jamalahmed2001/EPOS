import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order to respect foreign key constraints
  console.log("Clearing existing data...");
  
  // Delete dependent records first
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.review.deleteMany();
  await prisma.storeInventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.address.deleteMany();
  
  // Clear manager references from stores before deleting users
  await prisma.store.updateMany({
    data: { managerId: null }
  });
  
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  console.log("Existing data cleared.");

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
        name: "Ministry of Vapes - Deepdale Preston",
        slug: "deepdale-preston",
        address: "19 Harewood Rd",
        city: "Preston",
        postalCode: "PR1 6XH",
        country: "GB",
        phone: "01772 446 376",
        email: "deepdale@ministryofvapes.co.uk",
        latitude: 53.7632,
        longitude: -2.7031,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Friargate Preston",
        slug: "friargate-preston",
        address: "178 Friargate",
        city: "Preston",
        postalCode: "PR1 2EJ",
        country: "GB",
        phone: "01772 914 748",
        email: "friargate@ministryofvapes.co.uk",
        latitude: 53.7588,
        longitude: -2.7089,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Leyland",
        slug: "leyland",
        address: "Leyland Shopping Centre",
        city: "Leyland",
        postalCode: "PR25 1QX",
        country: "GB",
        phone: "01772 621 654",
        email: "leyland@ministryofvapes.co.uk",
        latitude: 53.6918,
        longitude: -2.6859,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Darwen",
        slug: "darwen",
        address: "Darwen Town Centre",
        city: "Darwen",
        postalCode: "BB3 1AS",
        country: "GB",
        phone: "01254 846 733",
        email: "darwen@ministryofvapes.co.uk",
        latitude: 53.6978,
        longitude: -2.4622,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Lancaster",
        slug: "lancaster",
        address: "Lancaster City Centre",
        city: "Lancaster",
        postalCode: "LA1 1HT",
        country: "GB",
        phone: "07793 976 548",
        email: "lancaster@ministryofvapes.co.uk",
        latitude: 54.0465,
        longitude: -2.8007,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
        },
      },
    }),
    prisma.store.create({
      data: {
        name: "Ministry of Vapes - Burnley",
        slug: "burnley",
        address: "Burnley Town Centre",
        city: "Burnley",
        postalCode: "BB11 1LD",
        country: "GB",
        phone: "07949 328 153",
        email: "burnley@ministryofvapes.co.uk",
        latitude: 53.7895,
        longitude: -2.2482,
        status: "ACTIVE",
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: { open: "11:00", close: "16:00" },
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
      workingStoreId: stores[0]!.id, // Deepdale Preston store
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
      workingStoreId: stores[0]!.id, // Deepdale Preston store
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

  // Create Ministry of Vapes e-liquid flavours in 10mg and 20mg
  const flavours = [
    "Vimto",
    "Blueberry Cherry Cranberry",
    "Jelly Bear",
    "Blueberry Sour Raspberry",
    "Mr Blue",
    "Strawberry Raspberry Cherry Ice",
    "Lemon Lime",
    "Skittles",
    "Fizzy Cherry",
    "Fresh Mint",
    "Peach Mango Guava",
    "Blueberry Cotton Candy",
    "Blueberry Pomegranate",
    "Strawberry Kiwi",
    "Blue Razz Lemonade",
    "Strawberry Watermelon Bubblegum",
    "Triple Mango",
    "Pink Lemonade",
    "Cola Ice",
    "Watermelon Ice",
    "Red Apple Ice",
    "Blueberry Peach Orange",
    "Pineapple Ice",
    "Blueberry Ice",
    "Grape",
    "Sour Apple",
    "Blackcurrant Menthol",
    "Triple Melon",
    "Apple Pear Kiwi",
    "Aloe Grape",
    "Banana Ice",
    "Strawberry Grapefruit Lime",
    "Cherry Cola",
    "Grapefruit Orange Lemon",
    "Kiwi Passionfruit Guava",
    "Strawberry Ice Cream",
    "Sweet Ice Menthol",
  ];

  const nicotineStrengths = [10, 20];
  
  const createSlug = (name: string, mg: number) => {
    return `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${mg}mg`;
  };

  const createSku = (name: string, mg: number, index: number) => {
    const prefix = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 3);
    return `MOV-${prefix}-${mg}MG-${String(index).padStart(3, '0')}`;
  };

  const generateBarcode = (index: number) => {
    return `7777777${String(index).padStart(6, '0')}`;
  };

  const eLiquidProducts = [];
  let productIndex = 1;

  for (const flavour of flavours) {
    for (const mg of nicotineStrengths) {
      const productName = `Ministry of Vapes ${flavour} ${mg}mg`;
      const slug = createSlug(flavour, mg);
      const sku = createSku(flavour, mg, productIndex);
      const barcode = generateBarcode(productIndex);
      
      eLiquidProducts.push(
        prisma.product.create({
          data: {
            name: productName,
            slug: slug,
            description: `Premium ${flavour} flavored e-liquid with ${mg}mg nicotine strength. Crafted with high-quality ingredients for a smooth and satisfying vaping experience. Ministry of Vapes signature blend.`,
            shortDescription: `${flavour} flavor - ${mg}mg nicotine`,
            sku: sku,
            barcode: barcode,
            price: 14.99,
            compareAtPrice: 19.99,
            stock: Math.floor(Math.random() * 80) + 20, // Random stock between 20-100
            categoryId: categories[0]!.id, // E-Liquids category
            featured: productIndex <= 10, // First 10 products are featured
            isSubscribable: true,
            subscriptionPrice: 12.99,
            metaTitle: `${productName} - Premium Vape Juice`,
            metaDescription: `Experience the exceptional ${flavour} flavor in ${mg}mg nicotine strength. Premium quality e-liquid from Ministry of Vapes.`,
            images: {
              create: [
                {
                  url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500",
                  alt: productName,
                  position: 0,
                },
              ],
            },
          },
        })
      );
      productIndex++;
    }
  }

  // Create some additional non-e-liquid products
  const additionalProducts = [
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
  ];

  // Create all products
  const products = await Promise.all([...eLiquidProducts, ...additionalProducts]);

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
  console.log(`${stores.length} Lancashire stores created with inventory:`);
  console.log("- Deepdale Preston, Friargate Preston, Leyland, Darwen, Lancaster, Burnley");
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