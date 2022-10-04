import type { BindableEntityStartConfig, Constructor } from '../typing/common';

export function getConfig<T extends object, A extends unknown[]>(
  ServiceProto: Constructor<T, A>,
  protoAttrs: A,
): BindableEntityStartConfig<T, A> {
  const serviceStartConfigData: BindableEntityStartConfig<T, A> = {
    proto: ServiceProto,
    protoAttrs,
    // @ts-expect-error untypable
    binderConfig: 'binderConfig' in ServiceProto ? ServiceProto.binderConfig : null,
  };

  return serviceStartConfigData;
}
