import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    // Hardcoded SKU for now to load single product with attributes
    axios.get('https://product-api-1021908335606.us-central1.run.app/products/QSL')
      .then(res => setProducts([res.data]))
      .catch(err => console.error(err));
  }, []);

  const toggleExpand = (sku) => {
    setExpanded(expanded === sku ? null : sku);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Admin Dashboard</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">SKU</th>
            <th className="text-left p-2 border">Price</th>
            <th className="text-left p-2 border">Manufacturer</th>
            <th className="text-left p-2 border">Vendor</th>
            <th className="text-left p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <React.Fragment key={product.base_sku}>
              <tr className="border-b">
                <td className="p-2">{product.product_name}</td>
                <td className="p-2">{product.base_sku}</td>
                <td className="p-2">${product.base_price}</td>
                <td className="p-2">{product.manufacturer}</td>
                <td className="p-2">{product.vendor}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleExpand(product.base_sku)}
                    className="text-blue-600 hover:underline"
                  >
                    {expanded === product.base_sku ? 'Hide Options' : 'View Options'}
                  </button>
                </td>
              </tr>

              {expanded === product.base_sku && product.option_groups?.map(group => (
                <tr key={group.option_group_id} className="bg-gray-50">
                  <td colSpan="6" className="p-2 pl-6">
                    <strong>{group.option_group_name}</strong>
                    <ul className="list-disc pl-6">
                      {group.attributes?.map(attr => (
                        <li key={attr.attribute_id}>
                          {attr.attribute_code} — {attr.attribute_name} (${attr.attribute_price})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
