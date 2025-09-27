import { useState, useEffect } from "react";
import {
  Card,
  Select,
  Avatar,
  Tag,
  Typography,
  Input,
  Button,
  Space,
  Empty,
  Statistic,
  Modal,
  message,
  Popconfirm,
  notification,
  Row,
  Col,
  Drawer,
  Progress,
  Timeline,
  List,
  Tooltip,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  TeamOutlined,
  FilterOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useGetMyClubsQuery } from "../store/api/tutorApi";
import {
  useGetClubStudentsQuery,
  useRemoveStudentFromClubMutation,
} from "../store/api/clubApi";
import { useGetStudentAttendanceQuery } from "../store/api/attendanceApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatPhoneNumber } from "../utils/helpers";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/uz";

// Configure dayjs
dayjs.extend(customParseFormat);
dayjs.locale("uz");

const { Title, Text } = Typography;

// Student Attendance Modal Component
const StudentAttendanceModal = ({ visible, onClose, student, clubId }) => {
  const { data: attendanceData, isLoading } = useGetStudentAttendanceQuery(
    {
      studentId: student?._id,
      clubId: clubId,
    },
    { skip: !student?._id || !visible }
  );

  const attendance = attendanceData?.data?.attendance || [];
  const stats = attendanceData?.data?.statistics || {};

  const getAttendanceColor = (present) => {
    return present ? "#52c41a" : "#f5222d";
  };

  const getAttendanceIcon = (present) => {
    return present ? (
      <CheckCircleOutlined style={{ color: "#52c41a" }} />
    ) : (
      <CloseCircleOutlined style={{ color: "#f5222d" }} />
    );
  };

  // Helper function to parse and format date
  const parseAndFormatDate = (dateStr) => {
    if (!dateStr) return { formatted: "Noma'lum sana", dayName: "" };

    // If date is already in DD.MM.YYYY format (string from API)
    if (typeof dateStr === "string" && dateStr.includes(".")) {
      const parts = dateStr.split(".");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create a valid date for dayjs
        const parsedDate = dayjs(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
          "YYYY-MM-DD"
        );

        if (parsedDate.isValid()) {
          return {
            formatted: dateStr, // Keep original format
            dayName: parsedDate.format("dddd"),
          };
        }
      }
      return { formatted: dateStr, dayName: "" };
    }

    // Try to parse as ISO or other format
    const parsed = dayjs(dateStr);
    if (parsed.isValid()) {
      return {
        formatted: parsed.format("DD.MM.YYYY"),
        dayName: parsed.format("dddd"),
      };
    }

    // If still invalid, return the original string
    return { formatted: dateStr || "Noma'lum sana", dayName: "" };
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <Avatar
            src={student?.image}
            icon={!student?.image && <UserOutlined />}
            size="large"
            className="bg-purple-500"
          />
          <div>
            <Text className="text-lg font-medium block">
              {student?.full_name}
            </Text>
            <Text className="text-sm text-gray-500">
              {student?.student_id_number}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Button onClick={onClose} type="primary">
          Yopish
        </Button>
      }
      width={900}
      className="attendance-modal"
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {/* Statistics Cards */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <Card className="text-center border-0 bg-blue-50">
                <Statistic
                  title="Jami darslar"
                  value={stats.totalClasses || 0}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center border-0 bg-green-50">
                <Statistic
                  title="Kelgan"
                  value={stats.presentCount || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ fontSize: 20, color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center border-0 bg-red-50">
                <Statistic
                  title="Kelmagan"
                  value={stats.absentCount || 0}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ fontSize: 20, color: "#f5222d" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center border-0 bg-purple-50">
                <Statistic
                  title="Davomat"
                  value={stats.attendancePercentage || 0}
                  suffix="%"
                  valueStyle={{ fontSize: 20, color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Attendance Progress */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <Text className="font-medium mb-2 block">Davomat foizi</Text>
            <Progress
              percent={parseFloat(stats.attendancePercentage || 0)}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              status={
                stats.attendancePercentage >= 75 ? "success" : "exception"
              }
            />
          </div>

          {/* Attendance Timeline */}
          <div className="border rounded-lg p-4 bg-white">
            <Text className="font-semibold text-lg mb-4 block">
              Davomat tarixi
            </Text>
            {attendance.length > 0 ? (
              <div
                className="overflow-y-auto p-3"
                style={{
                  maxHeight: "450px",
                  minHeight: "350px",
                }}
              >
                <Timeline
                  items={attendance.map((record) => {
                    const dateInfo = parseAndFormatDate(
                      record.date || record.formattedDate || record.originalDate
                    );

                    return {
                      dot: getAttendanceIcon(record.present),
                      color: getAttendanceColor(record.present),
                      children: (
                        <div className="pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Text className="font-medium text-base block">
                                {dateInfo.formatted}
                              </Text>
                              {dateInfo.dayName && (
                                <Text className="text-sm text-gray-500">
                                  {dateInfo.dayName}
                                </Text>
                              )}
                            </div>
                            <Tag
                              color={record.present ? "success" : "error"}
                              icon={getAttendanceIcon(record.present)}
                              className="text-sm px-3 py-1"
                            >
                              {record.present ? "Kelgan" : "Kelmagan"}
                            </Tag>
                          </div>
                          {record.reason && (
                            <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <Text className="text-sm">
                                <InfoCircleOutlined className="mr-2 text-orange-500" />
                                <span className="font-medium">Sababi:</span>{" "}
                                {record.reason}
                              </Text>
                            </div>
                          )}
                        </div>
                      ),
                    };
                  })}
                />
              </div>
            ) : (
              <div className="py-12">
                <Empty description="Davomat ma'lumotlari mavjud emas" />
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

// Student Card Component
const StudentCard = ({
  student,
  onRemove,
  onViewAttendance,
  removing,
  isMobile,
}) => {
  const attendancePercentage = student.attendancePercentage || 0;
  const attendanceColor =
    attendancePercentage >= 90
      ? "success"
      : attendancePercentage >= 75
      ? "warning"
      : "error";

  return (
    <Card
      className="h-full hover:shadow-xl transition-all duration-300 border-0"
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
    >
      <div className="space-y-4">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4">
          <Avatar
            src={student.image}
            icon={!student.image && <UserOutlined />}
            size={isMobile ? 60 : 80}
            className="bg-gradient-to-r from-purple-500 to-pink-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Tooltip title={student.full_name}>
              <Text className="font-bold text-lg block truncate">
                {student.full_name}
              </Text>
            </Tooltip>
            <Text className="text-base text-gray-500">
              ID: {student.student_id_number}
            </Text>
            <div className="flex flex-wrap gap-2 mt-2">
              {student.group && (
                <Tag color="purple" icon={<TeamOutlined />} className="text-sm">
                  {student.group.name}
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Department Info */}
        {student.department && (
          <div className="bg-blue-50 rounded-lg p-3">
            <Text className="text-xs text-gray-500 block mb-1">Fakultet</Text>
            <Tooltip title={student.department.name}>
              <Text className="font-medium text-sm truncate block">
                {student.department.name}
              </Text>
            </Tooltip>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 border-t pt-3">
          {student.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <PhoneOutlined className="text-base" />
              <Text className="text-sm">
                {formatPhoneNumber(student.phone)}
              </Text>
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <MailOutlined className="text-base" />
              <Tooltip title={student.email}>
                <Text
                  className="text-sm truncate"
                  style={{ maxWidth: "280px" }}
                >
                  {student.email}
                </Text>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => onViewAttendance(student)}
            className="flex-1"
            size={isMobile ? "middle" : "large"}
          >
            Davomat ko'rish
          </Button>
          <Popconfirm
            title="Studentni chiqarish"
            description={`${student.full_name}ni to'garakdan chiqarishni tasdiqlaysizmi?`}
            onConfirm={() => onRemove(student)}
            okText="Ha"
            cancelText="Yo'q"
            okButtonProps={{ danger: true, loading: removing }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={removing}
              size={isMobile ? "middle" : "large"}
            >
              Chiqarish
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

// Filter Drawer Component for Mobile
const FilterDrawer = ({
  visible,
  onClose,
  clubs,
  selectedClub,
  setSelectedClub,
  clubsLoading,
}) => (
  <Drawer
    title="Filtrlar"
    placement="bottom"
    open={visible}
    onClose={onClose}
    height="auto"
  >
    <div className="space-y-4">
      <div>
        <Text className="block mb-2">To'garak tanlang</Text>
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

      <Button
        type="primary"
        block
        onClick={onClose}
        className="bg-purple-600 border-0"
      >
        Qo'llash
      </Button>
    </div>
  </Drawer>
);

// Main Students Component
export default function Students() {
  const location = useLocation();
  const [selectedClub, setSelectedClub] = useState(
    location.state?.clubId || null
  );
  const [searchText, setSearchText] = useState("");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isMobile = window.innerWidth < 768;

  // Real API calls
  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useGetClubStudentsQuery(selectedClub, {
    skip: !selectedClub,
  });

  const [removeStudentFromClub, { isLoading: removing }] =
    useRemoveStudentFromClubMutation();

  const clubs = clubsData?.data || [];
  const students = studentsData?.data || [];

  // Auto-select first club
  useEffect(() => {
    if (clubs.length > 0 && !selectedClub) {
      setSelectedClub(clubs[0]._id);
    }
  }, [clubs, selectedClub]);

  // Handle view attendance
  const handleViewAttendance = (student) => {
    setSelectedStudent(student);
    setAttendanceModalVisible(true);
  };

  // Remove student from club
  const handleRemoveStudent = async (student) => {
    try {
      const result = await removeStudentFromClub({
        clubId: selectedClub,
        studentId: student._id,
      }).unwrap();

      if (result.success) {
        message.success(`${student.full_name} to'garakdan chiqarildi`);

        notification.info({
          message: "Student xabardor qilindi",
          description: `${student.full_name}ga to'garakdan chiqarilganligi haqida xabar yuborildi`,
          placement: "topRight",
          icon: <ExclamationCircleOutlined style={{ color: "#108ee9" }} />,
        });

        refetchStudents();
      }
    } catch (error) {
      message.error(error?.data?.message || "Xatolik yuz berdi");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.student_id_number?.includes(searchText)
  );

  // Calculate statistics
  const statistics = {
    total: filteredStudents.length,
    averageAttendance:
      filteredStudents.length > 0
        ? (
            filteredStudents.reduce(
              (sum, s) => sum + (s.attendancePercentage || 0),
              0
            ) / filteredStudents.length
          ).toFixed(1)
        : 0,
    activeCount: filteredStudents.filter(
      (s) => (s.attendancePercentage || 0) >= 75
    ).length,
  };

  if (clubsLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Title level={3} className="!text-xl sm:!text-2xl !mb-0">
          Studentlar
        </Title>
        {isMobile && (
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
          >
            Filtr
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-md">
        <div className={`${isMobile ? "space-y-3" : "flex gap-4"} mb-4`}>
          {!isMobile && (
            <Select
              placeholder="To'garakni tanlang"
              style={{ width: 250 }}
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
          )}

          <Input
            placeholder="Student qidirish..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? "100%" : 300 }}
            size="large"
            allowClear
          />

          {selectedClub && (
            <div className="ml-auto flex items-center gap-2">
              <Tag color="purple" className="m-0">
                <BookOutlined className="mr-1" />
                {clubs.find((c) => c._id === selectedClub)?.name}
              </Tag>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {selectedClub && (
          <Row gutter={[12, 12]} className="mb-6">
            <Col xs={8} sm={8}>
              <Card
                className="text-center border border-purple-200 bg-purple-50"
                bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
              >
                <Statistic
                  title={
                    <Text className="text-xs sm:text-sm text-gray-600">
                      Jami
                    </Text>
                  }
                  value={statistics.total}
                  valueStyle={{
                    fontSize: isMobile ? 20 : 24,
                    color: "#722ed1",
                  }}
                />
              </Card>
            </Col>
            <Col xs={8} sm={8}>
              <Card
                className="text-center border border-green-200 bg-green-50"
                bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
              >
                <Statistic
                  title={
                    <Text className="text-xs sm:text-sm text-gray-600">
                      O'rtacha
                    </Text>
                  }
                  value={statistics.averageAttendance}
                  suffix="%"
                  valueStyle={{
                    fontSize: isMobile ? 20 : 24,
                    color: "#52c41a",
                  }}
                />
              </Card>
            </Col>
            <Col xs={8} sm={8}>
              <Card
                className="text-center border border-blue-200 bg-blue-50"
                bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
              >
                <Statistic
                  title={
                    <Text className="text-xs sm:text-sm text-gray-600">
                      Faol
                    </Text>
                  }
                  value={statistics.activeCount}
                  valueStyle={{
                    fontSize: isMobile ? 20 : 24,
                    color: "#1890ff",
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Students Grid */}
        {selectedClub ? (
          studentsLoading ? (
            <Row gutter={[16, 16]}>
              {[...Array(6)].map((_, i) => (
                <Col xs={24} sm={24} md={12} lg={12} xl={12} key={i}>
                  <Card loading={true} />
                </Col>
              ))}
            </Row>
          ) : filteredStudents.length > 0 ? (
            <Row gutter={[16, 16]} className="animate-fade-in">
              {filteredStudents.map((student) => (
                <Col xs={24} sm={24} md={12} lg={12} xl={12} key={student._id}>
                  <StudentCard
                    student={student}
                    onRemove={handleRemoveStudent}
                    onViewAttendance={handleViewAttendance}
                    removing={removing}
                    isMobile={isMobile}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                searchText
                  ? "Izlangan student topilmadi"
                  : "Bu to'garakda studentlar yo'q"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        ) : (
          <div className="text-center py-12">
            <TeamOutlined className="text-4xl mb-4 text-gray-300" />
            <Text className="text-gray-500 block">
              {isMobile
                ? "Filtr tugmasini bosing va to'garak tanlang"
                : "To'garakni tanlang"}
            </Text>
          </div>
        )}
      </Card>

      {/* Attendance Modal */}
      <StudentAttendanceModal
        visible={attendanceModalVisible}
        onClose={() => {
          setAttendanceModalVisible(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        clubId={selectedClub}
      />

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <FilterDrawer
          visible={filterDrawerVisible}
          onClose={() => setFilterDrawerVisible(false)}
          clubs={clubs}
          selectedClub={selectedClub}
          setSelectedClub={setSelectedClub}
          clubsLoading={clubsLoading}
        />
      )}
    </div>
  );
}
