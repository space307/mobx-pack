import React from 'react';
import Loadable from 'react-loadable';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import paperStyle from 'demo/platform/style/paperBlock.json';

const Preloader = () => <div>Loading...</div>;


const LoadableComponent = Loadable({
  loader: () => import('demo/platform/containers/RechargeForm/index.jsx'),
  loading: Preloader,
});


class SideBar extends React.Component {
  static displayName = 'SideBar';

  constructor() {
    super();

    this.state = {
      recharge: false,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ recharge: true });
  }

  render() {
    return (
      <Paper style={paperStyle}>
        {
          this.state.recharge
          ?
            <LoadableComponent />
            :
            <Button
              variant="raised"
              onClick={this.onClick}
            >
              Load recharge form asynchronously
            </Button>

        }
      </Paper>
    );
  }
}


export default SideBar;
