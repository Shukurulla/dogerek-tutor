import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Badge, Drawer, Button } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  FormOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useGetApplicationsQuery } from "../store/api/tutorApi";

const { Sider } = Layout;

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { data: applicationsData } = useGetApplicationsQuery("pending");
  const pendingCount = applicationsData?.data?.length || 0;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check initial size

    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed, setCollapsed]);

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/my-clubs",
      icon: <BookOutlined />,
      label: "Mening to'garaklarim",
    },
    {
      key: "/applications",
      icon: <FormOutlined />,
      label: (
        <span className="flex items-center justify-between">
          <span>Arizalar</span>
          {pendingCount > 0 && <Badge count={pendingCount} className="ml-2" />}
        </span>
      ),
    },
    {
      key: "/attendance",
      icon: <CalendarOutlined />,
      label: "Davomat",
    },
    {
      key: "/students",
      icon: <TeamOutlined />,
      label: "Studentlar",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profil",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuVisible(false);
    }
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <Button
      type="text"
      icon={<MenuOutlined />}
      onClick={() => setMobileMenuVisible(true)}
      className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg lg:hidden"
      size="large"
    />
  );

  // Mobile drawer menu
  const MobileMenu = () => (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-600">Tutor Panel</h1>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setMobileMenuVisible(false)}
          />
        </div>
      }
      placement="left"
      open={mobileMenuVisible}
      onClose={() => setMobileMenuVisible(false)}
      width={280}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ borderBottom: "1px solid #f0f0f0" }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="h-full border-r-0"
        style={{ fontSize: "16px" }}
      />
    </Drawer>
  );

  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <MobileMenu />
      </>
    );
  }

  // Desktop sidebar
  return (
    <Sider
      width={256}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      collapsible
      className="!fixed left-0 top-0 bottom-0 z-10 shadow-xl"
      theme="dark"
      style={{
        background: "linear-gradient(180deg, #4c1d95 0%, #831843 100%)",
      }}
      breakpoint="lg"
      collapsedWidth={80}
    >
      <div className="h-16 flex items-center justify-center border-b border-purple-700">
        <h1
          className={`text-white font-bold transition-all duration-300 ${
            collapsed ? "text-xl" : "text-2xl"
          }`}
        >
          {collapsed ? "TP" : "Tutor Panel"}
        </h1>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="mt-4 bg-transparent"
        style={{
          background: "transparent",
          fontSize: collapsed ? "20px" : "14px",
        }}
      />
    </Sider>
  );
}
