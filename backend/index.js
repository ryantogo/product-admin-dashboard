const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// === GET ALL PRODUCTS ===
app.get('/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM Products');
    res.json(products);
  } catch (err) {
    console.error("❌ Error in /products:", err);
    res.status(500).json({ error: err.message });
  }
});

// === GET PRODUCT WITH ATTRIBUTES ===
app.get('/products/:sku', async (req, res) => {
  try {
    const [product] = await db.query('SELECT * FROM Products WHERE base_sku = ?', [req.params.sku]);
    if (!product.length) return res.status(404).json({ error: 'Product not found' });

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

// === CREATE PRODUCT ===
app.post('/products', async (req, res) => {
  try {
    const { product_name, base_sku, base_price, copy, pictures, manufacturer, vendor, short_description } = req.body;
    const [result] = await db.query(
      'INSERT INTO Products (product_name, base_sku, base_price, copy, pictures, manufacturer, vendor, short_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [product_name, base_sku, base_price, copy, pictures, manufacturer, vendor, short_description]
    );
    res.status(201).json({ product_id: result.insertId });
  } catch (err) {
    console.error("❌ Error in POST /products:", err);
    res.status(500).json({ error: err.message });
  }
});

// === UPDATE PRODUCT ===
app.put('/products/:sku', async (req, res) => {
  try {
    const { product_name, base_price, copy, pictures, manufacturer, vendor, short_description } = req.body;
    await db.query(
      'UPDATE Products SET product_name=?, base_price=?, copy=?, pictures=?, manufacturer=?, vendor=?, short_description=? WHERE base_sku = ?',
      [product_name, base_price, copy, pictures, manufacturer, vendor, short_description, req.params.sku]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error("❌ Error in PUT /products/:sku:", err);
    res.status(500).json({ error: err.message });
  }
});

// === DELETE PRODUCT ===
app.delete('/products/:sku', async (req, res) => {
  try {
    await db.query('DELETE FROM Products WHERE base_sku = ?', [req.params.sku]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error("❌ Error in DELETE /products/:sku:", err);
    res.status(500).json({ error: err.message });
  }
});

// === ATTRIBUTE ROUTES ===
app.post('/attributes', async (req, res) => {
  try {
    const { option_group_id, attribute_code, attribute_name, attribute_price } = req.body;
    const [result] = await db.query(
      'INSERT INTO Attributes (option_group_id, attribute_code, attribute_name, attribute_price) VALUES (?, ?, ?, ?)',
      [option_group_id, attribute_code, attribute_name, attribute_price]
    );
    res.status(201).json({ attribute_id: result.insertId });
  } catch (err) {
    console.error("❌ Error in POST /attributes:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/attributes/:id', async (req, res) => {
  try {
    const { attribute_code, attribute_name, attribute_price } = req.body;
    await db.query(
      'UPDATE Attributes SET attribute_code=?, attribute_name=?, attribute_price=? WHERE attribute_id = ?',
      [attribute_code, attribute_name, attribute_price, req.params.id]
    );
    res.json({ message: 'Attribute updated' });
  } catch (err) {
    console.error("❌ Error in PUT /attributes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/attributes/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Attributes WHERE attribute_id = ?', [req.params.id]);
    res.json({ message: 'Attribute deleted' });
  } catch (err) {
    console.error("❌ Error in DELETE /attributes/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// === START SERVER ===
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
