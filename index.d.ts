// Type definitions for dva 1.0.0
// Project: dva
// Definitions by: dva <https://github.com/dvajs/dva>

declare namespace 'dva' {

    /** connecting Container Components */
    export function connect(maps:Object):Function;

    export default function dva(opts?:Object):{

        /**
         *
         * Register an object of hooks on the application.
         * Support these hooks:
         *  onError(fn): called when an effect or subscription emit an error
         *  onAction(array|fn): called when an action is dispatched, used for registering redux middleware, support Array for convenience
         *  onStateChange(fn): called after a reducer changes the state
         *  onReducer(fn): used for apply reducer enhancer
         *  onEffect(fn): used for wrapping effect to add custom behavior, e.g. dva-loading for automatical loading state
         *  onHmr(fn): used for hot module replacement
         *  extraReducers(object): used for adding extra reducers, e.g. redux-form needs extra form reducer
         *
         */
        use: (hooks:{
            onError(fn:Function),
            onAction(actions:Function | Array),
            onStateChange(fn:Function),
            onReducer(fn:Function),
            onEffect(fn:Function),
            onHmr(fn:Function),
            extraReducers(reducer:Object)
        })=>void,

        /**
         *
         * Start the application. selector is optional. If no selector arguments, it will return a function that return JSX elements.
         *
         */
        start: (selector?:HTMLElement | String)=>void,

        /*
         *
         * Create a new model. Takes the following arguments:
         *  namespace: namespace the model
         *  state: initial value
         *  reducers: synchronous operations that modify state. Triggered by actions. Signature of (state, action) => state, same as Redux.
         *  effects: asynchronous operations that don't modify state directly. Triggered by actions, can call actions. Signature of (action, { put, call, select }),
         *  subscriptions: asynchronous read-only operations that don't modify state directly. Can call actions. Signature of ({ dispatch, history }).
         *
         * put(action) in effects, and dispatch(action) in subscriptions
         *
         * Send a new action to the models. put in effects is the same as dispatch in subscriptions.
         *
         */
        model: (model:{
            namespace: String,
            state: Object,
            reducers?: Object,
            effects?: Object,
            subscriptions?: Object,
        })=>void,

        /**
         *
         * Config router. Takes a function with arguments { history }, and expects router config. It use the same api as react-router, return jsx elements or JavaScript Object for dynamic routing.
         *
         */
        router: (router:JSX.Element|Function)=>JSX.Element,
    };

    /**
     *
     * To Connect Models on Components
     *
     * @example
     * `export default connect(state => state)(Components)`
     *
     */
    export function connect(map:Function):Function;
}

/**
 * https://github.com/reactjs/react-router
 */
declare module 'dva/router' {
    import React = __React;
    interface RouterProps {
        history?: Object
    }
    export class Router extends React.Component<RouterProps, {}> {
        render():JSX.Element
    }
    interface RouteProps {
        path?: string,
        component?: React.ReactNode
    }
    export class Route extends React.Component<RouteProps, {}> {
        render():JSX.Element
    }

    /**
     * https://github.com/reactjs/react-router-redux
     */
    interface RouterRedux {
        routerStateReducer: Function,
        ReduxRouter: Function,
        reduxReactRouter: Function,
        isActive: Function,
        historyAPI: Function,
        push: Function,
        replace: Function,
        setState: Function,
        go: Function,
        goBack: Function,
        goForward: Function,
    }
}

/**
 * https://github.com/fis-components/whatwg-fetch
 */
declare module 'dva/fetch' {
    export default Function;
}
