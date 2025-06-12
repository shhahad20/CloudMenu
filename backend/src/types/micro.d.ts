declare module 'micro' {
  export function send(res: any, code: number, obj?: any): void;
  export function json(req: any): Promise<any>;
  export default function micro(fn: Function): any;
}