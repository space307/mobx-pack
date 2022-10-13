import React from 'react';
import { Observer } from 'mobx-react';
import { ServiceContext } from '../ComponentContext';
import { GarageStore, TimeService } from '../Environment';
import { Provider } from '../Provider';

/*
 Provider - запускает сервисы в контексте биндера который лежит в BinderContext
 1. Запускает сервисы / сторы если они не запущены и кладёт их в ServiceContext
 2. Опционально отсанавливает сервисы ( только те, что были запущены в нём)
 3. Есть хелпер (observer) котрый прокидыввает пропсы
 3. Есть stub компонент на момент старта сервисов
 */

function Loader() {
  return <div>Loading...</div>;
}

function Car({ time, color, test }: any) {
  return (
    <div>
      {time}
      {color}
      {test}
    </div>
  );
}

function Garage(props: any) {
  return (
    <div>
      <ServiceContext.Consumer>
        {({ timeService, garageStore }: any) => (
          <Observer>
            {() => <Car {...props} test={garageStore.test} time={timeService.time} />}
          </Observer>
        )}
      </ServiceContext.Consumer>
    </div>
  );
}

const GarageContainer = Provider<
  { color: string },
  { counter: number },
  { timeService: TimeService; garageStore: GarageStore }
>(Garage, {
  helper({ garageStore }, { color }) {
    return {
      color,
      counter: garageStore.counter,
    };
  },
  services: ({ color }) => [TimeService, [GarageStore, [color]]],
  // services: [TimeService, GarageStore],
  stop: true,
  stub: Loader,
});

export function MyApplication() {
  return <GarageContainer color="white" />;
}
