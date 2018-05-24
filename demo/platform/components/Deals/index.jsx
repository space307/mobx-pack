import React from 'react';
import Paper from 'material-ui/Paper';
import paperStyle from 'demo/platform/style/paperBlock.json';

function Deals({ deals }) {
  return (deals.length
    ? <Paper style={paperStyle}>
        <table>
          <thead>
            <tr>
              <th>asset</th>
              <th>quantity</th>
              <th>type</th>
              <th>time</th>

            </tr>
          </thead>
          <tbody>
            {deals.map(({
               id, asset, quantity, type, time,
              }) => (
                <tr key={id}>
                  <td>{asset}</td>
                  <td>{quantity}</td>
                  <td>{type}</td>
                  <td>{new Date(time).toTimeString().replace(/^(\d+:\d+:\d+).*$/, '$1')}</td>
                </tr>))}
          </tbody>
        </table>
      </Paper>
    : null);
}


export default Deals;

