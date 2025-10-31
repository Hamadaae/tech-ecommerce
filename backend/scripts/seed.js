import 'dotenv/config';
import axios from 'axios';
import connectDB from '../src/config/db.js';
import Product from '../src/models/Product.js';
const categories = [
  { name: "laptops", url: "https://dummyjson.com/products/category/laptops" },
  {
    name: "mobile-accessories",
    url: "https://dummyjson.com/products/category/mobile-accessories",
  },
  {
    name: "smartphones",
    url: "https://dummyjson.com/products/category/smartphones",
  },
  { name: "tablets", url: "https://dummyjson.com/products/category/tablets" },
];

async function fetchCategory(url) {
  const res = await axios.get(url);
  return res.data && res.data.products ? res.data.products : [];
}

function normalizeProduct(product, fallBackCategory) {
  const reviews = (product.reviews || []).map((review) => ({
    rating: review.rating,
    comment: review.comment,
    date: review.date ? new Date(review.date) : null,
    reviewerName: review.reviewerName,
    reviewerEmail: review.reviewerEmail,
  }));

  const meta = product.meta || {};
  if (meta.createdAt) meta.createdAt = new Date(meta.createdAt);
  if (meta.updatedAt) meta.updatedAt = new Date(meta.updatedAt);

  return {
    externalId: product.id,
    title: product.title,
    description: product.description,
    category: product.category || fallBackCategory || "",
    price:
      typeof product.price === "number"
        ? product.price
        : Number(product.price || 0),
    category: product.category || fallBackCategory || '',
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    tags: product.tags || [],
    brand: product.brand,
    sku: product.sku,
    weight: product.weight,
    dimensions: product.dimensions || {},
    warrentyInformation: product.warrentyInformation,
    shippingInformation: product.shippingInformation,
    availabilityStatus: product.availabilityStatus,
    reviews,
    returnPolicy: product.returnPolicy,
    minimumOrderQuantity: product.minimumOrderQuantity || 1,
    meta,
    images: product.images || [],
    thumbnail: product.thumbnail || "",
  };
}

async function upsertProducts(products, fallbackCategory) {
  if (!products || products.length === 0) return { matched: 0, upserted: 0 };

  const ops = products.map((p) => {
    const doc = normalizeProduct(p, fallbackCategory);
    return {
      updateOne: {
        filter: { externalId: doc.externalId },
        update: { $set: doc },
        upsert: true,
      },
    };
  });

  return await Product.bulkWrite(ops);
}

(async function seed() {
  try {
    await connectDB();
    console.log("✅ Connected to DB -- starting seeding");

    let totalInserted = 0;
    for (const category of categories) {
      console.log(`📦 Fetching category: ${category.name}`);
      try {
        const items = await fetchCategory(category.url);
        items.forEach((item) => {
          if (!item.category) item.category = category.name;
        });

        const result = await upsertProducts(items, category.name);
        const upserted = result.upsertedCount || result.nUpserted || 0;
        const modified = result.modifiedCount || result.nModified || 0;

        console.log(
          `✅ Category '${category.name}': fetched=${items.length}, upserted=${upserted}, modified=${modified}`
        );
        totalInserted += items.length;

        await new Promise((r) =>
          setTimeout(r, Number(process.env.API_SEED_TIMEOUT_MS || 200))
        );
      } catch (error) {
        console.log(
          `❌ Failed to fetch category ${category.name}`,
          error.message
        );
      }
    }

    const count = await Product.countDocuments();
    console.log(`🎯 Seeding finished. Total products in DB: ${count}`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
