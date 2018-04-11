import React from 'react';
import PropTypes from 'prop-types';

class BaseComponent extends React.Component {
    static contextTypes = {
      store: PropTypes.object,
    };

    render() {
      return null;
    }
}

export default BaseComponent;

