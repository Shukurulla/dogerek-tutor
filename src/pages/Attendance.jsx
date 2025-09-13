import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Calendar,
  Select,
  Typography,
  List,
  Tag,
  Avatar,
  Empty,
  Space,
  message,
  Tooltip,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  useGetMyClubsQuery,
  useGetAttendanceHistoryQuery,
} from "../store/api/tutorApi";
import AttendanceModal from "../components/AttendanceModal";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

export default function Attendance() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  });

  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useGetAttendanceHistoryQuery(
    {
      clubId: selectedClub,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { skip: !selectedClub }
  );

  const clubs = clubsData?.data || [];
  const attendanceHistory = attendanceData?.data?.attendance || [];

  // URL state-dan club ID ni olish
  useEffect(() => {
    if (location.state?.clubId && clubs.length > 0) {
      const clubExists = clubs.find(
        (club) => club._id === location.state.clubId
      );
      if (clubExists) {
        setSelectedClub(location.state.clubId);
      }
    } else if (clubs.length > 0 && !selectedClub) {
      setSelectedClub(clubs[0]._id);
    }
  }, [clubs, location.state, selectedClub]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleMarkAttendance = () => {
    if (!selectedClub) {
      message.warning("Avval to'garakni tanlang");
      return;
    }
    if (!selectedDate) {
      message.warning("Sanani tanlang");
      return;
    }

    // Bugungi sanadan kechikkan sanani tanlab bo'lmaydi
    if (selectedDate.isAfter(dayjs(), "day")) {
      message.warning("Kelajakdagi sanalar uchun davomat kiritib bo'lmaydi");
      return;
    }

    setAttendanceModalVisible(true);
  };

  const handleCloseModal = () => {
    setAttendanceModalVisible(false);
    // Modal yopilgach attendance history ni yangilash
    if (selectedClub) {
      refetchAttendance();
    }
  };

  const selectedClubData = clubs.find((club) => club._id === selectedClub);

  // Calendar cell renderer
  const dateCellRender = (value) => {
    const attendanceForDate = attendanceHistory.find((a) =>
      dayjs(a.date).isSame(value, "day")
    );

    if (attendanceForDate) {
      const presentCount = attendanceForDate.students.filter(
        (s) => s.present
      ).length;
      const totalCount = attendanceForDate.students.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      let color = "default";
      if (percentage >= 90) color = "success";
      else if (percentage >= 75) color = "warning";
      else color = "error";

      return (
        <div className="text-center">
          <Tag color={color} size="small">
            {percentage.toFixed(0)}%
          </Tag>
        </div>
      );
    }
    return null;
  };

  // Statistikalar hisoblash
  const calculateStats = () => {
    if (!attendanceHistory.length) {
      return {
        totalSessions: 0,
        averageAttendance: 0,
        bestSession: null,
        worstSession: null,
      };
    }

    let totalPresent = 0;
    let totalPossible = 0;
    let bestPercentage = 0;
    let worstPercentage = 100;
    let bestSession = null;
    let worstSession = null;

    attendanceHistory.forEach((session) => {
      const presentCount = session.students.filter((s) => s.present).length;
      const totalCount = session.students.length;
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      totalPresent += presentCount;
      totalPossible += totalCount;

      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestSession = {
          date: dayjs(session.date).format("DD.MM.YYYY"),
          percentage: percentage.toFixed(1),
        };
      }

      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstSession = {
          date: dayjs(session.date).format("DD.MM.YYYY"),
          percentage: percentage.toFixed(1),
        };
      }
    });

    return {
      totalSessions: attendanceHistory.length,
      averageAttendance:
        totalPossible > 0
          ? ((totalPresent / totalPossible) * 100).toFixed(1)
          : 0,
      bestSession,
      worstSession,
    };
  };

  const stats = calculateStats();

  if (clubsLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Title level={3}>Davomat boshqaruvi</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleMarkAttendance}
          disabled={!selectedClub || !selectedDate}
          className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
          size="large"
        >
          Davomat kiritish
        </Button>
      </div>

      {/* Statistikalar kartasi */}
      {selectedClub && (
        <Card className="shadow-md border-0">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Umumiy mashg'ulotlar"
                value={stats.totalSessions}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="O'rtacha davomat"
                value={stats.averageAttendance}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Eng yaxshi"
                value={
                  stats.bestSession ? `${stats.bestSession.percentage}%` : "-"
                }
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
              {stats.bestSession && (
                <Text className="text-xs text-gray-500">
                  {stats.bestSession.date}
                </Text>
              )}
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Eng past"
                value={
                  stats.worstSession ? `${stats.worstSession.percentage}%` : "-"
                }
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
              {stats.worstSession && (
                <Text className="text-xs text-gray-500">
                  {stats.worstSession.date}
                </Text>
              )}
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Left side - Calendar va boshqarish */}
        <Col xs={24} lg={16}>
          <Card className="shadow-md border-0 mb-6">
            <div className="mb-4 space-y-4">
              <div>
                <Text className="block mb-2 font-medium">
                  To'garakni tanlang
                </Text>
                <Select
                  placeholder="To'garakni tanlang"
                  style={{ width: "100%" }}
                  value={selectedClub}
                  onChange={setSelectedClub}
                  size="large"
                  loading={clubsLoading}
                >
                  {clubs.map((club) => (
                    <Select.Option key={club._id} value={club._id}>
                      <div className="flex items-center justify-between">
                        <span>{club.name}</span>
                        <Tag color="purple" size="small">
                          {club.totalStudents || 0} ta
                        </Tag>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {selectedClubData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserOutlined className="text-purple-600" />
                    </div>
                    <div>
                      <Text className="font-medium">
                        {selectedClubData.name}
                      </Text>
                      <Text className="block text-xs text-gray-500">
                        {selectedClubData.faculty?.name}
                      </Text>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-gray-400" />
                      <Text>
                        {selectedClubData.schedule?.time?.start} -{" "}
                        {selectedClubData.schedule?.time?.end}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-gray-400" />
                      <Text>{selectedClubData.totalStudents || 0} student</Text>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <Text className="block mb-2 font-medium">
                Tanlangan sana: {selectedDate.format("DD.MM.YYYY")}
              </Text>
            </div>

            <Calendar
              value={selectedDate}
              onSelect={handleDateSelect}
              dateCellRender={dateCellRender}
              className="border rounded-lg"
            />
          </Card>
        </Col>

        {/* Right side - Davomat tarixi */}
        <Col xs={24} lg={8}>
          <Card
            title="Davomat tarixi"
            className="shadow-md border-0"
            extra={
              attendanceHistory.length > 0 && (
                <Text className="text-sm text-gray-500">
                  So'nggi {attendanceHistory.length} ta mashg'ulot
                </Text>
              )
            }
          >
            {attendanceLoading ? (
              <LoadingSpinner size="small" />
            ) : attendanceHistory.length > 0 ? (
              <List
                dataSource={attendanceHistory}
                renderItem={(item) => {
                  const presentCount = item.students.filter(
                    (s) => s.present
                  ).length;
                  const totalCount = item.students.length;
                  const percentage =
                    totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

                  return (
                    <List.Item className="border-0 px-0">
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Text className="font-medium">
                              {dayjs(item.date).format("DD.MM.YYYY")}
                            </Text>
                            <Text className="block text-xs text-gray-500">
                              {dayjs(item.date).format("dddd")}
                            </Text>
                          </div>
                          <Tag
                            color={
                              percentage >= 90
                                ? "success"
                                : percentage >= 75
                                ? "warning"
                                : "error"
                            }
                          >
                            {percentage.toFixed(1)}%
                          </Tag>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            <CheckCircleOutlined className="text-green-500 mr-1" />
                            {presentCount}
                          </span>
                          <span className="text-gray-600">
                            <CloseCircleOutlined className="text-red-500 mr-1" />
                            {totalCount - presentCount}
                          </span>
                          <span className="text-gray-600">
                            <UserOutlined className="mr-1" />
                            {totalCount}
                          </span>
                        </div>

                        {item.notes && (
                          <Text className="text-xs text-gray-500 mt-2 block">
                            {item.notes}
                          </Text>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : selectedClub ? (
              <Empty
                description="Davomat tarixi mavjud emas"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Empty
                description="To'garakni tanlang"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Attendance Modal */}
      <AttendanceModal
        visible={attendanceModalVisible}
        onClose={handleCloseModal}
        club={selectedClubData}
        date={selectedDate}
      />
    </div>
  );
}
