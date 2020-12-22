import type {
  AnyComponent as _AnyComponent,
  Attributes as _Attributes,
  ClassAttributes as _ClassAttributes,
  Component as _Component,
  ComponentChild as _ComponentChild,
  ComponentChildren as _ComponentChildren,
  ComponentClass as _ComponentClass,
  ComponentConstructor as _ComponentConstructor,
  ComponentFactory as _ComponentFactory,
  ComponentProps as _ComponentProps,
  ComponentType as _ComponentType,
  Consumer as _Consumer,
  Context as _Context,
  CreateHandle as _CreateHandle,
  EffectCallback as _EffectCallback,
  Fragment as _Fragment,
  FunctionComponent as _FunctionComponent,
  FunctionalComponent as _FunctionalComponent,
  Inputs as _Inputs,
  JSX as _JSX,
  Key as _Key,
  Options as _Options,
  PreactConsumer as _PreactConsumer,
  PreactContext as _PreactContext,
  PreactDOMAttributes as _PreactDOMAttributes,
  PreactProvider as _PreactProvider,
  PropRef as _PropRef,
  Provider as _Provider,
  Reducer as _Reducer,
  Ref as _Ref,
  RefCallback as _RefCallback,
  RefObject as _RefObject,
  RefValue as _RefValue,
  RenderableProps as _RenderableProps,
  StateUpdater as _StateUpdater,
  VNode as _VNode,
  cloneElement as _cloneElement,
  createContext as _createContext,
  createRef as _createRef,
  hydrate as _hydrate,
  isValidElement as _isValidElement,
  jsx as _jsx,
  options as _options,
  render as _render,
  toChildArray as _toChildArray,
  useCallback as _useCallback,
  useContext as _useContext,
  useDebugValue as _useDebugValue,
  useEffect as _useEffect,
  useErrorBoundary as _useErrorBoundary,
  useImperativeHandle as _useImperativeHandle,
  useLayoutEffect as _useLayoutEffect,
  useMemo as _useMemo,
  useReducer as _useReducer,
  useRef as _useRef,
  useState as _useState,
} from "~/preact-lock";
import type { lazy as _lazy } from "~/lazy";
import type {
  Body as _Body,
  BodyProps as _BodyProps,
  Head as _Head,
  HeadProps as _HeadProps,
  Html as _Html,
  HtmlProps as _HtmlProps,
  Meta as _Meta,
  MetaProps as _MetaProps,
  Script as _Script,
  ScriptProps as _ScriptProps,
  Style as _Style,
  StyleProps as _StyleProps,
  Title as _Title,
  TitleProps as _TitleProps,
} from "~/components";
import type { useMutation as _useMutation, useQuery as _useQuery } from "~/graphql-client";

declare global {
  interface Window {
    onchangestate?: null | ((this: Window, ev: Event) => any);
  }
  interface WindowEventMap {
    changestate: Event;
  }

  const __PROD__: true | undefined;
  const __DEV__: true | undefined;
  const __TEST__: true | undefined;
  const __NODE__: true | undefined;
  const __BROWSER__: true | undefined;
  const __MODULE__: true | undefined;
  const __NOMODULE__: true | undefined;

  const __ROOT_ID__: string | undefined;
  const __STYLE_ID__: string | undefined;
  const __CLASSES_ID__: string | undefined;
  const __GRAPHQL_ID__: string | undefined;
  const __BASE_URL__: string | undefined;
  const __GRAPHQL_ENDPOINT__: string | undefined;

  type AnyComponent<P = {}, S = {}> = _AnyComponent<P, S>;
  type Attributes = _Attributes;
  type ClassAttributes<T> = _ClassAttributes<T>;
  const Component: typeof _Component;
  type ComponentChild = _ComponentChild;
  type ComponentChildren = _ComponentChildren;
  type ComponentClass<P = {}, S = {}> = _ComponentClass<P, S>;
  type ComponentConstructor<P = {}, S = {}> = _ComponentConstructor<P, S>;
  type ComponentFactory<P = {}> = _ComponentFactory<P>;
  type ComponentProps<C extends ComponentType<any> | keyof _JSX.IntrinsicElements> = _ComponentProps<C>;
  type ComponentType<P = {}> = _ComponentType<P>;
  type Consumer<T> = _Consumer<T>;
  type Context<T> = _Context<T>;
  type CreateHandle = _CreateHandle;
  type EffectCallback = _EffectCallback;
  const Fragment: typeof _Fragment;
  type FunctionComponent<P = {}> = _FunctionComponent<P>;
  type FunctionalComponent<P = {}> = _FunctionalComponent<P>;
  type Inputs = _Inputs;
  // type JSX = _JSX;
  type Key = _Key;
  type Options = _Options;
  type PreactConsumer<T> = _PreactConsumer<T>;
  type PreactContext<T> = _PreactContext<T>;
  type PreactDOMAttributes = _PreactDOMAttributes;
  type PreactProvider<T> = _PreactProvider<T>;
  type PropRef<T> = _PropRef<T>;
  type Provider<T> = _Provider<T>;
  type Reducer<S, A> = _Reducer<S, A>;
  type Ref<T> = _Ref<T>;
  type RefCallback<T> = _RefCallback<T>;
  type RefObject<T> = _RefObject<T>;
  type RefValue<T> = _RefValue<T>;
  type RenderableProps<P, RefType = any> = _RenderableProps<P, RefType>;
  type StateUpdater<S> = _StateUpdater<S>;
  type VNode<P = {}> = _VNode<P>;
  const cloneElement: typeof _cloneElement;
  const createContext: typeof _createContext;
  const createRef: typeof _createRef;
  const hydrate: typeof _hydrate;
  const isValidElement: typeof _isValidElement;
  const jsx: typeof _jsx;
  const options: typeof _options;
  const render: typeof _render;
  const toChildArray: typeof _toChildArray;
  const useCallback: typeof _useCallback;
  const useContext: typeof _useContext;
  const useDebugValue: typeof _useDebugValue;
  const useEffect: typeof _useEffect;
  const useErrorBoundary: typeof _useErrorBoundary;
  const useImperativeHandle: typeof _useImperativeHandle;
  const useLayoutEffect: typeof _useLayoutEffect;
  const useMemo: typeof _useMemo;
  const useReducer: typeof _useReducer;
  const useRef: typeof _useRef;
  const useState: typeof _useState;

  const lazy: typeof _lazy;

  const Body: typeof _Body;
  type BodyProps = _BodyProps;
  const Head: typeof _Head;
  type HeadProps = _HeadProps;
  const Html: typeof _Html;
  type HtmlProps = _HtmlProps;
  const Meta: typeof _Meta;
  type MetaProps = _MetaProps;
  const Script: typeof _Script;
  type ScriptProps = _ScriptProps;
  const Style: typeof _Style;
  type StyleProps = _StyleProps;
  const Title: typeof _Title;
  type TitleProps = _TitleProps;

  const useMutation: typeof _useMutation;
  const useQuery: typeof _useQuery;
}
