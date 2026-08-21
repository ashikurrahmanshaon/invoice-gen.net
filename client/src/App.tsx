import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Customers from "@/pages/Customers";
import InvoiceDetail from "@/pages/InvoiceDetail";
import Invoices from "@/pages/Invoices";
import NewInvoice from "@/pages/NewInvoice";
import TemporaryInvoice from "@/pages/TemporaryInvoice";
import NotFound from "@/pages/NotFound";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/invoices"} component={Invoices} />
        <Route path={"/invoices/new"} component={NewInvoice} />
        <Route path={"/invoices/:id/edit"} component={NewInvoice} />
        <Route path={"/invoices/temporary"} component={TemporaryInvoice} />
        <Route path={"/invoices/:id"} component={InvoiceDetail} />
        <Route path={"/customers"} component={Customers} />
        <Route path={"/products"} component={Products} />
        <Route path={"/settings"} component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LocaleProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LocaleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
