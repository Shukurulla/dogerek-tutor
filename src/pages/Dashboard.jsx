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
  Alert,
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
  ExclamationCircleOutlined,
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
  useGetAttendanceStatisticsQuery,
} from "../store/api/tutorApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import React from "react";

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();

  // Real API chaqiriqlari
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetTutorDashboardQuery();
  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const { data: applicationsData, isLoading: applicationsLoading } =
    useGetApplicationsQuery("pending");
  const { data: attendanceStats, isLoading: statsLoading } =
    useGetAttendanceStatisticsQuery({
      startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
      endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
      groupBy: "day",
    });

  if (dashboardLoading) return <LoadingSpinner size="large" />;

  // Error handling
  if (dashboardError) {
    return (
      <div className="p-6">
        <Alert
          message="Xatolik"
          description="Dashboard ma'lumotlarini yuklab bo'lmadi. Sahifani yangilang."
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Yangilash
            </Button>
          }
        />
      </div>
    );
  }

  const stats = dashboardData?.data || {};
  const clubs = clubsData?.data || [];
  const pendingApplications = applicationsData?.data || [];

  // Chart uchun haqiqiy ma'lumotlar
  const weekData = attendanceStats?.data?.weeklyData || [];
  const monthlyData = attendanceStats?.data?.monthlyData || [];

  // Pie chart uchun real club ma'lumotlari
  const pieData = clubs.map((club, index) => ({
    name: club.name,
    value: club.totalStudents || 0,
    color: ["#722ed1", "#1890ff", "#52c41a", "#fa8c16", "#eb2f96"][index % 5],
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
    description,
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
            {description && (
              <Text className="text-xs text-gray-400 mt-1">{description}</Text>
            )}
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
          Xush kelibsiz, {stats.userName || "Tutor"}!
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
            description="Faol to'garaklar soni"
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
            description="Barcha to'garaklardagi studentlar"
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
            loading={applicationsLoading}
            description="Yangi arizalar"
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
            description="Bugun rejalashtirilgan"
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
              clubs.length > 3 && (
                <Button
                  type="link"
                  onClick={() => navigate("/my-clubs")}
                  size="small"
                >
                  Barchasi
                </Button>
              )
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
                          {club.totalStudents || 0} ta
                        </Tag>
                      </div>
                      <Progress
                        percent={
                          club.capacity && club.totalStudents
                            ? (club.totalStudents / club.capacity) * 100
                            : 0
                        }
                        size="small"
                        strokeColor="#722ed1"
                        showInfo={false}
                      />
                      {club.faculty && (
                        <Text className="text-xs text-gray-500 mt-1 block">
                          {club.faculty.name}
                        </Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="To'garak mavjud emas"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
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
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : weekData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="attendance"
                    fill="#722ed1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="Davomat ma'lumoti yo'q"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
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
                        src={item.student?.image}
                        className={`${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-orange-500"
                        } flex-shrink-0`}
                      >
                        {!item.student?.image && index + 1}
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
              <Empty
                description="Ma'lumot mavjud emas"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Qo'shimcha statistikalar */}
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
              O'tkazilgan darslar
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
              O'rtacha davomat
            </Text>
            <Text className="text-lg sm:text-2xl font-bold">
              {stats.averageAttendance || 0}%
            </Text>
          </div>
        </div>
      </Card>

      {/* Desktop uchun qo'shimcha chartlar */}
      {(pieData.length > 0 || monthlyData.length > 0) && (
        <Row gutter={[12, 12]} className="hidden lg:flex px-2 sm:px-0">
          {pieData.length > 0 && (
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
          )}

          {monthlyData.length > 0 && (
            <Col lg={pieData.length > 0 ? 12 : 24}>
              <Card title="Oylik tendensiya" className="shadow-md border-0">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#722ed1"
                      strokeWidth={2}
                      dot={{ fill: "#722ed1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}
