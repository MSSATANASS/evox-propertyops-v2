import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import TourRun from "./pages/TourRun";
import Turnover from "./pages/Turnover";
import Vendor from "./pages/Vendor";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/tienda" component={Shop} /><Route path="/tourrun" component={TourRun} /><Route path="/turnover" component={Turnover} /><Route path="/vendors" component={Vendor} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster position="top-center" closeButton duration={3200} /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
