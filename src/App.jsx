import React, { useEffect, useState, Suspense } from "react";

import { Route, Switch, useHistory } from "react-router-dom";
import { useBooleanParam } from "./util/query";

import Alert from "@material-ui/lab/Alert";
import LinearProgress from "@material-ui/core/LinearProgress";
import Snackbar from "@material-ui/core/Snackbar";

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { orange, deepPurple } from '@material-ui/core/colors';

import SetSvgColors from "./data/SetSvgColors";
import ScrollToTop from "./ScrollToTop";

import AppNav from "./nav/AppNav";
import SideNav from "./nav/SideNav";

import ConfigDrawer from "./config/ConfigDrawer.jsx";
import ExportButton from "./ExportButton.jsx";
import PrintButton from "./PrintButton.jsx";
import Viewport from "./Viewport";

import AlertContext from "./context/AlertContext";
import ConfigContext, { useConfig } from "./context/ConfigContext";
import { GameProvider } from "./context/GameContext";

import { isElectron } from "./util";

import Loading from "./Loading";

import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Elements from "./pages/Elements";
import Games from "./pages/Games";

import curry from "ramda/src/curry";
const path = require('path');

const theme = createMuiTheme({
  palette: {
    primary: {
      main: deepPurple[600]
    },
    secondary: {
      main: orange[400]
    }
  }
});

const App = () => {
  const [print] = useBooleanParam('print');
  const history = useHistory();

  const printCss = print ? `
body {
  overflow: hidden;
}
` : null;

  // Success, Warning and Error Alerts
  const [alert, setAlert] = useState({ open: false });
  const sendAlert = curry((type, message) => setAlert({ open: true, type, message }));
  const sendProgress = curry((progress, message) => setAlert({ open: true, progress, message }));
  const closeAlert = () => setAlert({ open: false });

  useEffect(() => {
    if (isElectron) {
      let ipcAlert = (event, type, message) => sendAlert(type, message);
      let ipcProgress = (event, progress, message) => sendProgress(progress, message);
      let ipcRenderer = window.require("electron").ipcRenderer;
      let redirect = (event, path) => history.push(path);
      ipcRenderer.on("alert", ipcAlert);
      ipcRenderer.on("progress", ipcProgress);
      ipcRenderer.on("redirect", redirect);

      return () => {
        ipcRenderer.removeListener("alert", ipcAlert);
        ipcRenderer.removeListener("progress", ipcProgress);
        ipcRenderer.removeListener("redirect", redirect);
      }
    }
  });

  // What our config looks like
  const configContext = useConfig();

  // Side panel state
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const toggleSideNav = () => setSideNavOpen(!sideNavOpen);

  return (
    <ThemeProvider theme={theme}>
      <AlertContext.Provider value={sendAlert}>
        <GameProvider>
          <ConfigContext.Provider value={configContext}>
            <Suspense fallback={<Loading/>}>
              <ScrollToTop>
                <Switch>
                  <Route path="/render"></Route>
                  <Route>
                    <AppNav toggleSideNav={toggleSideNav}/>
                    <SideNav open={sideNavOpen} toggle={toggleSideNav}/>
                    {isElectron ? <ExportButton/> : <PrintButton/>}
                    <ConfigDrawer/>
                  </Route>
                </Switch>
                <Viewport sideNavOpen={sideNavOpen}>
                  <Switch>
                    <Route path="/" exact>
                      <Home />
                    </Route>
                    <Route path="/elements">
                      <Elements />
                    </Route>
                    <Route path="/docs">
                      <Docs />
                    </Route>
                    <Route path="/games">
                      <Games />
                    </Route>
                  </Switch>
                </Viewport>
                {print || <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                                    open={alert.open}
                                    onClose={closeAlert}
                                    autoHideDuration={6000}>
                            {alert.progress
                             ? <Alert severity={alert.progress === 100 ? "success" : "info"}>
                                 <LinearProgress variant="determinate" value={alert.progress}/>
                                 {alert.message}
                               </Alert>
                             : <Alert severity={alert.type}>{alert.message}</Alert>}
                          </Snackbar>}
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{height:0,width:0,position:"absolute"}}>
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                            markerWidth="5" markerHeight="5"
                            markerUnits="strokeWidth"
                            orient="auto-start-reverse">
                      <path d="M 0 0 L 8 4 L 8 6 L 0 10 z"
                            strokeLinejoin="round"
                            strokeLinecap="round" />
                    </marker>
                    <mask id="hexMask">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMask">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskOffset">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-86.6025,0 -92.376,-9.999995337 -54.84825,-75 -43.30125,-75 -37.52775,-85 37.52775,-85 43.30125,-75 54.84825,-75 92.376,-9.999995337 86.6025,0 92.376,9.999995337 54.84825,75 43.30125,75 37.52775,85 -37.52775,85 -43.30125,75 -54.84825,75 -92.376,9.999995337"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDie">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 54.84825,75 -54.84825,75"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDieTop">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 54.84825,75 -54.84825,75"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                    <mask id="hexBleedMaskDieBottom">
                      <rect x="-100" y="-100" width="200" height="200" fill="black"/>
                      <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 49.07475,85 -49.07475,85"
                               fill="white"
                               stroke="white"
                               strokeWidth="2" />
                    </mask>
                  </defs>
                </svg>
                <SetSvgColors />
              </ScrollToTop>
            </Suspense>
            <style>{printCss}</style>
          </ConfigContext.Provider>
        </GameProvider>
      </AlertContext.Provider>
    </ThemeProvider>
  );
};

export default App;
