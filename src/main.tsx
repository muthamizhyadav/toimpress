// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App.tsx";
import "@mantine/core/styles.layer.css";
import '@mantine/carousel/styles.css';
import { Provider } from 'react-redux';
import store  from './redux/store';

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </StrictMode>,
);
