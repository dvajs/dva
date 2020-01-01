interface Idynamic {
  app: any, models?: any, component: any,
  resolve?:(value?: PromiseLike<any>) => void,
}
declare function dynamic(config: Idynamic): any;
declare namespace dynamic {
  function setDefaultLoadingComponent(LoadingComponent: any): void;
}
export default dynamic;
