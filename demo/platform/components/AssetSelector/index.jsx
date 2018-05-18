import React from 'react';
import Button from 'material-ui/Button';

const AssetSelector = ({ assets, selectedAsset, api }) => (
  <div>
    <h3>Select asset:</h3>
    {
      assets.map(({ id }, num) => (
        <Button
          color="secondary"
          variant="raised"
          key={id}
          onClick={() => { api.selectAsset(id); }}
          style={num
            ? {
              marginLeft: 10,
            }
            : null
          }
        >
          {selectedAsset === id
            ? <strong>{id}</strong>
            : id
          }
        </Button>
      ))
    }
  </div>
);


export default AssetSelector;
