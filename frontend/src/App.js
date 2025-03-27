import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '', base_sku: '', base_price: '', manufacturer: '', vendor: '', copy: '', pictures: '', short_description: ''
  });
  const [newGroup, setNewGroup] = useState('');
  const [newAttribute, setNewAttribute] = useState({ groupId: '', attribute_code: '', attribute_name: '', attribute_price: '' });

  useEffect(() => {
    axios.get('https://product-api-1021908335606.us-central1.run.app/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleExpand = (sku) => {
    if (expanded === sku) {
      setExpanded(null);
    } else {
      axios.get(`https://product-api-1021908335606.us-central1.run.app/products/${sku}`)
        .then(res => {
          setProductDetails({ ...productDetails, [sku]: res.data });
          setExpanded(sku);
        })
        .catch(err => console.error(err));
    }
  };

  const handleChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  const handleAddProduct = () => {
    axios.post('https://product-api-1021908335606.us-central1.run.app/products', newProduct)
      .then(() => window.location.reload())
      .catch(err => alert(err.response?.data?.error || 'Error adding product'));
  };
  const handleDelete = (sku) => {
    if (window.confirm('Delete this product?')) {
      axios.delete(`https://product-api-1021908335606.us-central1.run.app/products/${sku}`)
        .then(() => window.location.reload())
        .catch(err => alert(err.response?.data?.error || 'Error deleting product'));
    }
  };
  const handleAddOptionGroup = (productId) => {
    if (!newGroup.trim()) return;
    axios.post('https://product-api-1021908335606.us-central1.run.app/option-groups', {
      product_id: productId,
      option_group_name: newGroup
    }).then(() => window.location.reload());
  };
  const handleUpdateGroupName = (id, name) => {
    axios.put(`https://product-api-1021908335606.us-central1.run.app/option-groups/${id}`, {
      option_group_name: name
    }).then(() => window.location.reload());
  };
  const handleDeleteGroup = (id) => {
    if (window.confirm('Delete this option group?')) {
      axios.delete(`https://product-api-1021908335606.us-central1.run.app/option-groups/${id}`)
        .then(() => window.location.reload());
    }
  };
  const handleUpdateAttribute = (id, attr) => {
    axios.put(`https://product-api-1021908335606.us-central1.run.app/attributes/${id}`, attr)
      .then(() => window.location.reload());
  };
  const handleDeleteAttribute = (id) => {
    if (window.confirm('Delete this attribute?')) {
      axios.delete(`https://product-api-1021908335606.us-central1.run.app/attributes/${id}`)
        .then(() => window.location.reload());
    }
  };
  const handleAddAttribute = () => {
    const { groupId, attribute_code, attribute_name, attribute_price } = newAttribute;
    axios.post('https://product-api-1021908335606.us-central1.run.app/attributes', {
      option_group_id: groupId,
      attribute_code,
      attribute_name,
      attribute_price
    }).then(() => window.location.reload());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Admin Dashboard</h1>
      <button onClick={() => setShowForm(!showForm)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
        {showForm ? 'Cancel' : '+ Add Product'}
      </button>

      {showForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">New Product</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(newProduct).map(key => (
              <input key={key} name={key} placeholder={key.replace('_', ' ')} value={newProduct[key]} onChange={handleChange} className="border p-2 rounded" />
            ))}
          </div>
          <button onClick={handleAddProduct} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">Save Product</button>
        </div>
      )}

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">SKU</th>
            <th className="text-left p-2 border">Price</th>
            <th className="text-left p-2 border">Manufacturer</th>
            <th className="text-left p-2 border">Vendor</th>
            <th className="text-left p-2 border">Actions</th>
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
                <td className="p-2 space-x-2">
                  <button onClick={() => toggleExpand(product.base_sku)} className="text-blue-600 hover:underline">
                    {expanded === product.base_sku ? 'Hide Options' : 'View Options'}
                  </button>
                  <button onClick={() => handleDelete(product.base_sku)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
              {expanded === product.base_sku && (
                <tr>
                  <td colSpan="6" className="p-4 bg-gray-50">
                    <h3 className="font-semibold">Option Groups & Attributes</h3>
                    <div className="flex space-x-2 my-2">
                      <input type="text" className="border p-1" placeholder="New Option Group" onChange={e => setNewGroup(e.target.value)} />
                      <button onClick={() => handleAddOptionGroup(productDetails[product.base_sku]?.product_id)} className="bg-blue-600 text-white px-2 rounded">Add Group</button>
                    </div>

                    {productDetails[product.base_sku]?.option_groups?.map(group => (
                      <div key={group.option_group_id} className="mb-4">
                        <div className="flex items-center space-x-2">
                          <input defaultValue={group.option_group_name} onBlur={e => handleUpdateGroupName(group.option_group_id, e.target.value)} className="border px-2 py-1 rounded" />
                          <button onClick={() => handleDeleteGroup(group.option_group_id)} className="text-red-600 hover:underline">Delete Group</button>
                        </div>
                        <ul className="list-disc pl-6">
                          {group.attributes?.map(attr => (
                            <li key={attr.attribute_id}>
                              <input defaultValue={attr.attribute_code} onBlur={e => handleUpdateAttribute(attr.attribute_id, { ...attr, attribute_code: e.target.value })} className="border px-1 mx-1 w-16" />
                              <input defaultValue={attr.attribute_name} onBlur={e => handleUpdateAttribute(attr.attribute_id, { ...attr, attribute_name: e.target.value })} className="border px-1 mx-1" />
                              <input defaultValue={attr.attribute_price} onBlur={e => handleUpdateAttribute(attr.attribute_id, { ...attr, attribute_price: e.target.value })} className="border px-1 mx-1 w-20" />
                              <button onClick={() => handleDeleteAttribute(attr.attribute_id)} className="text-red-600 hover:underline ml-2">x</button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex space-x-2 mt-2">
                          <input placeholder="Code" className="border p-1" onChange={e => setNewAttribute({ ...newAttribute, attribute_code: e.target.value, groupId: group.option_group_id })} />
                          <input placeholder="Name" className="border p-1" onChange={e => setNewAttribute({ ...newAttribute, attribute_name: e.target.value })} />
                          <input placeholder="Price" className="border p-1" onChange={e => setNewAttribute({ ...newAttribute, attribute_price: e.target.value })} />
                          <button onClick={handleAddAttribute} className="bg-green-600 text-white px-2 rounded">Add Attribute</button>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

