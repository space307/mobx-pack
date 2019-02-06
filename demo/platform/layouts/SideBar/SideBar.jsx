import React from 'react';
import Loadable from 'react-loadable';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import paperStyle from 'demo/platform/style/paperBlock.json';

import DealFormLiteFabric, { ApiMD as DealFormLiteApiMD, busMD as DealFormLiteBusMD} from 'demo/packages/DealFormLite/index.js';
import inApi from 'demo/platform/api/in.js';
import apiMD from 'demo/platform/middleware/ApiMD.js';



/*
const { component: DealFormLite, api } = DealFormLiteFabric(new DealFormLiteApiMD(inApi));
apiMD.apply({ DealFormLite: api });
*/


/**/
import bus from 'demo/packages/bus/bus.js';
import BusMD from 'demo/platform/middleware/BusMD.js';
const { component: DealFormLite } = DealFormLiteFabric(new DealFormLiteBusMD(bus));



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

        {DealFormLite}
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
