import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as resourceLockWorker from "./resourceLockWorker";

ReactDOM.render(<App/>, document.getElementById("root"));
resourceLockWorker.register();