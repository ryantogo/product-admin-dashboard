import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable, useFilters, useSortBy } from 'react-table';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/products')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const columns = React.useMemo(() => [
    { Header: 'Name', accessor: 'product_name' },
    { Header: 'SKU', accessor: 'base_sku' },
    { Header: 'Price', accessor: 'base_price' },
    { Header: 'Manufacturer', accessor: 'manufacturer' },
    { Header: 'Vendor', accessor: 'vendor' },
  ], []);

  const table = useTable({ columns, data }, useFilters, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Admin Dashboard</h1>
      <table {...getTableProps()} className="w-full border">
        <thead>
          {headerGroups.map(group => (
            <tr {...group.getHeaderGroupProps()}>
              {group.headers.map(col => (
                <th {...col.getHeaderProps(col.getSortByToggleProps())} className="p-2 border-b">
                  {col.render('Header')} {col.isSorted ? (col.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-100">
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="p-2 border-b">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
