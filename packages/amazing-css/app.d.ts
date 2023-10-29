///<reference types="vite/client" />

declare interface ViewTransition {
  updateCallbackDone: Promise<void>;
  ready: Promise<void>;
  finished: Promise<void>;
}
declare interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}
declare interface Element {
  startViewTransition?: (callback: () => void) => ViewTransition;
}
