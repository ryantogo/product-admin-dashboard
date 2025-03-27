const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/products', async (req, res) => {
  try {
    console.log("🔄 [GET] /products");
    const [products] = await db.query('SELECT * FROM Products');
    console.log(`✅ Found ${products.length} product(s)`);
    res.json(products);
  } catch (err) {
    console.error("❌ Error in /products:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:sku', async (req, res) => {
  try {
    console.log(`🔄 [GET] /products/${req.params.sku}`);
    const [product] = await db.query('SELECT * FROM Products WHERE base_sku = ?', [req.params.sku]);
    if (!product.length) {
      console.warn("⚠️ Product not found:", req.params.sku);
      return res.status(404).json({ error: 'Product not found' });
    }

    const productId = product[0].product_id;
    const [groups] = await db.query('SELECT * FROM OptionGroups WHERE product_id = ?', [productId]);

    for (const group of groups) {
      const [attrs] = await db.query('SELECT * FROM Attributes WHERE option_group_id = ?', [group.option_group_id]);
      group.attributes = attrs;
    }

    res.json({ ...product[0], option_groups: groups });
  } catch (err) {
    console.error("❌ Error in /products/:sku:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
