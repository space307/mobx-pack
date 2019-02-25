// @flow

export type ServiceConfigType<serviceClassType> = {
  proto: serviceClassType,
  protoAttrs?: Array<*>,
  onStart?: string,
  onStop?: string,
  config: {
    bindAs: string,
    onBind?: Array<Array<string>>,
  },
};
