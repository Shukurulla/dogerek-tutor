import { useState, useEffect } from "react";
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
  Drawer,
  List,
  Empty,
  message,
  Grid,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { logout } from "../store/api/authApi";
import {
  useGetApplicationsQuery,
  useGetTutorDashboardQuery,
} from "../store/api/tutorApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/uz";

dayjs.extend(relativeTime);
dayjs.locale("uz");

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

export default function Header({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const { data: applicationsData } = useGetApplicationsQuery("pending");
  const { data: dashboardData } = useGetTutorDashboardQuery();

  const pendingCount = applicationsData?.data?.length || 0;
  const stats = dashboardData?.data || {};

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

  // Generate notifications from real data
  const notifications = [
    ...(pendingCount > 0
      ? [
          {
            key: "pending-apps",
            type: "warning",
            title: "Yangi arizalar",
            description: `${pendingCount} ta ariza kutmoqda`,
            time: dayjs(),
            onClick: () => {
              navigate("/applications");
              setNotificationDrawer(false);
            },
          },
        ]
      : []),
    ...(stats.todayAttendance > 0
      ? [
          {
            key: "today-attendance",
            type: "info",
            title: "Bugungi darslar",
            description: `${stats.todayAttendance} ta dars rejalashtirilgan`,
            time: dayjs(),
            onClick: () => {
              navigate("/attendance");
              setNotificationDrawer(false);
            },
          },
        ]
      : []),
  ].slice(0, 10);

  const NotificationItem = ({ notification }) => (
    <List.Item
      className="cursor-pointer hover:bg-gray-50 px-4 py-3"
      onClick={notification.onClick}
    >
      <div className="w-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Text className="font-medium block">{notification.title}</Text>
            <Text className="text-sm text-gray-500 block">
              {notification.description}
            </Text>
          </div>
          <Text className="text-xs text-gray-400 ml-2">
            {notification.time.fromNow()}
          </Text>
        </div>
      </div>
    </List.Item>
  );

  return (
    <>
      <AntHeader
        className="bg-white flex items-center justify-between shadow-sm sticky top-0 z-10"
        style={{
          padding: isMobile ? "0 16px" : "0 24px",
          height: 64,
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {!isMobile && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
          )}

          {isMobile ? (
            <>
              <Title level={5} className="m-0 p-0 !text-base">
                O'qituvchi Panel
              </Title>
            </>
          ) : (
            <div>
              <Text className="font-semibold text-lg">O'qituvchi Panel</Text>
            </div>
          )}
        </div>

        <Space size={isMobile ? "small" : "middle"}>
          <Badge count={notifications.length} size="small">
            <Button
              type="text"
              shape="circle"
              icon={
                <BellOutlined className={isMobile ? "text-base" : "text-lg"} />
              }
              onClick={() => setNotificationDrawer(true)}
            />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
              <Avatar
                size={isMobile ? "small" : "default"}
                src={user?.profile?.image}
                icon={!user?.profile?.image && <UserOutlined />}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              />
              {!isMobile && (
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {user?.profile?.fullName || user?.username}
                  </div>
                  <div className="text-xs text-gray-500">O'qituvchi</div>
                </div>
              )}
            </Space>
          </Dropdown>
        </Space>
      </AntHeader>

      {/* Notifications Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">
              Bildirishnomalar
            </Title>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setNotificationDrawer(false)}
            />
          </div>
        }
        placement={isMobile ? "bottom" : "right"}
        open={notificationDrawer}
        onClose={() => setNotificationDrawer(false)}
        width={isMobile ? "100%" : 400}
        height={isMobile ? "80%" : "auto"}
        bodyStyle={{ padding: 0 }}
      >
        {notifications.length > 0 ? (
          <List
            className="p-3"
            dataSource={notifications}
            renderItem={(notification) => (
              <NotificationItem notification={notification} />
            )}
          />
        ) : (
          <div className="p-8">
            <Empty description="Bildirishnomalar yo'q" />
          </div>
        )}
      </Drawer>
    </>
  );
}
