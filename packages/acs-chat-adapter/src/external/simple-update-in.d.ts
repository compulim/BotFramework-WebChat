/* eslint @typescript-eslint/no-explicit-any: "off" */
declare module 'simple-update-in' {
  export default function updateIn<T>(
    target: T,
    keys: (((key: number | string, value: any) => boolean) | number | string)[],
    updater?: (value: any) => any
  ): T;
}
