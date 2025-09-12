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
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FormOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useGetTutorDashboardQuery,
  useGetMyClubsQuery,
} from "../store/api/tutorApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTutorDashboardQuery();
  const { data: clubsData } = useGetMyClubsQuery();

  if (isLoading) return <LoadingSpinner size="large" />;
  if (error)
    return (
      <div className="text-center py-12 text-red-500">Xatolik yuz berdi</div>
    );

  const stats = data?.data || {};
  const clubs = clubsData?.data || [];

  // Mock data for chart
  const weekData = [
    { day: "Du", davomat: 32 },
    { day: "Se", davomat: 28 },
    { day: "Ch", davomat: 35 },
    { day: "Pa", davomat: 30 },
    { day: "Ju", davomat: 33 },
  ];

  const StatCard = ({ title, value, icon, color, suffix, onClick }) => (
    <Card
      className="card-hover border-0 shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-gray-500 text-sm">{title}</Text>
          <div className="mt-2">
            <Statistic
              value={value}
              suffix={suffix}
              valueStyle={{ fontSize: "28px", fontWeight: 600, color }}
            />
          </div>
        </div>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center`}
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon, { style: { fontSize: "24px", color } })}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-1">
          Dashboard
        </Title>
        <Text className="text-gray-500">
          Xush kelibsiz, {data?.data?.userName || "Tutor"}!
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="To'garaklar"
            value={stats.totalClubs || 0}
            icon={<BookOutlined />}
            color="#722ed1"
            suffix="ta"
            onClick={() => navigate("/my-clubs")}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Jami studentlar"
            value={stats.totalStudents || 0}
            icon={<TeamOutlined />}
            color="#1890ff"
            suffix="ta"
            onClick={() => navigate("/students")}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Kutilayotgan arizalar"
            value={stats.pendingApplications || 0}
            icon={<FormOutlined />}
            color="#fa8c16"
            suffix="ta"
            onClick={() => navigate("/applications")}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="Mening to'garaklarim"
            className="shadow-md border-0 h-full"
            extra={
              <Button type="link" onClick={() => navigate("/my-clubs")}>
                Barchasi
              </Button>
            }
          >
            {clubs.length > 0 ? (
              <List
                dataSource={clubs.slice(0, 3)}
                renderItem={(club) => (
                  <List.Item className="border-0">
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-2">
                        <Text className="font-medium">{club.name}</Text>
                        <Tag color="purple">{club.totalStudents || 0} ta</Tag>
                      </div>
                      <Progress
                        percent={
                          ((club.totalStudents || 0) / (club.capacity || 30)) *
                          100
                        }
                        size="small"
                        strokeColor="#722ed1"
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
          <Card title="Haftalik davomat" className="shadow-md border-0 h-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="davomat" fill="#722ed1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-500" />
                Eng faol studentlar
              </span>
            }
            className="shadow-md border-0 h-full"
          >
            <List
              dataSource={[
                { name: "Aliyev Jasur", attendance: 98 },
                { name: "Karimova Dilnoza", attendance: 96 },
                { name: "Rashidov Azizbek", attendance: 94 },
              ]}
              renderItem={(item, index) => (
                <List.Item className="border-0">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar
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
                    <div className="flex-1">
                      <Text className="font-medium block">{item.name}</Text>
                    </div>
                    <Tag color="green">{item.attendance}%</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="shadow-md border-0 bg-gradient-to-r from-purple-50 to-pink-50"
        bodyStyle={{ padding: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
          <div className="p-6 text-center">
            <CheckCircleOutlined className="text-3xl text-green-500 mb-2" />
            <Text className="block text-gray-600 mb-1">Oylik davomat</Text>
            <Text className="text-2xl font-bold">
              {stats.thisMonthAttendance || 0}
            </Text>
          </div>

          <div className="p-6 text-center">
            <ClockCircleOutlined className="text-3xl text-blue-500 mb-2" />
            <Text className="block text-gray-600 mb-1">
              O'tkazilgan darslar
            </Text>
            <Text className="text-2xl font-bold">
              {stats.thisMonthAttendance || 0}
            </Text>
          </div>

          <div className="p-6 text-center">
            <FormOutlined className="text-3xl text-orange-500 mb-2" />
            <Text className="block text-gray-600 mb-1">Qabul qilingan</Text>
            <Text className="text-2xl font-bold">12</Text>
          </div>

          <div className="p-6 text-center">
            <TeamOutlined className="text-3xl text-purple-500 mb-2" />
            <Text className="block text-gray-600 mb-1">O'rtacha davomat</Text>
            <Text className="text-2xl font-bold">87%</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
