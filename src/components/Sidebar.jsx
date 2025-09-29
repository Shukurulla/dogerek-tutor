import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Badge, Drawer, Button, Grid } from "antd";
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
import { logo } from "../../public";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const { data: applicationsData } = useGetApplicationsQuery("pending");
  const pendingCount = applicationsData?.data?.length || 0;

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

  // Mobile menu button (FAB)
  if (isMobile) {
    return (
      <>
        {/* Floating Action Button */}
        <Button
          type="primary"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            width: "40px",
            height: "40px",
          }}
        />

        {/* Mobile Drawer */}
        <Drawer
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <img src={logo} className="w-[50px] " alt="" />
                <p>Teacher panel</p>
              </div>
            </div>
          }
          placement="left"
          open={mobileMenuVisible}
          onClose={() => setMobileMenuVisible(false)}
          width={280}
          bodyStyle={{ padding: 0 }}
          headerStyle={{ borderBottom: "1px solid #f0f0f0" }}
          className="mobile-drawer"
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
      </>
    );
  }

  // Desktop sidebar
  return (
    <Sider
      width={256}
      collapsed={collapsed}
      className="!fixed left-0 top-0 bottom-0 z-10 shadow-xl"
      theme="dark"
      style={{
        background: "linear-gradient(180deg, #4c1d95 0%, #831843 100%)",
        display: isMobile ? "none" : "block",
      }}
      collapsedWidth={80}
      trigger={null}
    >
      <div className="h-16 flex items-center justify-center border-b border-purple-700">
        <h1
          className={`text-white font-bold transition-all duration-300 ${
            collapsed ? "text-xl" : "text-2xl"
          }`}
        >
          {collapsed ? "OP" : "O'qituvchi Panel"}
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
