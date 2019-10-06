// @flow

export const SERVICE_DESCRIPTORS = Object.freeze({
  ASSET: 'asset',
  ACCOUNT: 'account',
});

export type TServiceDescriptors = $Values<typeof SERVICE_DESCRIPTORS>;
