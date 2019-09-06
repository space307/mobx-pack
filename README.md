# mobx-pack

Библиотека для создания архитектуры приложения с множеством хранилищ на основе библитеки Mobx

# Установка

`npm install mobx-pack --save`

## Вступление

При создании веб-приложений на React встаёт вопрос - какой менеджер состояний использовать
для разработки приложения, на что стоит обратить внимание. Если никаких специфических требований к приложению нет,
то разумно взять наиболее популярный вариант, например, Redux и это отличный выбор, впрочем если всё же вас
смущает единое хранилище, много лишнего кода, возможные потери по производительности, сложность деления
приложения на части с асинхронной подгрузкой, то есть смысл взглянуть на альтернативные варианты.

Mobx даёт из коробки, простое api, высокую производительность (в случае если приложение большое и количество обновлений может
достигать сотен раз в секунду это может быть решающим фактором), возможность использовать привычный ООП подход,
простой способ связывания состояния с компонентами, однако Mobx не решает проблему организации потока данных и
деления на части большого приложения.

Mobx-pack - это маленькая библиотека, которая решает некоторые проблемы DI (инъекция зависимосчтей) больших приложений, которые
возникают у разработчика при использовании mobx.

## Задачи, которые решает mobx-pack

- разрешение зависимостей 1 сервиса от другого, как статически так и динамически
- создание контейнера для передачи данных из сервисов в компонненты
- управление жизненым циклом сервисов

## Контекст проложения

Для начала работы над приложением неоходимо создать контексты и зависимые от контекстов функции.
Контексты служат для передачи `Binder` и сервисов по дереву приложения.

Пример создания контекста:

```javascript
import React from 'react';
import { createProvider, createBinderProvider } from 'mobx-pack';

export const BinderContext = React.createContext();
export const ServiceContext = React.createContext();
export const Provider = createProvider(BinderContext, ServiceContext);
export const BinderProvider = createBinderProvider(BinderContext);
```

## Binder

`Binder` - это класс посредник между сервисами. Сервисы регистрируются в `Binder` и получают доступ друг к другу.

## BinderProvider

`BinderProvider` - это функция возвращающая компонент, который создаёт новый экземпляр `Binder` и кладёт его в контекс реакт приложения.
Приложение может содержать в себе несколько `Binder`, каждый из которых содежит свой список сервисов. При этом новый
`Binder` при создании может получить ссылку на родительский `Binder`, в этом случае все сервисы родителя будут доступны в потомке.

Принимает параметры:

- `React.Component`

Возвращает:
`React.Component`

Пример создания `Binder` и получение его из контекста:

```javascript
import { BinderContext } from './context.js';

const MyApplication = () => (
  <div>
    <BinderContext.Cunsumer>
      {({ binder }) => {
        console.log(binder);
      }}
    </BinderContext.Cunsumer>
  </div>
);

const ComponentWithNewBinder = BinderProvider(MyApplication);
```

# Provider

`Provider` - это декоратор реакт компонента. `Provider` получает в опциях список сервисов, от которых
зависит декорируемый компонент, а из контекста получает экземпляр `Binder`. Задача `Provider` -
положить в контекст искомые сервисы, а так же при желании извлечь данные из сервисов и положить
в `props` к декорируемому компоненту. Если в `Binder` искомые сервисы не найдены, `Provider`
содаёт их и регистрирует в `Binder`. `Provider` оброрачивает компонент в `observer`, поэтому 
observable переменные, используемые в методе helper (опций `Provider`) будут вызывать 
перерендер компонента при их изменении.

Принимает аттрибуты:

- `React.Component`
- `options` (опционально)
  1. helper(function) - функция, принмает обект с сервисами и props, возвращает props для декорируемого компонента
  1. services(Array | function) - массив прототипов сервисов или функция, принимающая props и позвращающая массив сервисов
  1. stop(boolean) - в значении `true` cообщает `Provider`, что при `unmount` компонента нужно остановить сервисы, инициализированные в данном `Provider`.
  1. stub(`React.Component`) - заглушка на время асинхронного запуска сервисов.

Возвращает:
`React.Component`

Пример:

```javascript
import { Provider } from './context.js';

const Component = ({ time, id }) => (
  <div>
    {time} : {id}
  </div>
);

const Container = Provider(Component, {
  helper({ timeService }, { id }) {
    return {
      id,
      time: timeService.time,
    };
  },
  services: [TimeService],
});

const App = () => <Container id={1} />;
```

Пример, когда необходимо передать `props` в конструктор сервиса:

```javascript
import { Provider } from './context.js';
import { bindAs } from 'mobx-pack';

@bindAs('SomeService')
class SomeService {
  constructor(foo, bar) {}
}

const Container = Provider(Component, {
  services: props => [[SomeService, [props.foo, props.bar]], TimeService],
});
```

Пример, получения сервисов помещённых `Provider` в контекст:

```javascript
import { Provider, ServiceContext } from './context.js';

const Component = () => (
  <div>
    <ServiceContext.Cunsumer>
      {({ someService, timeService }) => (<SomeComponent data={someService.data} time={timeService.time}>}
    </ServiceContext.Cunsumer>
  </div>
);
const Container = Provider(Component, {
  services: props => [SomeService, TimeService],
});
```

##Сервисы
В приложении есть структуры данных, которые описывают бизнесс логику, в частности модели, которые приходят с сервера.
Эти данные храняться в **сервисах**. Задача сервисов поддержка в актуальном состоянии моделей приложения, обмен данными
с сервером, с помошью клиента. Так же есть данные, которые нужно шарить между компонентами, находящимися в разных ветвях
дерева приложения эти данные так же можно хранить в сервисах.

##Описание сервиса
Для того, чтобы сервис мог быть помещён в `Binder`, а так же мог получать в качестве зависимостей другие сервисы
есть специальный синтаксис описания сервиса, с помощью декораторов. В результате
работы декораторов у сервиса появляется служебное `static` поле `binderConfig`, содержащее: идентификатор, методы жизненного цикла 
и зависимости сервиса. 

Пример сервиса:

```javascript
import { bindAs, onStart, onBind, onUnbind, onStop } from 'mobx-pack';

@bindAs('ServiceA')
class ServiceA {
  constructor(foo, bar) {}

  // для сервисов, которые должны быть уже инициированы,
  // на момент запуска
  @onStart('initialStateService')
  onStart(initialStateService) {
    this.userId = initialStateService.userId;
  }

  // onBind будет вызван когда сервисы ('ServiceB', 'ServiceC') будут привязаны к `Binder` (запущены),
  // например, по действию пользователя
  @onBind('ServiceB', 'ServiceC')
  onBind(ServiceB, ServiceC) {}

  // onUnbind будет вызван когда сервисы ('ServiceB', 'ServiceC') будут отвязаны от `Binder` (остановлены)
  // например, при `unmount` контейнера
  @onUnbind('ServiceB', 'ServiceC')
  onUnbind() {}

  // onStop будет запущен, когда сервис будет отвязан от `Binder`
  // Обработка отсановки сервиса для очистки сайд эффектов
  @onStop
  onStop() {}
}
```

## Ссылки

- <a href="https://github.com/space307/mobx-pack/tree/master/demo" target="_blank">Boilerplate project</a>
- <a href="https://opencollective.com/mobx/sponsor/0/website" target="_blank">Mobx</a>
