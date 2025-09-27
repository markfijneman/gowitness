import Navigation from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="flex min-h-screen w-full flex-col">
        <div className="z-50 sticky top-0 flex h-16 items-center gap-4 bg-background-front px-4 md:px-6">
          <Navigation />
        </div>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Outlet />
        </main>
        <footer className="flex justify-end p-4">
          <p className="text-sm text-muted-foreground">
            <a href="/swagger/index.html" className="underline">
              API Documentation
            </a>
            {" "}|{" "}
            <a href="https://github.com/markfijneman/gowitness" target="_blank" rel="noopener noreferrer" className="underline">Source code</a>
          </p>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;