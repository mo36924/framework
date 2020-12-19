import type * as components from "~/components";
import type * as graphql from "~/graphql-client";
import type * as preact from "~/preact-lock";
import type { lazy as _lazy } from "~/lazy";

declare global {
  interface Window {
    onchangestate?: null | ((this: Window, ev: Event) => any);
  }
  interface WindowEventMap {
    changestate: Event;
  }
  const {
    __PROD__,
    __DEV__,
    __TEST__,
    __NODE__,
    __BROWSER__,
    __MODERN__,
    __MODULE__,
    __NOMODULE__,
  }: { [key: string]: true | undefined };
  const {
    __STORE_ID__,
    __ROOT_ID__,
    __STYLE_ID__,
    __BASE_URL__,
    __GRAPHQL_ENDPOINT__,
  }: { [key: string]: string | undefined };
  const {
    Component,
    Fragment,
    cloneElement,
    createContext,
    createRef,
    hydrate,
    isValidElement,
    jsx,
    options,
    render,
    toChildArray,
    useCallback,
    useContext,
    useDebugValue,
    useEffect,
    useErrorBoundary,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
  }: typeof preact;
  const { Body, Head, Html, Meta, Script, Style, Title }: typeof components;
  const { useMutation, useQuery }: typeof graphql;
  const lazy: typeof _lazy;
  // const {
  //   Body,
  //   Fragment,
  //   Head,
  //   Html,
  //   Meta,
  //   Script,
  //   Style,
  //   Title,
  //   cloneElement,
  //   createContext,
  //   createElement,
  //   createRef,
  //   hydrate,
  //   isValidElement,
  //   jsx,
  //   lazy,
  //   options,
  //   render,
  //   toChildArray,
  //   useCallback,
  //   useContext,
  //   useDebugValue,
  //   useEffect,
  //   useErrorBoundary,
  //   useImperativeHandle,
  //   useLayoutEffect,
  //   useMemo,
  //   useMutation,
  //   useQuery,
  //   useReducer,
  //   useRef,
  //   useState,
  // }: typeof preact;
  type AnyComponent<P = {}, S = {}> = preact.AnyComponent<P, S>;
  type Attributes = preact.Attributes;
  type ClassAttributes<T> = preact.ClassAttributes<T>;
  type ComponentChild = preact.ComponentChild;
  type ComponentChildren = preact.ComponentChildren;
  type ComponentClass<P = {}, S = {}> = preact.ComponentClass<P, S>;
  type ComponentConstructor<P = {}, S = {}> = preact.ComponentConstructor<P, S>;
  type ComponentFactory<P = {}> = preact.ComponentFactory<P>;
  type ComponentProps<C extends ComponentType<any> | keyof preact.JSX.IntrinsicElements> = preact.ComponentProps<C>;
  type ComponentType<P = {}> = preact.ComponentType<P>;
  type Consumer<T> = preact.Consumer<T>;
  type Context<T> = preact.Context<T>;
  type FunctionComponent<P> = preact.FunctionComponent<P>;
  type FunctionalComponent = preact.FunctionalComponent;
  // type JSX = framework.JSX;
  type Key = preact.Key;
  type Options = preact.Options;
  type PreactConsumer<T> = preact.PreactConsumer<T>;
  type PreactContext<T> = preact.PreactContext<T>;
  type PreactDOMAttributes = preact.PreactDOMAttributes;
  type PreactProvider<T> = preact.PreactProvider<T>;
  type Provider<T> = preact.Provider<T>;
  type RefValue<T> = preact.RefValue<T>;
  type RefCallback<T> = preact.RefCallback<T>;
  type RefObject<T> = preact.RefObject<T>;
  type RenderableProps<P, RefType = any> = preact.RenderableProps<P, RefType>;
  type VNode<P = {}> = preact.VNode<P>;
}
