import Sidebar from "../components/Sidebar";
import ReduxProvider from "../store/provider";

export const metadata = {
  title: "Accounts Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
          rel="stylesheet"
        />
      </head>

      <body>
        <ReduxProvider>
          <Sidebar />

          <main
            style={{
              marginLeft: "250px",
              width: "calc(100% - 250px)",
              minHeight: "100vh",
              overflowX: "hidden",
            }}
          >
            <div className="p-4">
              {children}
            </div>
          </main>
        </ReduxProvider>

        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        />
      </body>
    </html>
  );
}