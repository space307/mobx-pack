import type {
  StartBindableEntityResult,
  BindableEntityStartConfig,
  BindableEntity,
} from './typing/common.js';
import type { Binder } from './Binder.js';

export function startServices<T extends BindableEntityStartConfig[]>(
  binder: Binder,
  serviceStartConfigList: T,
): Promise<StartBindableEntityResult[]> {
  return Promise.all(
    serviceStartConfigList.map(serviceStartConfig => binder.start(serviceStartConfig)),
  );
}

export function stopServices(
  binder: Binder,
  serviceStartConfigList: BindableEntityStartConfig[],
): void {
  if (!serviceStartConfigList || !binder) {
    throw new Error('Wrong stopServices attributes!');
  }
  serviceStartConfigList.forEach((ServiceProto: BindableEntityStartConfig): void => {
    binder.stop(ServiceProto);
  });
}

export function getStartedServices(
  binder: Binder,
  serviceStartConfigList: BindableEntityStartConfig[],
): BindableEntity[] | null {
  const services: BindableEntity[] = [];
  serviceStartConfigList.forEach(startConfig => {
    const { bindAs } = startConfig.binderConfig;
    const service = binder.getService(bindAs);

    if (service) {
      services.push(service as BindableEntity);
    }
  });
  return services.length === serviceStartConfigList.length ? services : null;
}
