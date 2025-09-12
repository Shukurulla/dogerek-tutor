import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Space,
  Badge,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { logout } from "../store/api/authApi";
import { useGetApplicationsQuery } from "../store/api/tutorApi";
import { message } from "antd";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: applicationsData } = useGetApplicationsQuery("pending");
  const pendingCount = applicationsData?.data?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    message.success("Tizimdan chiqdingiz");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Chiqish",
      onClick: handleLogout,
    },
  ];

  const notifications = [
    {
      key: "1",
      label: `${pendingCount} ta yangi ariza kutmoqda`,
      onClick: () => navigate("/applications"),
    },
  ];

  return (
    <AntHeader className="bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="text-lg"
        />

        <Text className="font-medium text-gray-700">
          {user?.assignedClubs?.length || 0} ta to'garak
        </Text>
      </div>

      <Space size="large">
        <Dropdown menu={{ items: notifications }} placement="bottomRight">
          <Badge count={pendingCount} size="small">
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined className="text-lg" />}
            />
          </Badge>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
            <Avatar
              src={user?.profile?.image}
              icon={!user?.profile?.image && <UserOutlined />}
              className="bg-purple-500"
            />
            <div className="text-left">
              <div className="font-medium">
                {user?.profile?.fullName || user?.username}
              </div>
              <div className="text-xs text-gray-500">Tutor</div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
