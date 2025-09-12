import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Badge } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  FormOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useGetApplicationsQuery } from "../store/api/tutorApi";

const { Sider } = Layout;

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <Sider
      width={256}
      collapsed={collapsed}
      className="!fixed left-0 top-0 bottom-0 z-10 shadow-xl"
      theme="dark"
      style={{
        background: "linear-gradient(180deg, #4c1d95 0%, #831843 100%)",
      }}
    >
      <div className="h-16 flex items-center justify-center border-b border-purple-700">
        <h1
          className={`text-white font-bold transition-all duration-300 ${
            collapsed ? "text-xl" : "text-2xl"
          }`}
        >
          {collapsed ? "T" : "Tutor Panel"}
        </h1>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="mt-4 bg-transparent"
        style={{ background: "transparent" }}
      />
    </Sider>
  );
}
