import React from 'react';
import Store from './content/store.js';
import DealFormLite from './content/DealFormLite.jsx';


export default function (bus, id) {
  const store = new Store({ bus, id });
  const component = React.createElement(DealFormLite, { store });

  return { component, api: store.api };
}
