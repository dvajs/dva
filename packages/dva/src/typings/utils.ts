export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T extends U, U> = OmitStrict<T, keyof U>;
export type ExtractProps<TComponentOrTProps> = TComponentOrTProps extends React.Component<
infer TProps,
any
>
? TProps
: TComponentOrTProps;