import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  List,
  Tag,
  Avatar,
  Empty,
  Button,
  Skeleton,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FormOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useGetTutorDashboardQuery,
  useGetMyClubsQuery,
  useGetApplicationsQuery,
} from "../store/api/tutorApi";
import { useGetAttendanceStatisticsQuery } from "../store/api/attendanceApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { formatDate, calculateAttendancePercentage } from "../utils/helpers";
import dayjs from "dayjs";
import React from "react";

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading } =
    useGetTutorDashboardQuery();
  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const { data: applicationsData } = useGetApplicationsQuery("pending");
  const { data: attendanceStats } = useGetAttendanceStatisticsQuery({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    groupBy: "day",
  });

  if (dashboardLoading) return <LoadingSpinner size="large" />;

  const stats = dashboardData?.data || {};
  const clubs = clubsData?.data || [];
  const pendingApplications = applicationsData?.data || [];

  // Real attendance data for chart
  const weekData = attendanceStats?.data || [
    { day: "Du", davomat: 0 },
    { day: "Se", davomat: 0 },
    { day: "Ch", davomat: 0 },
    { day: "Pa", davomat: 0 },
    { day: "Ju", davomat: 0 },
  ];

  // Pie chart data for club distribution
  const pieData = clubs.map((club) => ({
    name: club.name,
    value: club.totalStudents || 0,
  }));

  const COLORS = ["#722ed1", "#1890ff", "#52c41a", "#fa8c16", "#eb2f96"];

  const StatCard = ({
    title,
    value,
    icon,
    color,
    suffix,
    onClick,
    loading = false,
  }) => (
    <Card
      className="card-hover border-0 shadow-md cursor-pointer h-full"
      onClick={onClick}
      bodyStyle={{ padding: "16px" }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Text className="text-gray-500 text-xs sm:text-sm block">
              {title}
            </Text>
            <div className="mt-1 sm:mt-2">
              <Statistic
                value={value}
                suffix={suffix}
                valueStyle={{
                  fontSize: window.innerWidth < 640 ? "20px" : "28px",
                  fontWeight: 600,
                  color,
                }}
              />
            </div>
          </div>
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {React.cloneElement(icon, {
              style: {
                fontSize: window.innerWidth < 640 ? "18px" : "24px",
                color,
              },
            })}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="px-2 sm:px-0">
        <Title level={2} className="!mb-1 !text-xl sm:!text-2xl">
          Dashboard
        </Title>
        <Text className="text-gray-500 text-sm">
          Xush kelibsiz,{" "}
          {stats.userName ||
            dashboardData?.data?.user?.profile?.fullName ||
            "Tutor"}
          !
        </Text>
      </div>

      <Row gutter={[12, 12]} className="px-2 sm:px-0">
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="To'garaklar"
            value={stats.totalClubs || clubs.length || 0}
            icon={<BookOutlined />}
            color="#722ed1"
            suffix="ta"
            onClick={() => navigate("/my-clubs")}
            loading={clubsLoading}
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Jami studentlar"
            value={stats.totalStudents || 0}
            icon={<TeamOutlined />}
            color="#1890ff"
            suffix="ta"
            onClick={() => navigate("/students")}
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Kutilayotgan"
            value={stats.pendingApplications || pendingApplications.length || 0}
            icon={<FormOutlined />}
            color="#fa8c16"
            suffix="ta"
            onClick={() => navigate("/applications")}
          />
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Bugungi darslar"
            value={stats.todayAttendance || 0}
            icon={<CalendarOutlined />}
            color="#52c41a"
            suffix="ta"
            onClick={() => navigate("/attendance")}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} className="px-2 sm:px-0">
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="text-sm sm:text-base">Mening to'garaklarim</span>
            }
            className="shadow-md border-0 h-full"
            extra={
              <Button
                type="link"
                onClick={() => navigate("/my-clubs")}
                size="small"
              >
                Barchasi
              </Button>
            }
            bodyStyle={{ padding: "12px 16px" }}
          >
            {clubsLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : clubs.length > 0 ? (
              <List
                dataSource={clubs.slice(0, 3)}
                renderItem={(club) => (
                  <List.Item className="border-0 px-0 py-2">
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-2">
                        <Text className="font-medium text-sm sm:text-base truncate pr-2">
                          {club.name}
                        </Text>
                        <Tag color="purple" className="ml-auto">
                          {club.totalStudents ||
                            club.enrolledStudents?.filter(
                              (e) => e.status === "active"
                            ).length ||
                            0}{" "}
                          ta
                        </Tag>
                      </div>
                      <Progress
                        percent={
                          ((club.totalStudents ||
                            club.enrolledStudents?.filter(
                              (e) => e.status === "active"
                            ).length ||
                            0) /
                            (club.capacity || 30)) *
                          100
                        }
                        size="small"
                        strokeColor="#722ed1"
                        showInfo={false}
                      />
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="To'garak mavjud emas" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="text-sm sm:text-base">Haftalik davomat</span>
            }
            className="shadow-md border-0 h-full"
            bodyStyle={{ padding: "12px 16px" }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="davomat" fill="#722ed1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <TrophyOutlined className="text-yellow-500" />
                <span className="hidden sm:inline">Eng faol studentlar</span>
                <span className="sm:hidden">Top studentlar</span>
              </span>
            }
            className="shadow-md border-0 h-full"
            bodyStyle={{ padding: "12px 16px" }}
          >
            {stats.topStudents && stats.topStudents.length > 0 ? (
              <List
                dataSource={stats.topStudents.slice(0, 3)}
                renderItem={(item, index) => (
                  <List.Item className="border-0 px-0 py-2">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <Avatar
                        size={window.innerWidth < 640 ? "small" : "default"}
                        className={`${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-orange-500"
                        }`}
                      >
                        {index + 1}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Text className="font-medium block truncate text-sm sm:text-base">
                          {item.student?.full_name || item.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {item.club?.name}
                        </Text>
                      </div>
                      <Tag color="green" className="ml-auto">
                        {item.attendancePercentage || item.attendance}%
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Ma'lumot mavjud emas" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Mobile-optimized summary card */}
      <Card
        className="shadow-md border-0 bg-gradient-to-r from-purple-50 to-pink-50"
        bodyStyle={{ padding: 0 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
          <div className="p-3 sm:p-6 text-center">
            <CheckCircleOutlined className="text-xl sm:text-3xl text-green-500 mb-1 sm:mb-2" />
            <Text className="block text-gray-600 mb-1 text-xs sm:text-sm">
              Oylik davomat
            </Text>
            <Text className="text-lg sm:text-2xl font-bold">
              {stats.thisMonthAttendance || 0}
            </Text>
          </div>

          <div className="p-3 sm:p-6 text-center">
            <ClockCircleOutlined className="text-xl sm:text-3xl text-blue-500 mb-1 sm:mb-2" />
            <Text className="block text-gray-600 mb-1 text-xs sm:text-sm">
              O'tkazilgan
            </Text>
            <Text className="text-lg sm:text-2xl font-bold">
              {stats.totalSessions || 0}
            </Text>
          </div>

          <div className="p-3 sm:p-6 text-center">
            <FormOutlined className="text-xl sm:text-3xl text-orange-500 mb-1 sm:mb-2" />
            <Text className="block text-gray-600 mb-1 text-xs sm:text-sm">
              Qabul qilingan
            </Text>
            <Text className="text-lg sm:text-2xl font-bold">
              {stats.approvedApplications || 0}
            </Text>
          </div>

          <div className="p-3 sm:p-6 text-center">
            <TeamOutlined className="text-xl sm:text-3xl text-purple-500 mb-1 sm:mb-2" />
            <Text className="block text-gray-600 mb-1 text-xs sm:text-sm">
              O'rtacha
            </Text>
            <Text className="text-lg sm:text-2xl font-bold">
              {stats.averageAttendance || 0}%
            </Text>
          </div>
        </div>
      </Card>

      {/* Additional charts for desktop */}
      <Row gutter={[12, 12]} className="hidden lg:flex px-2 sm:px-0">
        <Col lg={12}>
          <Card title="Studentlar taqsimoti" className="shadow-md border-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col lg={12}>
          <Card title="Oylik tendensiya" className="shadow-md border-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceStats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#722ed1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
