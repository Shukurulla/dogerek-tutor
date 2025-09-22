import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Grid } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Content } = AntLayout;
const { useBreakpoint } = Grid;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg; // lg breakpoint: 992px

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <AntLayout className="min-h-screen">
      {/* Desktop Sidebar - only show on desktop */}
      {!isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {/* Main Layout */}
      <AntLayout
        className={`transition-all duration-300`}
        style={{
          marginLeft: !isMobile ? (collapsed ? 80 : 256) : 0,
        }}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content
          className="bg-gray-50"
          style={{
            padding: isMobile ? "16px" : "24px",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </Content>
      </AntLayout>

      {/* Mobile Sidebar (Drawer) - handled within Sidebar component */}
      {isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}
    </AntLayout>
  );
}
