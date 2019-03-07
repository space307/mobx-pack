
import React from 'react';
import { Observer } from 'mobx-react';
import { StoreContext } from './../ComponentContext.js';
import { Provider } from './../Provider.jsx';


/*
Provider - запускает сервисы в контексте биндера который лежит в BinderContext
1. Запускает сервисы / сторы если они не запущены и кладёт их в StoreContext
2. Опционально отсанавливает сервисы ( только те, что были запущены в нём)
3. Есть хелпер (observer) котрый прокидыввает пропсы
3. Есть stub компонент на момент старта сервисов
*/

const TimeService = {};
const GarageStore = {};


const Loader = () => (
  <div>Loading...</div>
);


const Car = ({ counter, color, test }) => (
  <div>
    {counter}
    {color}
    {test}
  </div>
);


const Garage = props => (
  <div>
    <StoreContext.Cunsumer>{([timeService, garageStore]) => (
      <Observer>{() => (
        <Car
          {...props}
          test={garageStore.test}
          time={timeService.time}
        />
      )}</Observer>
    )
    }</StoreContext.Cunsumer>

  </div>
);


const GarageContainer = Provider(
  Garage,
  {
    helper(timeService, garageStore, { color }) {
      return {
        color,
        counter: garageStore.counter,
      };
    },
    services: props => [TimeService, [GarageStore, [props.bla]]],
    // services: [TimeService, GarageStore],
    stop: true,
    stub: Loader,
  });

const MyApplication = () => (<GarageContainer color="white" />);

export default MyApplication;

