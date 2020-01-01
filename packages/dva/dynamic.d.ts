declare function dynamic(resolve: (value?: PromiseLike<any>) => void): void;
declare namespace dynamic {
  function setDefaultLoadingComponent(LoadingComponent: any): void;
}
export default dynamic;
