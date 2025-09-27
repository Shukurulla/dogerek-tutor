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
  Modal,
  Badge,
  Divider,
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
  EyeOutlined,
  TeamOutlined,
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

// View Attendance Modal Component
const ViewAttendanceModal = ({ visible, onClose, attendance, club, date }) => {
  if (!attendance) return null;

  const presentCount =
    attendance.students?.filter((s) => s.present).length || 0;
  const totalCount = attendance.students?.length || 0;
  const percentage =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <Modal
      title={
        <div>
          <Text className="text-lg font-medium">Davomat ko'rish</Text>
          <div className="text-sm text-gray-500 mt-1">
            {club?.name} - {date?.format("DD.MM.YYYY")}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Yopish
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Statistics */}
        <Row gutter={[12, 12]}>
          <Col span={8}>
            <Card className="text-center bg-green-50 border-0">
              <Statistic
                title="Kelgan"
                value={presentCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a", fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center bg-red-50 border-0">
              <Statistic
                title="Kelmagan"
                value={totalCount - presentCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d", fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center bg-blue-50 border-0">
              <Statistic
                title="Davomat"
                value={percentage}
                suffix="%"
                valueStyle={{ color: "#1890ff", fontSize: 20 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Students List */}
        <Card title="Studentlar ro'yxati" className="border-0">
          <List
            dataSource={attendance.students || []}
            renderItem={(item) => (
              <List.Item>
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={item.student?.image}
                      icon={!item.student?.image && <UserOutlined />}
                      className="bg-purple-500"
                    />
                    <div>
                      <Text className="font-medium block">
                        {item.student?.full_name || "Noma'lum"}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {item.student?.student_id_number || "-"}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.reason && (
                      <Tag color="orange" className="m-0">
                        {item.reason}
                      </Tag>
                    )}
                    <Tag
                      color={item.present ? "success" : "error"}
                      icon={
                        item.present ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                    >
                      {item.present ? "Kelgan" : "Kelmagan"}
                    </Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Additional Info */}
        {(attendance.notes || attendance.telegramPostLink) && (
          <Card title="Qo'shimcha ma'lumotlar" className="border-0">
            {attendance.telegramPostLink && (
              <div className="mb-3">
                <Text className="text-gray-500">Telegram post:</Text>
                <br />
                <a
                  href={attendance.telegramPostLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {attendance.telegramPostLink}
                </a>
              </div>
            )}
            {attendance.notes && (
              <div>
                <Text className="text-gray-500">Izoh:</Text>
                <br />
                <Text>{attendance.notes}</Text>
              </div>
            )}
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default function Attendance() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
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

  // Calendar cell click handler
  const handleDateCellClick = (date) => {
    setSelectedDate(date);

    if (!selectedClub) {
      message.warning("Avval to'garakni tanlang");
      return;
    }

    // Check if attendance exists for this date
    const existingAttendance = attendanceHistory.find((a) =>
      dayjs(a.date).isSame(date, "day")
    );

    if (existingAttendance) {
      // Show view modal if attendance exists
      setSelectedAttendance(existingAttendance);
      setViewModalVisible(true);
    } else {
      // Show mark attendance modal if no attendance
      if (date.isAfter(dayjs(), "day")) {
        message.warning("Kelajakdagi sanalar uchun davomat kiritib bo'lmaydi");
        return;
      }
      setAttendanceModalVisible(true);
    }
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

  // Calendar cell renderer - Compact version
  const dateCellRender = (value) => {
    const attendanceForDate = attendanceHistory.find((a) =>
      dayjs(a.date).isSame(value, "day")
    );

    const isPast = value.isBefore(dayjs(), "day");
    const isToday = value.isSame(dayjs(), "day");
    const isFuture = value.isAfter(dayjs(), "day");

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
        <div
          className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDateCellClick(value);
          }}
        >
          <Badge
            count={`${percentage.toFixed(0)}%`}
            style={{
              backgroundColor:
                color === "success"
                  ? "#52c41a"
                  : color === "warning"
                  ? "#faad14"
                  : "#f5222d",
            }}
          />
        </div>
      );
    }

    // Show clickable indicator for dates without attendance
    if (isPast || isToday) {
      return (
        <div
          className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-blue-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDateCellClick(value);
          }}
        >
          <Tooltip title="Davomat kiritish">
            <div className="w-6 h-6 rounded-full bg-gray-200 hover:bg-blue-200 flex items-center justify-center">
              <PlusOutlined className="text-xs text-gray-600" />
            </div>
          </Tooltip>
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
                      <TeamOutlined className="text-gray-400" />
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
              <Text className="text-sm text-gray-500">
                Davomat kiritish yoki ko'rish uchun kalendardagi sanani bosing
              </Text>
            </div>

            <Calendar
              value={selectedDate}
              onSelect={setSelectedDate}
              dateCellRender={dateCellRender}
              className="border rounded-lg custom-calendar"
              onPanelChange={(date) => {
                setDateRange({
                  startDate: date.startOf("month").format("YYYY-MM-DD"),
                  endDate: date.endOf("month").format("YYYY-MM-DD"),
                });
              }}
            />

            <style jsx>{`
              .custom-calendar .ant-picker-calendar-date {
                height: 60px !important;
                margin: 2px !important;
                padding: 4px !important;
              }
              .custom-calendar .ant-picker-calendar-date-content {
                height: 50px !important;
              }
            `}</style>
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
                  So'nggi {attendanceHistory.length} ta
                </Text>
              )
            }
          >
            {attendanceLoading ? (
              <LoadingSpinner size="small" />
            ) : attendanceHistory.length > 0 ? (
              <List
                dataSource={attendanceHistory.slice(0, 10)}
                renderItem={(item) => {
                  const presentCount = item.students.filter(
                    (s) => s.present
                  ).length;
                  const totalCount = item.students.length;
                  const percentage =
                    totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

                  return (
                    <List.Item
                      className="border-0 px-0 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedAttendance(item);
                        setViewModalVisible(true);
                      }}
                    >
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
                          <Space>
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
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAttendance(item);
                                setViewModalVisible(true);
                              }}
                            />
                          </Space>
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
                          <Text className="text-xs text-gray-500 mt-2 block truncate">
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

      {/* View Attendance Modal */}
      <ViewAttendanceModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedAttendance(null);
        }}
        attendance={selectedAttendance}
        club={selectedClubData}
        date={selectedDate}
      />
    </div>
  );
}
