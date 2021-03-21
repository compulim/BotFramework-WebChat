/* eslint @typescript-eslint/no-explicit-any: "off" */
declare module 'simple-update-in' {
  export default function updateIn<T>(
    target: T,
    keys: (((key: string, value: any) => boolean) | ((index: number, value: any) => boolean) | number | string)[],
    updater?: (value: any) => any
  ): T;
}
