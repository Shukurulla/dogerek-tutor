import { useState, useEffect } from "react";
import {
  Card,
  Select,
  Table,
  Avatar,
  Tag,
  Typography,
  Input,
  Badge,
  List,
  Drawer,
  Button,
  Space,
  Skeleton,
  Empty,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useGetMyClubsQuery } from "../store/api/tutorApi";
import { useGetClubStudentsQuery } from "../store/api/clubApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatPhoneNumber } from "../utils/helpers";

const { Title, Text } = Typography;

export default function Students() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const isMobile = window.innerWidth < 768;

  const { data: clubsData, isLoading: clubsLoading } = useGetMyClubsQuery();
  const { data: studentsData, isLoading: studentsLoading } =
    useGetClubStudentsQuery(selectedClub, { skip: !selectedClub });

  const clubs = clubsData?.data || [];
  const students = studentsData?.data || [];

  // Auto-select first club if available
  useEffect(() => {
    if (clubs.length > 0 && !selectedClub) {
      setSelectedClub(clubs[0]._id);
    }
  }, [clubs, selectedClub]);

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

  // Desktop table columns
  const columns = [
    {
      title: "Student",
      key: "student",
      fixed: isMobile ? false : "left",
      width: isMobile ? 150 : 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            size={isMobile ? "small" : "large"}
            className="bg-purple-500"
          />
          <div className="min-w-0">
            <Text className="font-medium block truncate">
              {record.full_name}
            </Text>
            <Text className="block text-xs text-gray-500">
              {record.student_id_number}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Guruh",
      dataIndex: ["group", "name"],
      key: "group",
      width: 120,
      render: (text) => <Tag color="purple">{text}</Tag>,
      responsive: ["md"],
    },
    {
      title: "Fakultet",
      dataIndex: ["department", "name"],
      key: "department",
      width: 150,
      render: (text) => (
        <Tag color="blue" className="truncate">
          {text}
        </Tag>
      ),
      responsive: ["lg"],
    },
    {
      title: "Kontakt",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          {record.phone && (
            <div className="flex items-center gap-1 text-gray-600">
              <PhoneOutlined className="text-xs" />
              <Text className="text-xs sm:text-sm">
                {formatPhoneNumber(record.phone)}
              </Text>
            </div>
          )}
          {record.email && (
            <div className="flex items-center gap-1 text-gray-600">
              <MailOutlined className="text-xs" />
              <Text className="text-xs sm:text-sm truncate">
                {record.email}
              </Text>
            </div>
          )}
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "Davomat",
      key: "attendance",
      width: 100,
      render: (_, record) => {
        const percentage = record.attendancePercentage || 0;
        const color =
          percentage >= 90 ? "success" : percentage >= 75 ? "warning" : "error";
        return <Badge status={color} text={`${percentage}%`} />;
      },
    },
  ];

  // Mobile student card
  const MobileStudentCard = ({ student }) => (
    <Card className="mb-3 shadow-sm" bodyStyle={{ padding: "12px" }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar
            src={student.image}
            icon={!student.image && <UserOutlined />}
            size="large"
            className="bg-purple-500"
          />
          <div className="flex-1 min-w-0">
            <Text className="font-medium block">{student.full_name}</Text>
            <Text className="text-xs text-gray-500">
              {student.student_id_number}
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              <Tag color="purple" className="text-xs m-0">
                {student.group?.name}
              </Tag>
              {student.attendancePercentage !== undefined && (
                <Tag
                  color={
                    student.attendancePercentage >= 90
                      ? "green"
                      : student.attendancePercentage >= 75
                      ? "orange"
                      : "red"
                  }
                  className="text-xs m-0"
                >
                  {student.attendancePercentage}%
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>

      {(student.phone || student.email) && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {student.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <PhoneOutlined className="text-xs" />
              <Text className="text-xs">
                {formatPhoneNumber(student.phone)}
              </Text>
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <MailOutlined className="text-xs" />
              <Text className="text-xs truncate">{student.email}</Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  // Filter drawer for mobile
  const FilterDrawer = () => (
    <Drawer
      title="Filtrlar"
      placement="bottom"
      open={filterDrawerVisible}
      onClose={() => setFilterDrawerVisible(false)}
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
                {club.name} (
                {club.totalStudents ||
                  club.enrolledStudents?.filter((e) => e.status === "active")
                    .length ||
                  0}{" "}
                ta)
              </Select.Option>
            ))}
          </Select>
        </div>

        <Button
          type="primary"
          block
          onClick={() => setFilterDrawerVisible(false)}
          className="bg-purple-600 border-0"
        >
          Qo'llash
        </Button>
      </div>
    </Drawer>
  );

  if (clubsLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex items-center justify-between">
        <Title level={3} className="!text-xl sm:!text-2xl !mb-0">
          Studentlar
        </Title>
        {isMobile && (
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
            className="lg:hidden"
          >
            Filtr
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-md">
        {/* Desktop filters */}
        <div
          className={`${isMobile ? "space-y-3" : "flex gap-4"} mb-4 sm:mb-6`}
        >
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
                  {club.name} (
                  {club.totalStudents ||
                    club.enrolledStudents?.filter((e) => e.status === "active")
                      .length ||
                    0}{" "}
                  ta)
                </Select.Option>
              ))}
            </Select>
          )}

          <Input
            placeholder="Qidirish..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? "100%" : 250 }}
            size="large"
          />
        </div>

        {selectedClub ? (
          <>
            {/* Statistics cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card
                className="border border-purple-200 bg-purple-50"
                bodyStyle={{ padding: "12px sm:padding" }}
              >
                <div className="text-center sm:flex sm:items-center sm:justify-between">
                  <div className="sm:text-left">
                    <Text className="text-gray-600 text-xs sm:text-sm">
                      Jami
                    </Text>
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                      {statistics.total}
                    </div>
                  </div>
                  <TeamOutlined className="hidden sm:block text-2xl sm:text-3xl text-purple-400" />
                </div>
              </Card>

              <Card
                className="border border-green-200 bg-green-50"
                bodyStyle={{ padding: "12px sm:padding" }}
              >
                <div className="text-center sm:flex sm:items-center sm:justify-between">
                  <div className="sm:text-left">
                    <Text className="text-gray-600 text-xs sm:text-sm">
                      O'rtacha
                    </Text>
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                      {statistics.averageAttendance}%
                    </div>
                  </div>
                  <CheckCircleOutlined className="hidden sm:block text-2xl sm:text-3xl text-green-400" />
                </div>
              </Card>

              <Card
                className="border border-blue-200 bg-blue-50"
                bodyStyle={{ padding: "12px sm:padding" }}
              >
                <div className="text-center sm:flex sm:items-center sm:justify-between">
                  <div className="sm:text-left">
                    <Text className="text-gray-600 text-xs sm:text-sm">
                      Faol
                    </Text>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                      {statistics.activeCount}
                    </div>
                  </div>
                  <UserOutlined className="hidden sm:block text-2xl sm:text-3xl text-blue-400" />
                </div>
              </Card>
            </div>

            {/* Students list/table */}
            {studentsLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : filteredStudents.length > 0 ? (
              isMobile ? (
                <div className="max-h-[60vh] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <MobileStudentCard key={student._id} student={student} />
                  ))}
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredStudents}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Jami: ${total} ta`,
                    responsive: true,
                  }}
                  scroll={{ x: "max-content" }}
                />
              )
            ) : (
              <Empty description="Studentlar topilmadi" />
            )}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <UserOutlined className="text-3xl sm:text-4xl mb-4 text-gray-300" />
            <Text className="text-gray-500">
              {isMobile
                ? "Filtr tugmasini bosing va to'garak tanlang"
                : "To'garakni tanlang"}
            </Text>
          </div>
        )}
      </Card>

      {isMobile && <FilterDrawer />}
    </div>
  );
}
