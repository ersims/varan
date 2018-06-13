// Dependencies
import { createBrowserHistory, createMemoryHistory } from 'history';

// Exports
export default () => (typeof window !== 'undefined' ? createBrowserHistory() : createMemoryHistory());
